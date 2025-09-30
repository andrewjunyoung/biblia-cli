#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Transliteration } from './transliteration';
import * as dotenv from 'dotenv';
import { GREEK_SEPTUAGINT_ID, KJV_ID, HEBREW_TANAKH_ID } from './consts';
import { parseVerseReference, isOldTestament } from './verseParsing';
import { interactiveConfigure } from './configure';

dotenv.config({ quiet: true });

const program = new Command();

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

program
  .name('biblia')
  .description('CLI tool for Biblia')
  .version(packageJson.version);

program
  .command('help')
  .description('Display help information')
  .action(() => {
    program.outputHelp();
  });

program
  .command('list-bibles')
  .description('List all available bibles')
  .action(async () => {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        console.error('API_KEY not found in environment variables');
        process.exit(1);
      }

      const response = await fetch('https://api.scripture.api.bible/v1/bibles', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey
        }
      });

      if (!response.ok) {
        console.error(`API request failed: ${response.status} ${response.statusText}`);
        process.exit(1);
      }

      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error fetching bibles:', error);
      process.exit(1);
    }
  });

program
  .command('list-books')
  .description('List all books in a bible')
  .requiredOption('--bible-id <bibleId>', 'Bible ID to list books from')
  .action(async (options) => {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        console.error('API_KEY not found in environment variables');
        process.exit(1);
      }

      const response = await fetch(`https://api.scripture.api.bible/v1/bibles/${options.bibleId}/books`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey
        }
      });

      if (!response.ok) {
        console.error(`API request failed: ${response.status} ${response.statusText}`);
        process.exit(1);
      }

      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error fetching books:', error);
      process.exit(1);
    }
  });

program
  .command('configure')
  .description('Configure biblia settings interactively')
  .action(async () => {
    await interactiveConfigure();
  });

program
  .command('get-verse <reference>')
  .description('Get a Bible verse by reference (e.g., Genesis 1:1, Gen 1:1-3)')
  .action(async (reference: string) => {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        console.error('API_KEY not found in environment variables');
        process.exit(1);
      }

      // Parse the verse reference
      const parsedVerses = parseVerseReference(reference);

      if (!parsedVerses || parsedVerses.length === 0) {
        console.error(`Failed to parse verse reference: ${reference}`);
        process.exit(1);
      }

      // Fetch each verse
      const results = [];

      for (const verseToken of parsedVerses) {
        const url = `https://api.scripture.api.bible/v1/bibles/${KJV_ID}/verses/${verseToken}?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false&use-org-id=false`;

        // Fetch KJV
        const kjvResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey
          }
        });

        if (!kjvResponse.ok) {
          console.error(`API request failed for ${verseToken}: ${kjvResponse.status} ${kjvResponse.statusText}`);
          continue;
        }

        const kjvData = await kjvResponse.json();

        // Extract book abbreviation from verse token (format: "Book.Chapter.Verse")
        const bookAbbr = verseToken.split('.')[0];
        const isOT = isOldTestament(bookAbbr);

        // Fetch Hebrew (OT) or Greek (NT)
        const originalLangBibleId = isOT ? HEBREW_TANAKH_ID : GREEK_SEPTUAGINT_ID;
        const originalLangUrl = `https://api.scripture.api.bible/v1/bibles/${originalLangBibleId}/verses/${verseToken}?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false&use-org-id=false`;

        let originalText = null;
        let originalTextNormalized = null;
        let transcription = null;

        try {
          const originalResponse = await fetch(originalLangUrl, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'api-key': apiKey
            }
          });

          if (originalResponse.ok) {
            const originalData = await originalResponse.json();
            originalText = originalData.data.content;
            originalTextNormalized = originalText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            transcription = isOT
              ? Transliteration.hebrew2Latin(originalTextNormalized)
              : Transliteration.greek2Latin(originalTextNormalized);
          }
        } catch (error) {
          // Fail gracefully - original text and transcription will remain null
        }

        results.push({
          verse: verseToken,
          original: originalText,
          transcription: transcription,
          translation: kjvData.data.content
        });
      }

      console.log(results);
    } catch (error) {
      console.error('Error fetching verse:', error);
      process.exit(1);
    }
  });

function transcribe() {
}

program.parse();
