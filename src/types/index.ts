export interface BibleVerse {
  bibleId: string | undefined;
  book: string;
  chapters: [string] | undefined;
  verses: [string] | undefined;
  index: number;
  text: string;
}

export interface BibleVerseRequestType {
  bibleId?: string;
  book: string;
  chapters?: [string];
  verses?: [string];
}

export interface BibleText {
  original: string;
  transcription: string;
  translation: string;
}
