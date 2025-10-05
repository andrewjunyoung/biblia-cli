import { Books, OldTestamentBook, NewTestamentBook } from "../types/book";
import { BibleVerseRequestType } from "../types";

const BOOK_ABBREVIATIONS: Record<string, string> = (() => {
  const abbrevs: Record<string, string> = {};

  // Add each enum key (name) and value (abbreviation) to the map
  for (const [key, value] of Object.entries(Books)) {
    abbrevs[key] = value; // Enum name maps to its value
    abbrevs[value] = value; // Enum value maps to itself
  }

  return abbrevs;
})();

export function parseVerseReference(input: string): BibleVerseRequest | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Always norm to "{BOOK}.{CHAPTER}.{VERSE_RANGE}"
  const normalized = input
    .trim()
    .replace(/[\s:]/g, ".")
    .replace(/\.+/g, ".");

  const bookPattern = /^([0-9]?[A-Za-z]+[0-9]?)/;
  const chapterPattern = /(?:\.(\d+))?/;
  const verseRangePattern = /(?:\.(\d+)(?:-(\d+))?)?/;

  const regex = new RegExp(
    `${bookPattern.source}${chapterPattern.source}${verseRangePattern.source}$`
  );
  const match = normalized.match(regex);

  if (!match) {
    return null;
  }

  const [, bookName, chapter, startVerse, endVerse] = match;

  const normalizedBook = bookName
    .trim()
    .replace(/^\d+\s*/, (num) => num.trim() + " ");
  const bookAbbr = BOOK_ABBREVIATIONS[normalizedBook];

  return BibleVerseRequest.buildVerseRequest(
    bookAbbr,
    parseInt(chapter),
    startVerse ? parseInt(startVerse) : undefined,
    endVerse ? parseInt(endVerse) : undefined
  );
}

export class BibleVerseRequest implements BibleVerseRequestType {
  bibleId?: string;
  book: string;
  chapters: [string];
  verses: [string];

  constructor(
    book: string,
    chapters: [string],
    verses: [string],
    bibleId?: string
  ) {
    this.book = book;
    this.chapters = chapters;
    this.verses = verses;
    this.bibleId = bibleId;
  }

  static buildVerseRequest(
    book: string,
    chapter: number,
    startVerse?: number,
    endVerse?: number
  ): BibleVerseRequest {
    const verses: string[] = [];

    if (startVerse !== undefined) {
      if (endVerse === undefined) {
        // Single verse
        verses.push(startVerse.toString());
      } else {
        // Range of verses
        for (let verse = startVerse; verse <= endVerse; verse++) {
          verses.push(verse.toString());
        }
      }
    }

    return new BibleVerseRequest(
      book,
      [chapter.toString()] as [string],
      verses as [string]
    );
  }

  buildVerseTokens(): string[] {
    const tokens: string[] = [];
    const chapter = this.chapters?.[0];

    if (!chapter || !this.verses) {
      return tokens;
    }

    for (const verse of this.verses) {
      tokens.push(`${this.book}.${chapter}.${verse}`);
    }

    return tokens;
  }
}

export function isOldTestament(bookAbbr: string): boolean {
  return Object.values(OldTestamentBook).includes(bookAbbr as OldTestamentBook);
}
