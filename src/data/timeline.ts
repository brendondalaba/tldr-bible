/*
 * When each book's events take place, for the Timeline tab.
 *
 * Years are numbers: negative = BC, positive = AD (there is no year 0).
 * Dates follow traditional conservative dating (e.g. an early Exodus c. 1446 BC)
 * and are approximate. Letters are placed when they were written, since that
 * is where they sit in the story. Every book has a one-sentence `note` on what
 * its dates cover, and where a placement is debated, what readers may see
 * elsewhere.
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
  "03-leviticus": {
    start: -1445,
    end: -1445,
    note: "Given at Mount Sinai in about a month, between the tabernacle's completion and the census that opens Numbers (Exodus 40:17; Numbers 1:1).",
  },
  "04-numbers": {
    start: -1445,
    end: -1406,
    note: "From the census at Sinai to the plains of Moab, as a faithless generation wandered nearly 40 years in the wilderness.",
  },
  "05-deuteronomy": {
    start: -1406,
    end: -1406,
    note: "Moses' farewell speeches on the plains of Moab in the last weeks of his life, just before Israel crossed the Jordan.",
  },

  // ---- History
  "06-joshua": {
    start: -1406,
    end: -1375,
    note: "From crossing the Jordan and the fall of Jericho to Joshua's death, as Israel settled the Promised Land.",
  },
  "07-judges": {
    start: -1375,
    end: -1050,
    note: "From Joshua's death to the eve of Israel's first king, as the nation turned from God, cried out, and was rescued again and again.",
  },
  "08-ruth": {
    start: -1150,
    end: -1100,
    note: "Set during the time of the judges.",
  },
  "09-1-samuel": {
    start: -1105,
    end: -1010,
    note: "From Samuel's birth to Saul's death, as Israel moved from judges to kings and David rose.",
  },
  "10-2-samuel": {
    start: -1010,
    end: -970,
    note: "From Saul's death through David's 40-year reign over Judah and then all Israel.",
  },
  "11-1-kings": {
    start: -970,
    end: -853,
    note: "From Solomon's reign and the temple to the kingdom splitting in two and Elijah's ministry under King Ahab.",
  },
  "12-2-kings": {
    start: -853,
    end: -561,
    note: "From Elijah's departure to the fall of Israel to Assyria and Judah to Babylon, ending with King Jehoiachin released in exile.",
  },
  "13-1-chronicles": {
    start: -1010,
    end: -970,
    note: "Opens with family lines back to Adam, but its story is David's reign.",
  },
  "14-2-chronicles": {
    start: -970,
    end: -538,
    note: "From Solomon's reign through Judah's kings and the exile, ending with Cyrus's decree to rebuild the temple.",
  },
  "15-ezra": {
    start: -538,
    end: -457,
    note: "From the first return from Babylon under Zerubbabel to Ezra's arrival in Jerusalem to teach God's law.",
  },
  "16-nehemiah": {
    start: -445,
    end: -432,
    note: "From Nehemiah's return to rebuild Jerusalem's walls to his reforms after a later trip back to the Persian court (Nehemiah 13:6).",
  },
  "17-esther": {
    start: -483,
    end: -473,
    note: "Set in Persia under King Xerxes, between the temple's rebuilding (Ezra 6) and Ezra's journey to Jerusalem (Ezra 7).",
  },

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
  "21-ecclesiastes": {
    start: -940,
    end: -931,
    note: 'Traditionally written by Solomon late in his reign, looking back on what lasts and what doesn\'t "under the sun."',
  },
  "22-song-of-solomon": {
    start: -970,
    end: -950,
    note: "From Solomon's early reign, before his many marriages turned his heart from God (1 Kings 11:4).",
  },

  // ---- Major prophets
  "23-isaiah": {
    start: -740,
    end: -681,
    note: "From the year King Uzziah died through Hezekiah's reign, as Assyria threatened Judah; his prophecies reach ahead to the exile and the Messiah.",
  },
  "24-jeremiah": {
    start: -627,
    end: -580,
    note: "From King Josiah's 13th year through Jerusalem's fall to Babylon and its aftermath (Jeremiah 1:2).",
  },
  "25-lamentations": {
    start: -586,
    end: -586,
    note: "Mourns Jerusalem's fall to Babylon and the burning of the temple, written soon after it happened.",
  },
  "26-ezekiel": {
    start: -593,
    end: -571,
    note: "A priest taken captive to Babylon, who prophesied there from the fifth year of exile, before and after Jerusalem fell (Ezekiel 1:2).",
  },
  "27-daniel": {
    start: -605,
    end: -536,
    note: "From Daniel being taken to Babylon as a young man to the third year of Cyrus of Persia, spanning the whole exile (Daniel 10:1).",
  },

  // ---- Minor prophets
  "28-hosea": {
    start: -755,
    end: -715,
    note: "Prophesied to Israel's northern kingdom in its final decades, as it slid toward its fall to Assyria in 722 BC.",
  },
  "29-joel": {
    start: -835,
    end: -796,
    note: "The book gives no date; this follows the traditional early dating.",
  },
  "30-amos": {
    start: -760,
    end: -755,
    note: "A shepherd from Judah sent to Israel's northern kingdom under Jeroboam II, two years before the earthquake (Amos 1:1).",
  },
  "31-obadiah": {
    start: -586,
    end: -583,
    note: "Most likely just after Jerusalem fell; some date it earlier.",
  },
  "32-jonah": {
    start: -785,
    end: -760,
    note: "Set under Jeroboam II, when Nineveh was the capital of Assyria, Israel's feared enemy (2 Kings 14:25).",
  },
  "33-micah": {
    start: -735,
    end: -700,
    note: "Prophesied in Judah under Jotham, Ahaz and Hezekiah, alongside Isaiah, as Samaria fell to Assyria (Micah 1:1).",
  },
  "34-nahum": {
    start: -660,
    end: -650,
    note: "After Assyria destroyed Thebes in 663 BC (Nahum 3:8) and before Nineveh fell in 612 BC.",
  },
  "35-habakkuk": {
    start: -609,
    end: -605,
    note: "Just before Babylon invaded Judah, as the Babylonians rose to power (Habakkuk 1:6).",
  },
  "36-zephaniah": {
    start: -640,
    end: -621,
    note: "Under King Josiah, likely before his reforms, as judgment on Judah drew near (Zephaniah 1:1).",
  },
  "37-haggai": {
    start: -520,
    end: -520,
    note: "Four messages in 520 BC urging the returned exiles to finish rebuilding the temple.",
  },
  "38-zechariah": {
    start: -520,
    end: -480,
    note: "Began alongside Haggai in 520 BC; the later chapters likely come from after the temple was finished in 516 BC.",
  },
  "39-malachi": {
    start: -433,
    end: -420,
    note: "Around Nehemiah's time, after the temple and walls were rebuilt; the last Old Testament prophet, about 400 years before John the Baptist.",
  },

  // ---- Gospels and Acts
  "40-matthew": {
    start: -6,
    end: 30,
    note: "From Jesus' birth, before King Herod died in 4 BC, to His resurrection and the Great Commission.",
  },
  "41-mark": {
    start: 26,
    end: 30,
    note: "From John the Baptist and Jesus' baptism through His ministry to the cross and the empty tomb.",
  },
  "42-luke": {
    start: -7,
    end: 30,
    note: "From the announcement of John the Baptist's birth to Jesus' ascension.",
  },
  "43-john": {
    start: 26,
    end: 30,
    note: "Opens with the Word before creation, then follows Jesus' ministry across several Passovers to His resurrection.",
  },
  "44-acts": {
    start: 30,
    end: 62,
    note: "From Jesus' ascension and the outpouring of the Holy Spirit at Pentecost to Paul under house arrest in Rome.",
  },

  // ---- Letters (placed when written)
  "45-romans": {
    start: 57,
    end: 57,
    note: "Written from Corinth near the end of Paul's third missionary journey, before he took the offering to Jerusalem (Romans 15:25).",
  },
  "46-1-corinthians": {
    start: 55,
    end: 55,
    note: "Written from Ephesus during Paul's third missionary journey (1 Corinthians 16:8).",
  },
  "47-2-corinthians": {
    start: 56,
    end: 56,
    note: "Written from Macedonia about a year after 1 Corinthians, still on Paul's third journey (2 Corinthians 7:5).",
  },
  "48-galatians": {
    start: 49,
    end: 49,
    note: "Some date it a few years later, after Paul's second journey.",
  },
  "49-ephesians": {
    start: 60,
    end: 62,
    note: "One of Paul's prison letters, written during his first imprisonment in Rome and carried by Tychicus (Ephesians 6:21).",
  },
  "50-philippians": {
    start: 61,
    end: 62,
    note: "Written from prison in Rome, likely late in that first imprisonment as Paul awaited a verdict (Philippians 1:19–26).",
  },
  "51-colossians": {
    start: 60,
    end: 62,
    note: "Written from prison in Rome and sent with Tychicus and Onesimus, along with Philemon (Colossians 4:7–9).",
  },
  "52-1-thessalonians": {
    start: 51,
    end: 51,
    note: "Written from Corinth on Paul's second journey, only months after he founded the church (Acts 17–18).",
  },
  "53-2-thessalonians": {
    start: 51,
    end: 52,
    note: "Written from Corinth soon after 1 Thessalonians, to correct confusion about the day of the Lord.",
  },
  "54-1-timothy": {
    start: 63,
    end: 64,
    note: "Written after Paul's release from his first Roman imprisonment, to guide Timothy in leading the church at Ephesus (1 Timothy 1:3).",
  },
  "55-2-timothy": {
    start: 66,
    end: 67,
    note: "Paul's last letter, written from a Roman prison shortly before his martyrdom under Nero (2 Timothy 4:6).",
  },
  "56-titus": {
    start: 63,
    end: 64,
    note: "Written between Paul's two Roman imprisonments, to guide Titus in setting the churches on Crete in order (Titus 1:5).",
  },
  "57-philemon": {
    start: 60,
    end: 62,
    note: "Written from prison in Rome and sent with Onesimus, at the same time as Colossians.",
  },
  "58-hebrews": {
    start: 64,
    end: 69,
    note: "Written before the temple was destroyed in AD 70, since it speaks of the sacrifices as still being offered (Hebrews 10:1–2).",
  },
  "59-james": {
    start: 45,
    end: 49,
    note: "One of the earliest New Testament letters, written by Jesus' half-brother before the Jerusalem council (Acts 15).",
  },
  "60-1-peter": {
    start: 62,
    end: 64,
    note: 'Written from "Babylon," likely Rome, under Nero, shortly before persecution broke out there (1 Peter 5:13).',
  },
  "61-2-peter": {
    start: 65,
    end: 68,
    note: "Peter's last letter, written shortly before his martyrdom (2 Peter 1:14).",
  },
  "62-1-john": {
    start: 85,
    end: 95,
    note: "Written late in the apostle John's life, likely from Ephesus, to churches troubled by false teachers.",
  },
  "63-2-john": {
    start: 85,
    end: 95,
    note: 'A short letter from John, "the elder," written about the same time as 1 John.',
  },
  "64-3-john": {
    start: 85,
    end: 95,
    note: 'A personal letter from John, "the elder," to Gaius, written about the same time as 1 and 2 John.',
  },
  "65-jude": {
    start: 65,
    end: 80,
    note: "By Jude, brother of James and half-brother of Jesus, likely written around the time of 2 Peter, which shares many of its warnings.",
  },
  "66-revelation": {
    start: 95,
    end: 95,
    note: "Given to John in exile on Patmos (Revelation 1:9), traditionally under Emperor Domitian; its visions reach to Christ's return and the new creation.",
  },
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
