#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { resolve } from "path";
import { Transliteration } from "./services/transliteration";
import { GREEK_SEPTUAGINT_ID, KJV_ID, HEBREW_TANAKH_ID } from "./consts";
import { parseVerseReference, isOldTestament } from "./services/verseParsing";
import {
  interactiveConfigure,
  getConfigurationValue,
} from "./commands/configure";
import Strongs from "./services/strongs";

const program = new Command();

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf8")
);

const strongs = new Strongs();

program
  .name("biblia")
  .description("CLI tool for Biblia")
  .version(packageJson.version);

program
  .command("help")
  .description("Display help information")
  .action(() => {
    program.outputHelp();
  });

program
  .command("list-bibles")
  .description("List all available bibles")
  .action(async () => {
    try {
      const apiKey = getConfigurationValue("api_key");
      if (!apiKey) {
        console.error(
          'API key not found. Run "biblia configure" to set it up.'
        );
        process.exit(1);
      }

      const response = await fetch(
        "https://api.scripture.api.bible/v1/bibles",
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "api-key": apiKey,
          },
        }
      );

      if (!response.ok) {
        console.error(
          `API request failed: ${response.status} ${response.statusText}`
        );
        process.exit(1);
      }

      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error fetching bibles:", error);
      process.exit(1);
    }
  });

program
  .command("list-books")
  .description("List all books in a bible")
  .option("--bible-id <bibleId>", "Bible ID to list books from")
  .action(async (options) => {
    try {
      const apiKey = getConfigurationValue("api_key");
      if (!apiKey) {
        console.error(
          'API key not found. Run "biblia configure" to set it up.'
        );
        process.exit(1);
      }

      const bibleId = options.bibleId || getConfigurationValue("default_bible_id");
      if (!bibleId) {
        console.error(
          "Bible ID not provided and no default_bible_id found in config. Run \"biblia configure\" to set it up or use --bible-id."
        );
        process.exit(1);
      }

      const response = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/books`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "api-key": apiKey,
          },
        }
      );

      if (!response.ok) {
        console.error(
          `API request failed: ${response.status} ${response.statusText}`
        );
        process.exit(1);
      }

      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error fetching books:", error);
      process.exit(1);
    }
  });

program
  .command("list-chapters")
  .description("List all chapters in a book")
  .option("--bible-id <bibleId>", "Bible ID to use")
  .option("--book <bookId>", "Book ID to list chapters from")
  .action(async (options) => {
    try {
      if (!options.book) {
        console.error("--book option is required");
        process.exit(1);
      }

      const data = await listChapters(options.book, {
        bibleId: options.bibleId,
      });
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error fetching chapters:", error);
      process.exit(1);
    }
  });

program
  .command("list-verses")
  .description("List all verses in a chapter")
  .option("--bible-id <bibleId>", "Bible ID to use")
  .option("--book <chapterId>", "Chapter ID to list verses from")
  .action(async (options) => {
    try {
      if (!options.book) {
        console.error("--book option is required");
        process.exit(1);
      }

      const data = await listVerses(options.book, {
        bibleId: options.bibleId,
      });
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error fetching verses:", error);
      process.exit(1);
    }
  });

program
  .command("configure")
  .description("Configure biblia settings interactively")
  .action(async () => {
    await interactiveConfigure();
  });

program
  .command("get-strongs <strongsId>")
  .description("Get Strong's concordance entry by ID (e.g., G123, H1234)")
  .action((strongsId: string) => {
    const entry = strongs.getEntry(strongsId.toUpperCase());

    if (!entry) {
      console.error(`Strong's entry not found: ${strongsId}`);
      process.exit(1);
    }

    console.dir(entry, { depth: null, maxArrayLength: null });
  });

export async function listChapters(
  bookId: string,
  options: { bibleId?: string } = {}
) {
  const apiKey = getConfigurationValue("api_key");
  if (!apiKey) {
    throw new Error('API key not found. Run "biblia configure" to set it up.');
  }

  const bibleId = options.bibleId || getConfigurationValue("default_bible_id");
  if (!bibleId) {
    throw new Error(
      "Bible ID not provided and no default_bible_id found in config."
    );
  }

  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${bookId}/chapters`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

export async function listVerses(
  chapterId: string,
  options: { bibleId?: string } = {}
) {
  const apiKey = getConfigurationValue("api_key");
  if (!apiKey) {
    throw new Error('API key not found. Run "biblia configure" to set it up.');
  }

  const bibleId = options.bibleId || getConfigurationValue("default_bible_id");
  if (!bibleId) {
    throw new Error(
      "Bible ID not provided and no default_bible_id found in config."
    );
  }

  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}/verses`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

export async function getVerse(
  reference: string,
  options: { bibleId?: string; filter?: boolean } = {}
) {
  const apiKey = getConfigurationValue("api_key");
  if (!apiKey) {
    throw new Error('API key not found. Run `biblia configure` to set it up.');
  }

  // Parse the verse reference
  const parsedRequest = parseVerseReference(reference);
  console.log("p", parsedRequest);

  if (!parsedRequest) {
    throw new Error(`Failed to parse verse reference: ${reference}`);
  }

  let parsedVerses = parsedRequest.buildVerseTokens();

  // If no verses specified, fetch all verses in the chapter
  if (parsedVerses.length === 0 && parsedRequest.chapters?.[0]) {
    const chapterId = `${parsedRequest.book}.${parsedRequest.chapters[0]}`;
    const versesData = await listVerses(chapterId, { bibleId: options.bibleId });

    if (versesData.data && Array.isArray(versesData.data)) {
      parsedVerses = versesData.data.map((v: any) => v.id);
    } else {
      throw new Error(`No verses found in chapter: ${chapterId}`);
    }
  }

  // Fetch each verse
  const results = [];
  const bibleId = options.bibleId || KJV_ID;
  const strongsBible = strongs.loadStrongsBible();

  for (const verseToken of parsedVerses) {
    const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verseToken}?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false&use-org-id=false`;

    // Fetch translation
    const kjvResponse = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
    });

    if (!kjvResponse.ok) {
      console.error(
        `API request failed for ${verseToken}: ${kjvResponse.status} ${kjvResponse.statusText}`
      );
      continue;
    }

    const kjvData = await kjvResponse.json();

    // Extract book abbreviation from verse token (format: "Book.Chapter.Verse")
    const bookAbbr = verseToken.split(".")[0];
    const isOT = isOldTestament(bookAbbr);

    let strongsData;
    if (isOT) {
      strongsData = strongs.loadStrongsHebrewData();
      if (!strongsData) {
        console.log("Failed to load hebrew root words");
      }
    } else {
      strongsData = strongs.loadStrongsGreekData();
      if (!strongsData) {
        console.log("Failed to load greek root words");
      }
    }

    // Fetch Hebrew (OT) or Greek (NT)
    const originalLangBibleId = isOT ? HEBREW_TANAKH_ID : GREEK_SEPTUAGINT_ID;
    const originalLangUrl = `https://api.scripture.api.bible/v1/bibles/${originalLangBibleId}/verses/${verseToken}?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false&use-org-id=false`;

    let originalText = null;
    let originalTextNormalized = null;
    let transcription = null;

    try {
      const originalResponse = await fetch(originalLangUrl, {
        method: "GET",
        headers: {
          accept: "application/json",
          "api-key": apiKey,
        },
      });

      if (originalResponse.ok) {
        const originalData = await originalResponse.json();
        originalText = originalData.data.content.trim();
        originalTextNormalized = originalText
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        transcription = (
          isOT
            ? Transliteration.hebrew2Latin(originalTextNormalized)
            : Transliteration.greek2Latin(originalTextNormalized)
        ).trim();
      }
    } catch (error) {
      // Fail gracefully - original text and transcription will remain null
    }

    const result: any = {
      verse: verseToken,
      original: originalText,
      transcription: transcription,
      translation: kjvData.data.content.trim(),
    };

    // Only include Strong's data if filter is not enabled
    if (!options.filter) {
      const strongsCodes = strongsBible.get(verseToken) || [];

      const roots: string[] = [];
      const translations: string[] = [];
      for (const code of strongsCodes) {
        const entry = strongsData.get(code);
        if (entry) {
          const rootNormalized = entry.root
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          let rootTranslit;
          if (isOT) {
            rootTranslit = Transliteration.hebrew2Latin(rootNormalized).trim();
          } else {
            rootTranslit = Transliteration.greek2Latin(rootNormalized).trim();
          }
          roots.push(rootTranslit);
          translations.push(entry.kjv_def);
        }
      }

      result.strongs = { codes: strongsCodes, roots, translations };
    }

    results.push(result);
  }

  return results;
}

program
  .command("get-verses <reference>")
  .description("Get a Bible verse by reference (e.g., Genesis 1:1, Gen 1:1-3)")
  .option("--bible-id <bibleId>", "Bible ID to use for the translation")
  .option("--filter", "Exclude Strong's concordance information")
  .option("--pretty", "Format output as a readable paragraph")
  .action(async (reference: string, options) => {
    try {
      const results = await getVerse(reference, options);

      if (options.pretty) {
        // Extract book and chapter from first verse
        const firstVerse = results[0].verse.split('.');
        const book = firstVerse[0];
        const chapter = firstVerse[1];
        const title = `${book} ${chapter}`;

        // Get terminal width, default to 80 if not available
        const terminalWidth = process.stdout.columns || 80;

        // Create centered header with # characters
        const titleWithSpaces = ` ${title} `;
        const totalPadding = Math.max(0, terminalWidth - titleWithSpaces.length);
        const leftPadding = Math.floor(totalPadding / 2);
        const rightPadding = totalPadding - leftPadding;
        const header = '#'.repeat(leftPadding) + titleWithSpaces + '#'.repeat(rightPadding);

        console.log('\n' + header + '\n');

        // Translation section
        const translationHeader = ' Translation ';
        const translationPadding = Math.max(0, terminalWidth - translationHeader.length);
        const translationLeft = Math.floor(translationPadding / 2);
        const translationRight = translationPadding - translationLeft;
        const translationLine = '─'.repeat(translationLeft) + translationHeader + '─'.repeat(translationRight);

        console.log(translationLine + '\n');

        for (const result of results) {
          const verseNum = result.verse.split('.')[2];
          console.log(`[${verseNum}] ${result.translation}`);
        }

        // Original text section (if available)
        if (results.some(r => r.original)) {
          console.log('\n' + '─'.repeat(Math.floor((terminalWidth - 11) / 2)) + ' Original ' + '─'.repeat(Math.ceil((terminalWidth - 11) / 2)) + '\n');

          for (const result of results) {
            if (result.original) {
              const verseNum = result.verse.split('.')[2];
              console.log(`[${verseNum}] ${result.original}`);
            }
          }
        }

        // Transcription section (if available)
        if (results.some(r => r.transcription)) {
          console.log('\n' + '─'.repeat(Math.floor((terminalWidth - 17) / 2)) + ' Transcription ' + '─'.repeat(Math.ceil((terminalWidth - 17) / 2)) + '\n');

          for (const result of results) {
            if (result.transcription) {
              const verseNum = result.verse.split('.')[2];
              console.log(`[${verseNum}] ${result.transcription}`);
            }
          }
        }

        // Strong's section (if available)
        if (results.some(r => r.strongs)) {
          console.log('\n' + '─'.repeat(Math.floor((terminalWidth - 11) / 2)) + ' Strong\'s ' + '─'.repeat(Math.ceil((terminalWidth - 11) / 2)) + '\n');

          for (const result of results) {
            if (result.strongs) {
              const verseNum = result.verse.split('.')[2];
              console.log(`[${verseNum}] Codes: ${result.strongs.codes.join(', ')}`);
              if (result.strongs.roots.length > 0) {
                console.log(`     Roots: ${result.strongs.roots.join(', ')}`);
              }
              if (result.strongs.translations.length > 0) {
                console.log(`     Definitions: ${result.strongs.translations.join('; ')}`);
              }
              console.log('');
            }
          }
        }

        console.log('');
      } else {
        console.dir(results, { depth: null, maxArrayLength: null });
      }
    } catch (error) {
      console.error("Error fetching verse:", error);
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse();
}
