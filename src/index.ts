#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Transliteration } from './transliteration';
import { GREEK_SEPTUAGINT_ID, KJV_ID, HEBREW_TANAKH_ID } from './consts';
import { parseVerseReference, isOldTestament } from './verseParsing';
import { interactiveConfigure, getConfigurationValue } from './configure';
import Strongs from './strongs';

const program = new Command();

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf8')
);

const strongs = new Strongs();

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
  .command('get-strongs <strongsId>')
  .description('Get Strong\'s concordance entry by ID (e.g., G123, H1234)')
  .action((strongsId: string) => {
    const entry = strongs.getEntry(strongsId.toUpperCase());

    if (!entry) {
      console.error(`Strong's entry not found: ${strongsId}`);
      process.exit(1);
    }

    console.dir(entry, { depth: null, maxArrayLength: null });
  });

export async function getVerse(reference: string, options: { bibleId?: string } = {}) {
  const apiKey = getConfigurationValue('api_key');
  if (!apiKey) {
    throw new Error('API key not found. Run "biblia configure" to set it up.');
  }

  // Parse the verse reference
  const parsedVerses = parseVerseReference(reference);

  if (!parsedVerses || parsedVerses.length === 0) {
    throw new Error(`Failed to parse verse reference: ${reference}`);
  }

  // Fetch each verse
  const results = [];
  const bibleId = options.bibleId || KJV_ID;
  const strongsBible = strongs.loadStrongsBible();
  const greekData = strongs.loadStrongsGreekData();
  if (!greekData) {
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
    const strongsCodes = strongsBible.get(verseToken) || [];


    // Build codes, roots, and translations arrays
    const roots: string[] = [];
    const translations: string[] = [];
    for (const code of strongsCodes) {
      const entry = greekData.get(code);
      if (entry) {
        const rootNormalized = entry.root.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const rootTranslit = Transliteration.greek2Latin(rootNormalized).trim();
        roots.push(rootTranslit);
        translations.push(entry.kjv_def);
      }
    }

    results.push({
      verse: verseToken,
      original: originalText,
      transcription: transcription,
      translation: kjvData.data.content.trim(),
      strongs: { codes: strongsCodes, roots, translations }
    });
  }

  return results;
}

program
  .command('get-verse <reference>')
  .description('Get a Bible verse by reference (e.g., Genesis 1:1, Gen 1:1-3)')
  .option('--bible-id <bibleId>', 'Bible ID to use for the translation')
  .action(async (reference: string, options) => {
    try {
      const results = await getVerse(reference, options);
      console.dir(results, { depth: null, maxArrayLength: null });
    } catch (error) {
      console.error('Error fetching verse:', error);
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse();
}
