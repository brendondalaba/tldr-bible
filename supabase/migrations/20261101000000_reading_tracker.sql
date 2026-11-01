-- Bible Sidekick reading tracker.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Reference data: the 66 books and their chapters (public, read-only).
create table public.books (
  slug text primary key,           -- matches the site's content id, e.g. '44-acts'
  title text not null,
  position smallint not null unique check (position between 1 and 66),
  chapters smallint not null check (chapters > 0)
);

create table public.chapters (
  book text not null references public.books (slug) on delete cascade,
  chapter smallint not null check (chapter > 0),
  primary key (book, chapter)
);

-- One row per finished read-through of a book.
create table public.book_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  book text not null references public.books (slug),
  completed_at timestamptz not null default now()
);

-- One row per chapter marked read. completion_id is null for the read-through
-- in progress; finishing a book stamps its rows with the completion's id, so
-- every chapter keeps the date it was read.
create table public.chapter_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  book text not null,
  chapter smallint not null,
  read_at timestamptz not null default now(),
  completion_id uuid references public.book_completions (id) on delete set null,
  foreign key (book, chapter) references public.chapters (book, chapter)
);

-- A chapter can only be "current" once per user and book.
create unique index chapter_reads_current_unique
  on public.chapter_reads (user_id, book, chapter)
  where completion_id is null;
create index chapter_reads_user_book on public.chapter_reads (user_id, book);
create index chapter_reads_completion on public.chapter_reads (completion_id);
create index book_completions_user_book
  on public.book_completions (user_id, book, completed_at desc);

-- Row-level security: reference tables are readable by everyone;
-- progress is visible and editable only by its owner.
alter table public.books enable row level security;
alter table public.chapters enable row level security;
alter table public.book_completions enable row level security;
alter table public.chapter_reads enable row level security;

create policy "Books are public" on public.books
  for select to anon, authenticated using (true);
create policy "Chapters are public" on public.chapters
  for select to anon, authenticated using (true);

create policy "Read own completions" on public.book_completions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Add own completions" on public.book_completions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Delete own completions" on public.book_completions
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Read own chapter reads" on public.chapter_reads
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Add own chapter reads" on public.chapter_reads
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own chapter reads" on public.chapter_reads
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Delete own chapter reads" on public.chapter_reads
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Finish a book: requires every chapter in the current read-through.
-- Records the completion and clears the checkmarks for the next read.
create function public.complete_book(p_book text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_needed smallint;
  v_have integer;
  v_completion uuid;
begin
  select chapters into v_needed from public.books where slug = p_book;
  if v_needed is null then
    raise exception 'Unknown book %', p_book;
  end if;

  select count(*) into v_have
  from public.chapter_reads
  where user_id = auth.uid() and book = p_book and completion_id is null;

  if v_have < v_needed then
    raise exception 'Book % is not finished (% of % chapters)', p_book, v_have, v_needed;
  end if;

  insert into public.book_completions (book) values (p_book)
  returning id into v_completion;

  update public.chapter_reads
  set completion_id = v_completion
  where user_id = auth.uid() and book = p_book and completion_id is null;

  return v_completion;
end;
$$;

-- Undo the most recent completion of a book (for a mistaken tap). Only allowed
-- before a new read-through has started. Restores the previous checkmarks minus
-- the chapter that finished the book.
create function public.undo_last_completion(p_book text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_completion uuid;
  v_last uuid;
begin
  if exists (
    select 1 from public.chapter_reads
    where user_id = auth.uid() and book = p_book and completion_id is null
  ) then
    raise exception 'A new read-through of % has already started', p_book;
  end if;

  select id into v_completion
  from public.book_completions
  where user_id = auth.uid() and book = p_book
  order by completed_at desc
  limit 1;

  if v_completion is null then
    raise exception 'No completed read of % to undo', p_book;
  end if;

  select id into v_last
  from public.chapter_reads
  where completion_id = v_completion
  order by read_at desc
  limit 1;

  delete from public.book_completions where id = v_completion; -- reads revert to current
  delete from public.chapter_reads where id = v_last;
end;
$$;

-- Merge progress made while signed out into the account, skipping chapters the
-- account already has in its current read-through. Payload shape:
-- { "current": [{book, chapter, read_at}],
--   "completions": [{book, completed_at, reads: [{chapter, read_at}]}] }
create function public.import_progress(p_payload jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item jsonb;
  v_completion uuid;
begin
  for v_item in
    select * from jsonb_array_elements(coalesce(p_payload -> 'completions', '[]'::jsonb))
  loop
    insert into public.book_completions (book, completed_at)
    values (v_item ->> 'book', (v_item ->> 'completed_at')::timestamptz)
    returning id into v_completion;

    insert into public.chapter_reads (book, chapter, read_at, completion_id)
    select v_item ->> 'book', (r ->> 'chapter')::smallint,
      (r ->> 'read_at')::timestamptz, v_completion
    from jsonb_array_elements(coalesce(v_item -> 'reads', '[]'::jsonb)) as r;
  end loop;

  insert into public.chapter_reads (book, chapter, read_at)
  select c ->> 'book', (c ->> 'chapter')::smallint, (c ->> 'read_at')::timestamptz
  from jsonb_array_elements(coalesce(p_payload -> 'current', '[]'::jsonb)) as c
  on conflict (user_id, book, chapter) where completion_id is null do nothing;
end;
$$;

revoke execute on function public.complete_book(text) from public, anon;
revoke execute on function public.undo_last_completion(text) from public, anon;
revoke execute on function public.import_progress(jsonb) from public, anon;
grant execute on function public.complete_book(text) to authenticated;
grant execute on function public.undo_last_completion(text) to authenticated;
grant execute on function public.import_progress(jsonb) to authenticated;

-- Seed: generated from src/content/bible/*.md (title and chapters frontmatter).
insert into public.books (slug, title, position, chapters) values
  ('01-genesis', 'Genesis', 1, 50),
  ('02-exodus', 'Exodus', 2, 40),
  ('03-leviticus', 'Leviticus', 3, 27),
  ('04-numbers', 'Numbers', 4, 36),
  ('05-deuteronomy', 'Deuteronomy', 5, 34),
  ('06-joshua', 'Joshua', 6, 24),
  ('07-judges', 'Judges', 7, 21),
  ('08-ruth', 'Ruth', 8, 4),
  ('09-1-samuel', '1 Samuel', 9, 31),
  ('10-2-samuel', '2 Samuel', 10, 24),
  ('11-1-kings', '1 Kings', 11, 22),
  ('12-2-kings', '2 Kings', 12, 25),
  ('13-1-chronicles', '1 Chronicles', 13, 29),
  ('14-2-chronicles', '2 Chronicles', 14, 36),
  ('15-ezra', 'Ezra', 15, 10),
  ('16-nehemiah', 'Nehemiah', 16, 13),
  ('17-esther', 'Esther', 17, 10),
  ('18-job', 'Job', 18, 42),
  ('19-psalms', 'Psalms', 19, 150),
  ('20-proverbs', 'Proverbs', 20, 31),
  ('21-ecclesiastes', 'Ecclesiastes', 21, 12),
  ('22-song-of-solomon', 'Song of Solomon', 22, 8),
  ('23-isaiah', 'Isaiah', 23, 66),
  ('24-jeremiah', 'Jeremiah', 24, 52),
  ('25-lamentations', 'Lamentations', 25, 5),
  ('26-ezekiel', 'Ezekiel', 26, 48),
  ('27-daniel', 'Daniel', 27, 12),
  ('28-hosea', 'Hosea', 28, 14),
  ('29-joel', 'Joel', 29, 3),
  ('30-amos', 'Amos', 30, 9),
  ('31-obadiah', 'Obadiah', 31, 1),
  ('32-jonah', 'Jonah', 32, 4),
  ('33-micah', 'Micah', 33, 7),
  ('34-nahum', 'Nahum', 34, 3),
  ('35-habakkuk', 'Habakkuk', 35, 3),
  ('36-zephaniah', 'Zephaniah', 36, 3),
  ('37-haggai', 'Haggai', 37, 2),
  ('38-zechariah', 'Zechariah', 38, 14),
  ('39-malachi', 'Malachi', 39, 4),
  ('40-matthew', 'Matthew', 40, 28),
  ('41-mark', 'Mark', 41, 16),
  ('42-luke', 'Luke', 42, 24),
  ('43-john', 'John', 43, 21),
  ('44-acts', 'Acts', 44, 28),
  ('45-romans', 'Romans', 45, 16),
  ('46-1-corinthians', '1 Corinthians', 46, 16),
  ('47-2-corinthians', '2 Corinthians', 47, 13),
  ('48-galatians', 'Galatians', 48, 6),
  ('49-ephesians', 'Ephesians', 49, 6),
  ('50-philippians', 'Philippians', 50, 4),
  ('51-colossians', 'Colossians', 51, 4),
  ('52-1-thessalonians', '1 Thessalonians', 52, 5),
  ('53-2-thessalonians', '2 Thessalonians', 53, 3),
  ('54-1-timothy', '1 Timothy', 54, 6),
  ('55-2-timothy', '2 Timothy', 55, 4),
  ('56-titus', 'Titus', 56, 3),
  ('57-philemon', 'Philemon', 57, 1),
  ('58-hebrews', 'Hebrews', 58, 13),
  ('59-james', 'James', 59, 5),
  ('60-1-peter', '1 Peter', 60, 5),
  ('61-2-peter', '2 Peter', 61, 3),
  ('62-1-john', '1 John', 62, 5),
  ('63-2-john', '2 John', 63, 1),
  ('64-3-john', '3 John', 64, 1),
  ('65-jude', 'Jude', 65, 1),
  ('66-revelation', 'Revelation', 66, 22);

insert into public.chapters (book, chapter)
select slug, generate_series(1, chapters) from public.books;
