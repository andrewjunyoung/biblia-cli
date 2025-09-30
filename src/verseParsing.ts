import { Books, OldTestamentBook, NewTestamentBook } from "./types/book";

const BOOK_ABBREVIATIONS: Record<string, string> = (() => {
  const abbrevs: Record<string, string> = {};

  // Add each enum key (name) and value (abbreviation) to the map
  for (const [key, value] of Object.entries(Books)) {
    abbrevs[key] = value; // Enum name maps to its value
    abbrevs[value] = value; // Enum value maps to itself
  }

  return abbrevs;
})();

export function parseVerseReference(input: string): string[] | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Normalize the input: replace various delimiters with a standard format
  // Match pattern: BookName Chapter:Verse or BookName Chapter:Verse-EndVerse
  const normalized = input
    .trim()
    .replace(/[\.\-]/g, " ") // Replace dots and dashes with spaces (except in ranges)
    .replace(/\s+/g, " "); // Normalize multiple spaces

  // Pattern to match: BookName Chapter:Verse-EndVerse or BookName Chapter Verse-EndVerse
  // Examples: "Genesis 1:1-3", "Gen 1 1-3", etc.
  const regex =
    /^([0-9]?\s*[A-Za-z]+[0-9]?)\s+(\d+)[\s:]+(\d+)(?:[\s\-\.]+(\d+))?$/;
  const match = normalized.match(regex);

  if (!match) {
    return null;
  }

  const [, bookName, chapter, startVerse, endVerse] = match;

  // Normalize book name
  const normalizedBook = bookName
    .trim()
    .replace(/^\d+\s*/, (num) => num.trim() + " ");
  const bookAbbr = BOOK_ABBREVIATIONS[normalizedBook];

  if (!bookAbbr) {
    // Try to find a partial match
    const bookKey = Object.keys(BOOK_ABBREVIATIONS).find(
      (key) => key.toLowerCase() === normalizedBook.toLowerCase()
    );
    if (!bookKey) {
      return null;
    }
    return buildVerseTokens(
      BOOK_ABBREVIATIONS[bookKey],
      parseInt(chapter),
      parseInt(startVerse),
      endVerse ? parseInt(endVerse) : undefined
    );
  }

  return buildVerseTokens(
    bookAbbr,
    parseInt(chapter),
    parseInt(startVerse),
    endVerse ? parseInt(endVerse) : undefined
  );
}

/**
 * Build verse tokens in the format "Book.Chapter.Verse"
 */
function buildVerseTokens(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse?: number
): string[] {
  const tokens: string[] = [];

  if (endVerse === undefined) {
    // Single verse
    tokens.push(`${book}.${chapter}.${startVerse}`);
  } else {
    // Range of verses
    for (let verse = startVerse; verse <= endVerse; verse++) {
      tokens.push(`${book}.${chapter}.${verse}`);
    }
  }

  return tokens;
}

/**
 * Determine if a book abbreviation is in the Old Testament
 */
export function isOldTestament(bookAbbr: string): boolean {
  return Object.values(OldTestamentBook).includes(bookAbbr as OldTestamentBook);
}
