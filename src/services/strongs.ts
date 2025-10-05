import { join, resolve, dirname } from "path";
import { readFileSync, existsSync } from "fs";

class Strongs {
  private bible: Map<string, string[]> | undefined = undefined;
  private hebrewData: Map<string, { root: string; kjv_def: string; lemma?: string }> | undefined = undefined;
  private greekData: Map<string, { root: string; kjv_def: string; lemma?: string }> | undefined = undefined;

  getEntry(id: string) {
    const isGreek = id.startsWith("G");
    const isHebrew = id.startsWith("H");

    if (!isGreek && !isHebrew) {
      return null;
    }

    try {
      let strongsData;
      if (isGreek) {
        strongsData = this.loadStrongsGreekData()
        return strongsData.get(id) || null;
      } else {
        strongsData = this.loadStrongsHebrewData()
        return strongsData.get(id) || null;
      }
    } catch (error) {
      return null;
    }
  }

  loadStrongsBible(): Map<string, string[]> {
    const strongsMap = new Map<string, string[]>();
    const strongsPath = resolve(__dirname, "../../data/strongs.txt");

    if (!existsSync(strongsPath)) {
      return strongsMap;
    }

    const content = readFileSync(strongsPath, "utf8");
    const lines = content.split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;

      const match = line.match(/^(.+?)(<.+)$/);
      if (match) {
        const verseRef = match[1];
        const strongsNums =
          match[2].match(/<[H|G](\d+)>/g)?.map((s) => s.slice(1, -1)) || [];
        strongsMap.set(verseRef, strongsNums);
      }
    }

    return strongsMap;
  }

  loadStrongsData(
    path: string
  ): Map<string, { root: string; kjv_def: string }> {
    const dataMap = new Map<string, { root: string; kjv_def: string }>();

    try {
      let strongsData = require(path).default;

      for (const [id, entry] of Object.entries(strongsData)) {
        if ((entry as any).lemma && (entry as any).kjv_def) {
          dataMap.set(id, {
            root: (entry as any).lemma,
            kjv_def: (entry as any).kjv_def,
          });
        }
      }
    } catch (error) {}

    return dataMap;
  }

  loadStrongsGreekData(): Map<
    string,
    { root: string; kjv_def: string }
  > {
    return this.loadStrongsData(`${process.cwd()}/data/strongs-greek.ts`);
  }

  loadStrongsHebrewData(): Map<
    string,
    { root: string; kjv_def: string }
  > {
    return this.loadStrongsData(`${process.cwd()}/data/strongs-hebrew.ts`);
  }
}

export default Strongs;
