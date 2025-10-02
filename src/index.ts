#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { Transliteration } from './transliteration';
import { GREEK_SEPTUAGINT_ID, KJV_ID, HEBREW_TANAKH_ID } from './consts';
import { parseVerseReference, isOldTestament } from './verseParsing';
import { interactiveConfigure, getConfigurationValue } from './configure';

// Load Strong's concordance data
function loadStrongsData(): Map<string, string[]> {
  const strongsMap = new Map<string, string[]>();
  const strongsPath = resolve(__dirname, '../data/strongs.txt');

  if (!existsSync(strongsPath)) {
    return strongsMap;
  }

  const content = readFileSync(strongsPath, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    const match = line.match(/^(.+?)(<.+)$/);
    if (match) {
      const verseRef = match[1];
      const strongsNums = match[2].match(/<[H|G](\d+)>/g)?.map(s => s.slice(1, -1)) || [];
      strongsMap.set(verseRef, strongsNums);
    }
  }

  return strongsMap;
}

// Load Strong's Greek data and create ID to lemma mapping
function loadStrongsGreekRoots(): Map<string, string> {
  const lemmaMap = new Map<string, string>();

  try {
    const { STRONGS_GREEK } = require(`${process.cwd()}/data/strongs-greek.ts`);

    for (const [id, entry] of Object.entries(STRONGS_GREEK)) {
      if ((entry as any).lemma) {
        lemmaMap.set(id, (entry as any).lemma);
      }
    }
  } catch (error) {

  }

  return lemmaMap;
}

const program = new Command();

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf8')
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
      const apiKey = getConfigurationValue('api_key');
      if (!apiKey) {
        console.error('API key not found. Run "biblia configure" to set it up.');
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
      const apiKey = getConfigurationValue('api_key');
      if (!apiKey) {
        console.error('API key not found. Run "biblia configure" to set it up.');
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
  .option('--bible-id <bibleId>', 'Bible ID to use for the translation')
  .action(async (reference: string, options) => {
    try {
      const apiKey = getConfigurationValue('api_key');
      if (!apiKey) {
        console.error('API key not found. Run "biblia configure" to set it up.');
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
      const bibleId = options.bibleId || KJV_ID;
      const strongsData = loadStrongsData();
      const greekRoots = loadStrongsGreekRoots();
      if ( !greekRoots ) {
        console.log("Failed to load greek root words");
      }

      for (const verseToken of parsedVerses) {
        const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verseToken}?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false&use-org-id=false`;

        // Fetch translation
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
            originalText = originalData.data.content.trim();
            originalTextNormalized = originalText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            transcription = (isOT
              ? Transliteration.hebrew2Latin(originalTextNormalized)
              : Transliteration.greek2Latin(originalTextNormalized)).trim();
          }
        } catch (error) {
          // Fail gracefully - original text and transcription will remain null
        }

        // Get Strong's numbers for this verse
        const strongsCodes = strongsData.get(verseToken) || [];

        // Build codes and roots arrays
        const roots: string[] = [];
        for (const code of strongsCodes) {
          const root = greekRoots.get(code);
          if (root) {
            roots.push(root);
          }
        }

        results.push({
          verse: verseToken,
          original: originalText,
          transcription: transcription,
          translation: kjvData.data.content.trim(),
          strongs: { strongsCodes, roots }
        });
      }

      console.log(results, { depth: null });
    } catch (error) {
      console.error('Error fetching verse:', error);
      process.exit(1);
    }
  });

function transcribe() {
}

program.parse();
