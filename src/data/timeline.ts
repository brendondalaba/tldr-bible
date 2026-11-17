/*
 * When each book's events take place, for the Timeline tab.
 *
 * Years are numbers: negative = BC, positive = AD (there is no year 0).
 * Dates follow traditional conservative dating (e.g. an early Exodus c. 1446 BC)
 * and are approximate. Letters are placed when they were written, since that
 * is where they sit in the story. `note` explains a placement readers may see
 * dated differently elsewhere.
 *
 * Comparing two books: one comes BEFORE another if it ends before the other
 * starts; books whose spans overlap happened AROUND THE SAME TIME. When one
 * ends in the same year the next begins (Exodus → Leviticus, the Gospels →
 * Acts), their order in the Bible breaks the tie.
 */

export type BookSpan = {
  start: number;
  end: number;
  /** Shown instead of the generated date range, e.g. for Genesis. */
  label?: string;
  note?: string;
};

export const TIMELINE: Record<string, BookSpan> = {
  // ---- Law
  "01-genesis": {
    start: -100_000,
    end: -1805,
    label: "Creation to c. 1805 BC",
    note: "From creation to the death of Joseph in Egypt.",
  },
  "02-exodus": {
    start: -1800,
    end: -1445,
    label: "c. 1800–1445 BC",
    note: "From Israel's growth in Egypt to the tabernacle at Sinai; the Exodus itself is dated c. 1446 BC.",
  },
  "03-leviticus": { start: -1445, end: -1445 },
  "04-numbers": { start: -1445, end: -1406 },
  "05-deuteronomy": { start: -1406, end: -1406 },

  // ---- History
  "06-joshua": { start: -1406, end: -1375 },
  "07-judges": { start: -1375, end: -1050 },
  "08-ruth": {
    start: -1150,
    end: -1100,
    note: "Set during the time of the judges.",
  },
  "09-1-samuel": { start: -1105, end: -1010 },
  "10-2-samuel": { start: -1010, end: -970 },
  "11-1-kings": { start: -970, end: -853 },
  "12-2-kings": { start: -853, end: -561 },
  "13-1-chronicles": {
    start: -1010,
    end: -970,
    note: "Opens with family lines back to Adam, but its story is David's reign.",
  },
  "14-2-chronicles": { start: -970, end: -538 },
  "15-ezra": { start: -538, end: -457 },
  "16-nehemiah": { start: -445, end: -432 },
  "17-esther": { start: -483, end: -473 },

  // ---- Wisdom and poetry
  "18-job": {
    start: -2100,
    end: -1900,
    label: "c. 2100–1900 BC",
    note: "Traditionally placed in the age of the patriarchs; the book itself gives no date.",
  },
  "19-psalms": {
    start: -1440,
    end: -450,
    note: "Written over about 1,000 years, from Moses (Psalm 90) through the return from exile; most are David's.",
  },
  "20-proverbs": {
    start: -970,
    end: -931,
    note: "Mostly from Solomon's reign; some were collected later under King Hezekiah.",
  },
  "21-ecclesiastes": { start: -940, end: -931 },
  "22-song-of-solomon": { start: -970, end: -950 },

  // ---- Major prophets
  "23-isaiah": { start: -740, end: -681 },
  "24-jeremiah": { start: -627, end: -580 },
  "25-lamentations": { start: -586, end: -586 },
  "26-ezekiel": { start: -593, end: -571 },
  "27-daniel": { start: -605, end: -536 },

  // ---- Minor prophets
  "28-hosea": { start: -755, end: -715 },
  "29-joel": {
    start: -835,
    end: -796,
    note: "The book gives no date; this follows the traditional early dating.",
  },
  "30-amos": { start: -760, end: -755 },
  "31-obadiah": {
    start: -586,
    end: -583,
    note: "Most likely just after Jerusalem fell; some date it earlier.",
  },
  "32-jonah": { start: -785, end: -760 },
  "33-micah": { start: -735, end: -700 },
  "34-nahum": { start: -660, end: -650 },
  "35-habakkuk": { start: -609, end: -605 },
  "36-zephaniah": { start: -640, end: -621 },
  "37-haggai": { start: -520, end: -520 },
  "38-zechariah": { start: -520, end: -480 },
  "39-malachi": { start: -433, end: -420 },

  // ---- Gospels and Acts
  "40-matthew": { start: -6, end: 30 },
  "41-mark": { start: 26, end: 30 },
  "42-luke": { start: -7, end: 30 },
  "43-john": { start: 26, end: 30 },
  "44-acts": { start: 30, end: 62 },

  // ---- Letters (placed when written)
  "45-romans": { start: 57, end: 57 },
  "46-1-corinthians": { start: 55, end: 55 },
  "47-2-corinthians": { start: 56, end: 56 },
  "48-galatians": {
    start: 49,
    end: 49,
    note: "Some date it a few years later, after Paul's second journey.",
  },
  "49-ephesians": { start: 60, end: 62 },
  "50-philippians": { start: 61, end: 62 },
  "51-colossians": { start: 60, end: 62 },
  "52-1-thessalonians": { start: 51, end: 51 },
  "53-2-thessalonians": { start: 51, end: 52 },
  "54-1-timothy": { start: 63, end: 64 },
  "55-2-timothy": { start: 66, end: 67 },
  "56-titus": { start: 63, end: 64 },
  "57-philemon": { start: 60, end: 62 },
  "58-hebrews": { start: 64, end: 69 },
  "59-james": { start: 45, end: 49 },
  "60-1-peter": { start: 62, end: 64 },
  "61-2-peter": { start: 65, end: 68 },
  "62-1-john": { start: 85, end: 95 },
  "63-2-john": { start: 85, end: 95 },
  "64-3-john": { start: 85, end: 95 },
  "65-jude": { start: 65, end: 80 },
  "66-revelation": { start: 95, end: 95 },
};

function year(value: number): string {
  return value < 0 ? `${-value} BC` : `AD ${value}`;
}

/** e.g. "c. 1445–1406 BC", "c. AD 60–62", "c. 6 BC – AD 30". */
export function spanLabel(span: BookSpan): string {
  if (span.label) return span.label;
  const { start, end } = span;
  if (start === end) return `c. ${year(start)}`;
  if (start < 0 && end < 0) return `c. ${-start}–${-end} BC`;
  if (start > 0 && end > 0) return `c. AD ${start}–${end}`;
  return `c. ${year(start)} – ${year(end)}`;
}

export type Relation = "before" | "same" | "after";

/** The book's position in the Bible, from its id ("44-acts" → 44). */
function position(id: string): number {
  return Number.parseInt(id, 10);
}

/** Where `other` falls relative to `book`. */
export function relation(
  bookId: string,
  book: BookSpan,
  otherId: string,
  other: BookSpan
): Relation {
  if (other.end < book.start) return "before";
  if (other.start > book.end) return "after";
  const earlierInBible = position(otherId) < position(bookId);
  // Touching at one year: one story picks up where the other leaves off.
  if (other.end === book.start && other.start <= book.start && earlierInBible) {
    return "before";
  }
  if (other.start === book.end && other.end >= book.end && !earlierInBible) {
    return "after";
  }
  return "same";
}

/** Earliest first; ties go to whichever ends first. */
export function compareSpans(a: BookSpan, b: BookSpan): number {
  return a.start - b.start || a.end - b.end;
}
