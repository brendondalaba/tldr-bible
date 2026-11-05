import {
  createClient,
  type Session,
  type SupabaseClient,
} from "@supabase/supabase-js";

/*
 * Reading progress: which chapters of each book are read in the current
 * read-through, and every earlier read-through (with the date of each chapter).
 *
 * A read-through is finished once every chapter is checked; it stays finished
 * (and counts as a read) until the reader chooses "Read again", which files it
 * away and starts a fresh one. Books never reset on their own.
 *
 * Signed out ("guest"): saved in this browser only.
 * Signed in: saved to Supabase and synced across devices. Guest progress is
 * merged into the account on sign-in. A local copy is cached for instant paint.
 *
 * Sync: every change is applied on screen at once and added to a queue that is
 * saved on the device and sent to Supabase in order. If the phone is offline or
 * the request fails, the queue is kept and retried (on reconnect, when the app
 * comes back to the foreground, and on the next visit), so taps are never lost.
 * Coming back to the app also pulls changes made on other devices.
 *
 * Every page shares one store; UI subscribes and re-renders on change.
 */

export type ChapterRead = { chapter: number; readAt: string };
export type Completion = {
  id: string;
  completedAt: string;
  reads: ChapterRead[];
};
export type BookProgress = {
  /** chapter number → ISO date it was read, for the read-through in progress */
  current: Record<number, string>;
  /** oldest first */
  completions: Completion[];
};
export type Progress = Record<string, BookProgress>;

export type Account = { email: string; name: string } | null;

export type ReadingStats = {
  /** Distinct books finished at least once */
  booksFinished: number;
  /** Every finished read-through, across all books */
  timesFinished: number;
  /** Every chapter marked read, including past read-throughs */
  chaptersRead: number;
  /** Books with a read-through in progress, most recently read first */
  inProgress: { book: string; read: number; lastReadAt: string }[];
};

export type ProgressEvent =
  /** The last chapter of a read-through was checked. */
  | { type: "finished"; book: string; times: number }
  /** The reader chose "Read again"; `pass` is the new read-through number. */
  | { type: "restarted"; book: string; pass: number }
  | { type: "error"; message: string };

type Listener = () => void;
type EventListener = (event: ProgressEvent) => void;

const GUEST_KEY = "bs-progress-guest-v1";
const CACHE_KEY = "bs-progress-account-v1";
/** Which account the cache belongs to, so another account never sees it. */
const CACHE_OWNER_KEY = "bs-progress-account-owner-v1";
/** Changes not yet confirmed by the server, per account id. */
const QUEUE_KEY = "bs-progress-queue-v1";

/** Refresh from the server at most this often when the app regains focus. */
const REFRESH_MIN_MS = 10_000;
/** And every so often while the page stays open and visible. */
const REFRESH_EVERY_MS = 120_000;

type PendingChange =
  | { type: "check"; book: string; chapter: number; readAt: string }
  | { type: "uncheck"; book: string; chapter: number }
  | { type: "restart"; book: string }
  | { type: "undo-restart"; book: string };

export type SyncStatus = "guest" | "synced" | "syncing" | "pending";

/*
 * Public by design: the URL and publishable key ship to every visitor's browser.
 * Row-level security (supabase/migrations/) is what protects each reader's data.
 * PUBLIC_SUPABASE_* env vars override these, e.g. to point at a test project.
 */
const SUPABASE_URL: string =
  import.meta.env.PUBLIC_SUPABASE_URL ??
  "https://wxjbzztbtfbkxgqawsvh.supabase.co";
const SUPABASE_KEY: string =
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_wEiKEWeXPCg7yeCCLpBtZA_99tZLWYE";

// ---------- small helpers ----------

function readJson(key: string): Progress {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

function writeJson(key: string, value: Progress) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked; progress still works for this visit.
  }
}

function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function readText(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeText(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function readQueues(): Record<string, PendingChange[]> {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PendingChange[]>) : {};
  } catch {
    return {};
  }
}

function writeQueues(queues: Record<string, PendingChange[]>) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queues));
  } catch {}
}

/** Apply one change to progress, exactly as the server will. */
function applyChange(progress: Progress, change: PendingChange): Progress {
  const before = progress[change.book] ?? emptyBook();
  const current = { ...before.current };
  let next: BookProgress = before;

  if (change.type === "check") {
    current[change.chapter] = change.readAt;
    next = { ...before, current };
  } else if (change.type === "uncheck") {
    delete current[change.chapter];
    next = { ...before, current };
  } else if (change.type === "restart") {
    if (Object.keys(before.current).length === 0) return progress;
    const reads = Object.entries(before.current).map(([chapter, readAt]) => ({
      chapter: Number(chapter),
      readAt,
    }));
    next = {
      current: {},
      completions: [
        ...before.completions,
        { id: localId(), completedAt: new Date().toISOString(), reads },
      ],
    };
  } else {
    const last = before.completions.at(-1);
    if (!last || Object.keys(before.current).length > 0) return progress;
    const restored: Record<number, string> = {};
    for (const read of last.reads) restored[read.chapter] = read.readAt;
    next = { current: restored, completions: before.completions.slice(0, -1) };
  }
  return { ...progress, [change.book]: next };
}

/**
 * Errors worth retrying later: no connection, a timeout, or an expired login
 * that Supabase will refresh. Anything else (e.g. a rule the server enforces)
 * won't succeed on retry.
 */
function isRetryable(error: { code?: string; message?: string }): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }
  const code = error.code ?? "";
  return code === "" || code.startsWith("PGRST3") || code === "57014";
}

function emptyBook(): BookProgress {
  return { current: {}, completions: [] };
}

function localId(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isEmpty(progress: Progress): boolean {
  return Object.values(progress).every(
    book =>
      Object.keys(book.current).length === 0 && book.completions.length === 0
  );
}

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

// ---------- the store ----------

class ProgressStore {
  private progress: Progress = {};
  private account: Account = null;
  private ready = false;
  private listeners = new Set<Listener>();
  private eventListeners = new Set<EventListener>();
  private client: SupabaseClient | null = null;
  private googleEnabled: Promise<boolean> | undefined;
  private userId: string | null = null;
  private syncing = false;
  private syncAgain = false;
  private lastRefresh = 0;
  /** Set on sign-in: this device's signed-out progress still needs uploading. */
  private needsGuestImport = false;
  /** Session changes run one at a time so guest progress is imported once. */
  private sessionTask: Promise<void> = Promise.resolve();

  constructor() {
    if (SUPABASE_URL && SUPABASE_KEY) {
      this.client = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { flowType: "pkce", detectSessionInUrl: true },
      });
    }
    // Paint immediately from whatever is saved; the session check follows.
    this.progress = readJson(CACHE_KEY);
    if (isEmpty(this.progress)) this.progress = readJson(GUEST_KEY);
    void this.init();
  }

  // ----- reading -----

  get canSignIn(): boolean {
    return this.client !== null;
  }

  get isReady(): boolean {
    return this.ready;
  }

  getAccount(): Account {
    return this.account;
  }

  /** Changes on this device the server hasn't confirmed yet. */
  pendingCount(): number {
    return this.userId ? (readQueues()[this.userId]?.length ?? 0) : 0;
  }

  getSyncStatus(): SyncStatus {
    if (!this.account) return "guest";
    if (this.syncing) return "syncing";
    return this.pendingCount() > 0 ? "pending" : "synced";
  }

  hasProgress(): boolean {
    return !isEmpty(this.progress);
  }

  getStats(chapters: Record<string, number>): ReadingStats {
    const stats: ReadingStats = {
      booksFinished: 0,
      timesFinished: 0,
      chaptersRead: 0,
      inProgress: [],
    };
    for (const [book, progress] of Object.entries(this.progress)) {
      const current = Object.values(progress.current);
      const passes = passesFinished(progress, chapters[book] ?? 0);
      const finished = isFinished(progress, chapters[book] ?? 0);
      if (passes > 0) stats.booksFinished += 1;
      stats.timesFinished += passes;
      stats.chaptersRead +=
        current.length +
        progress.completions.reduce((sum, c) => sum + c.reads.length, 0);
      if (current.length > 0 && !finished) {
        stats.inProgress.push({
          book,
          read: current.length,
          lastReadAt: current.sort().at(-1) ?? "",
        });
      }
    }
    stats.inProgress.sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt));
    return stats;
  }

  /**
   * Whether Google sign-in is switched on for the Supabase project. Checked
   * before sending anyone to Google, so a half-finished setup shows a clear
   * message instead of a broken page.
   */
  async isGoogleEnabled(): Promise<boolean> {
    if (!this.client) return false;
    this.googleEnabled ??= fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_KEY },
    })
      .then(response => (response.ok ? response.json() : null))
      .then(settings => Boolean(settings?.external?.google))
      .catch(() => false);
    return this.googleEnabled;
  }

  getBook(book: string): BookProgress {
    return this.progress[book] ?? emptyBook();
  }

  /** Finished read-throughs, including a finished one not yet restarted. */
  timesRead(book: string, chapters: number): number {
    return passesFinished(this.getBook(book), chapters);
  }

  isFinished(book: string, chapters: number): boolean {
    return isFinished(this.getBook(book), chapters);
  }

  /** "Read again" can be undone until a chapter of the new read is checked. */
  canUndoRestart(book: string): boolean {
    const progress = this.getBook(book);
    return (
      progress.completions.length > 0 &&
      Object.keys(progress.current).length === 0
    );
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }

  private emit(event: ProgressEvent) {
    for (const listener of this.eventListeners) listener(event);
  }

  private save() {
    if (this.account && this.userId) {
      writeJson(CACHE_KEY, this.progress);
      writeText(CACHE_OWNER_KEY, this.userId);
    } else {
      writeJson(GUEST_KEY, this.progress);
    }
  }

  /** Apply a change now and, when signed in, queue it for the server. */
  private change(change: PendingChange) {
    this.progress = applyChange(this.progress, change);
    this.save();
    if (this.account && this.userId) {
      const queues = readQueues();
      queues[this.userId] = [...(queues[this.userId] ?? []), change];
      writeQueues(queues);
      void this.sync();
    }
    this.notify();
  }

  // ----- writing -----

  async toggleChapter(book: string, chapter: number, totalChapters: number) {
    const isRead = chapter in this.getBook(book).current;
    this.change(
      isRead
        ? { type: "uncheck", book, chapter }
        : { type: "check", book, chapter, readAt: new Date().toISOString() }
    );

    const after = this.getBook(book);
    if (!isRead && isFinished(after, totalChapters)) {
      this.emit({
        type: "finished",
        book,
        times: passesFinished(after, totalChapters),
      });
    }
  }

  /** "Read again": file away the finished read-through and start a new one. */
  async restartBook(book: string, totalChapters: number) {
    const before = this.getBook(book);
    if (!isFinished(before, totalChapters)) return;
    this.change({ type: "restart", book });
    this.emit({
      type: "restarted",
      book,
      pass: before.completions.length + 2,
    });
  }

  /** Undo "Read again": bring the finished read-through back. */
  async undoRestart(book: string) {
    if (!this.canUndoRestart(book)) return;
    this.change({ type: "undo-restart", book });
  }

  // ----- syncing -----

  /**
   * Send queued changes in order, then pull the latest from the server. Safe to
   * call any time; overlapping calls are merged.
   */
  async sync({ refresh = true } = {}) {
    if (!this.client || !this.account || !this.userId) return;
    if (this.syncing) {
      this.syncAgain = true;
      return;
    }
    this.syncing = true;
    this.notify();
    try {
      do {
        this.syncAgain = false;
        const sent = await this.flushQueue();
        if (sent && this.needsGuestImport) {
          await this.importGuestProgress();
          this.needsGuestImport = false;
        }
        if (sent && refresh) await this.reloadAll();
      } while (this.syncAgain);
    } catch (error) {
      this.emit({ type: "error", message: errorMessage(error) });
    } finally {
      this.syncing = false;
      this.notify();
    }
  }

  /**
   * Send this account's queued changes. Returns false if it stopped early
   * because the connection is down (the rest stay queued for next time).
   */
  private async flushQueue(): Promise<boolean> {
    const client = this.client;
    const userId = this.userId;
    if (!client || !userId) return false;

    while (true) {
      const queue = readQueues()[userId] ?? [];
      const next = queue[0];
      if (!next) return true;

      let result: { error: { code?: string; message?: string } | null };
      try {
        if (next.type === "check") {
          result = await client.from("chapter_reads").insert({
            book: next.book,
            chapter: next.chapter,
            read_at: next.readAt,
          });
          // Already checked (e.g. on another device): that's the goal anyway.
          if (result.error?.code === "23505") result = { error: null };
        } else if (next.type === "uncheck") {
          result = await client
            .from("chapter_reads")
            .delete()
            .eq("book", next.book)
            .eq("chapter", next.chapter)
            .is("completion_id", null);
        } else if (next.type === "restart") {
          result = await client.rpc("complete_book", { p_book: next.book });
        } else {
          result = await client.rpc("undo_last_completion", {
            p_book: next.book,
          });
        }
      } catch (error) {
        result = { error: { message: errorMessage(error) } };
      }

      if (result.error && isRetryable(result.error)) return false;
      if (result.error) {
        // The server won't accept this one (e.g. the book changed on another
        // device). Drop it; the refresh that follows shows the true state.
        this.emit({ type: "error", message: errorMessage(result.error) });
      }
      const queues = readQueues();
      queues[userId] = (queues[userId] ?? []).slice(1);
      if (queues[userId].length === 0) delete queues[userId];
      writeQueues(queues);
    }
  }

  /** Pull from the server when the app is opened again or reconnects. */
  private watchForChanges() {
    const refresh = (force = false) => {
      if (!this.account) return;
      if (!force && Date.now() - this.lastRefresh < REFRESH_MIN_MS) return;
      void this.sync();
    };
    window.addEventListener("online", () => refresh(true));
    window.addEventListener("focus", () => refresh());
    window.addEventListener("pageshow", event => {
      if (event.persisted) refresh(true);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refresh();
    });
    window.setInterval(() => {
      if (document.visibilityState === "visible") refresh(true);
    }, REFRESH_EVERY_MS);
  }

  // ----- accounts -----

  /** Sends the reader to Google, then back to `returnTo` (default: here). */
  async signIn(returnTo = window.location.href.split("#")[0]) {
    if (!this.client) return;
    const redirectTo = new URL(returnTo, window.location.origin).href;
    const { error } = await this.client.auth.signInWithOAuth({
      provider: "google",
      // Always ask which Google account, so nobody lands in the wrong one.
      options: { redirectTo, queryParams: { prompt: "select_account" } },
    });
    if (error) this.emit({ type: "error", message: errorMessage(error) });
  }

  async signOut() {
    if (!this.client) return;
    await this.client.auth.signOut();
  }

  /**
   * Permanently delete the signed-in account and all of its reading progress,
   * then clear everything this app saved on this device. Throws on failure so
   * the page can say so; nothing local is cleared unless the server delete
   * succeeded.
   */
  async deleteAccount() {
    if (!this.client || !this.account) return;
    const { error } = await this.client.rpc("delete_my_account");
    if (error) throw new Error(errorMessage(error));

    removeKey(CACHE_KEY);
    removeKey(CACHE_OWNER_KEY);
    removeKey(GUEST_KEY);
    if (this.userId) {
      const queues = readQueues();
      delete queues[this.userId];
      writeQueues(queues);
    }
    // The account is gone; signOut can fail server-side, so clear locally too.
    await this.client.auth.signOut({ scope: "local" });
    this.account = null;
    this.userId = null;
    this.progress = {};
    this.notify();
  }

  private async init() {
    if (!this.client) {
      this.ready = true;
      this.notify();
      return;
    }

    // Listen first, so "back online" isn't missed while the first sync waits.
    this.watchForChanges();
    const { data } = await this.client.auth.getSession();
    await this.queueSession(data.session);

    this.client.auth.onAuthStateChange((event, session) => {
      const changedUser = (session?.user.id ?? null) !== this.userId;
      if (event === "SIGNED_OUT" || (event === "SIGNED_IN" && changedUser)) {
        // Run outside the auth callback, as Supabase recommends.
        setTimeout(() => void this.queueSession(session), 0);
      }
    });

    // Tidy the ?code= that Google sign-in returns with.
    const url = new URL(window.location.href);
    if (url.searchParams.has("code")) {
      url.searchParams.delete("code");
      history.replaceState(history.state, "", url);
    }
  }

  private queueSession(session: Session | null): Promise<void> {
    this.sessionTask = this.sessionTask.then(() => this.handleSession(session));
    return this.sessionTask;
  }

  private async handleSession(session: Session | null) {
    if (!session) {
      const wasSignedIn = this.account !== null;
      this.account = null;
      this.userId = null;
      if (wasSignedIn) {
        removeKey(CACHE_KEY);
        removeKey(CACHE_OWNER_KEY);
      }
      this.progress = readJson(GUEST_KEY);
      this.ready = true;
      this.notify();
      return;
    }

    const meta = session.user.user_metadata as Record<string, unknown>;
    this.userId = session.user.id;
    this.account = {
      email: session.user.email ?? "",
      name: String(meta.full_name ?? meta.name ?? session.user.email ?? ""),
    };

    // A different account's cached progress must never show, even briefly.
    if (readText(CACHE_OWNER_KEY) !== this.userId) {
      removeKey(CACHE_KEY);
      this.progress = {};
    } else {
      this.progress = readJson(CACHE_KEY);
    }
    this.replayQueue();
    this.notify();

    // Show what we have right away; the server catches up behind it.
    this.ready = true;
    this.needsGuestImport = true;
    await this.sync();
  }

  /** Show queued (not yet confirmed) changes on top of what we have. */
  private replayQueue() {
    if (!this.userId) return;
    for (const change of readQueues()[this.userId] ?? []) {
      this.progress = applyChange(this.progress, change);
    }
  }

  private async importGuestProgress() {
    const guest = readJson(GUEST_KEY);
    if (!this.client || isEmpty(guest)) return;

    const payload = {
      current: Object.entries(guest).flatMap(([book, progress]) =>
        Object.entries(progress.current).map(([chapter, readAt]) => ({
          book,
          chapter: Number(chapter),
          read_at: readAt,
        }))
      ),
      completions: Object.entries(guest).flatMap(([book, progress]) =>
        progress.completions.map(completion => ({
          book,
          completed_at: completion.completedAt,
          reads: completion.reads.map(read => ({
            chapter: read.chapter,
            read_at: read.readAt,
          })),
        }))
      ),
    };

    const { error } = await this.client.rpc("import_progress", {
      p_payload: payload,
    });
    if (error) throw error;
    removeKey(GUEST_KEY);
  }

  private async reloadAll() {
    const userId = this.userId;
    const fresh = await this.fetchProgress();
    if (!this.account || this.userId !== userId) return; // signed out meanwhile
    this.progress = fresh;
    this.replayQueue();
    this.lastRefresh = Date.now();
    this.save();
    this.notify();
  }

  /** Reads every row for this user (paged; the API returns 1,000 at a time). */
  private async fetchProgress(): Promise<Progress> {
    if (!this.client) return {};
    const PAGE = 1000;

    type CompletionRow = { id: string; book: string; completed_at: string };
    type ReadRow = {
      book: string;
      chapter: number;
      read_at: string;
      completion_id: string | null;
    };

    const completions: CompletionRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const query = this.client
        .from("book_completions")
        .select("id, book, completed_at")
        .order("completed_at")
        .range(from, from + PAGE - 1);
      const { data, error } = await query;
      if (error) throw error;
      completions.push(...(data as CompletionRow[]));
      if (!data || data.length < PAGE) break;
    }

    const reads: ReadRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const query = this.client
        .from("chapter_reads")
        .select("book, chapter, read_at, completion_id")
        .order("read_at")
        .range(from, from + PAGE - 1);
      const { data, error } = await query;
      if (error) throw error;
      reads.push(...(data as ReadRow[]));
      if (!data || data.length < PAGE) break;
    }

    const result: Progress = {};
    const byId = new Map<string, Completion>();
    for (const row of completions) {
      const completion = {
        id: row.id,
        completedAt: row.completed_at,
        reads: [],
      };
      byId.set(row.id, completion);
      result[row.book] ??= emptyBook();
      result[row.book].completions.push(completion);
    }
    for (const row of reads) {
      result[row.book] ??= emptyBook();
      const read = { chapter: row.chapter, readAt: row.read_at };
      if (row.completion_id) byId.get(row.completion_id)?.reads.push(read);
      else result[row.book].current[row.chapter] = row.read_at;
    }
    return result;
  }
}

/** Every chapter of the current read-through is checked. */
export function isFinished(progress: BookProgress, chapters: number): boolean {
  return chapters > 0 && Object.keys(progress.current).length >= chapters;
}

/** Earlier read-throughs plus the current one if it's finished. */
export function passesFinished(
  progress: BookProgress,
  chapters: number
): number {
  return progress.completions.length + (isFinished(progress, chapters) ? 1 : 0);
}

export type BibleProgress = {
  /** Times every book of the Bible has been finished */
  timesRead: number;
  /** Chapters counted toward the read-through in progress */
  read: number;
  total: number;
  /** Same, per group of books (e.g. Old and New Testament) */
  groups: Record<string, { read: number; total: number }>;
};

/**
 * Progress through the whole Bible. Round N is complete once every book has
 * been read through N times. Within the current round, a book already read
 * through more times than the round counts in full; otherwise the chapters of
 * its current read-through count. Rereading one book never lowers the total.
 *
 * `books` maps each book to its chapter count and (optional) group name.
 */
export function bibleProgress(
  getBook: (book: string) => BookProgress,
  books: Record<string, { chapters: number; group?: string }>
): BibleProgress {
  const entries = Object.entries(books);
  const timesRead = Math.min(
    ...entries.map(([book, { chapters }]) =>
      passesFinished(getBook(book), chapters)
    )
  );
  const result: BibleProgress = {
    timesRead: Number.isFinite(timesRead) ? timesRead : 0,
    read: 0,
    total: 0,
    groups: {},
  };

  for (const [book, { chapters, group }] of entries) {
    const progress = getBook(book);
    const read =
      passesFinished(progress, chapters) > result.timesRead
        ? chapters
        : Math.min(Object.keys(progress.current).length, chapters);
    result.read += read;
    result.total += chapters;
    if (group) {
      result.groups[group] ??= { read: 0, total: 0 };
      result.groups[group].read += read;
      result.groups[group].total += chapters;
    }
  }
  return result;
}

let store: ProgressStore | undefined;

/** The one shared store for the page. */
export function getProgressStore(): ProgressStore {
  store ??= new ProgressStore();
  return store;
}

export type { ProgressStore };
