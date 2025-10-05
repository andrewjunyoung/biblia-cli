export interface BibleVerse {
  bibleId: string | undefined;
  book: string;
  chapters: [string] | undefined;
  verses: [string] | undefined;
  index: number;
  text: string;
}

export interface BibleVerseRequest {
  bibleId: string | undefined;
  book: string;
  chapters: [string] | undefined;
  verses: [string] | undefined;
}

export interface BibleText {
  original: string;
  transcription: string;
  translation: string;
}
