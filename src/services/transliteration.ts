// Scheme constants
export const PUNIC = "punic";
export const YOUNGIAN = "betacode";

export type SchemeName = typeof PUNIC | typeof YOUNGIAN;

// Greek to Latin transliteration tables by scheme
const greekToLatinTable: { [scheme: string]: { [char: string]: string } } = {
  [PUNIC]: {
    Α: "A",
    α: "a",
    Β: "B",
    β: "b",
    Γ: "G",
    γ: "g",
    Δ: "D",
    δ: "d",
    Ε: "E",
    ε: "e",
    Υ: "Y",
    υ: "y",
    Ζ: "Z",
    ζ: "z",
    Η: "H",
    η: "h",
    Θ: "Θ",
    θ: "θ",
    Ι: "I",
    ι: "i",
    Κ: "K",
    κ: "k",
    Λ: "L",
    λ: "l",
    Μ: "M",
    μ: "m",
    Ν: "N",
    ν: "n",
    Ξ: "X",
    ξ: "x",
    Ο: "O",
    ο: "o",
    Π: "P",
    π: "p",
    Ρ: "R",
    ρ: "r",
    Σ: "C",
    σ: "c",
    ς: "c",
    Τ: "T",
    τ: "t",
    Φ: "f",
    φ: "f",
    Χ: "x",
    χ: "x",
    Ψ: "p͡s",
    ψ: "p͡s",
    Ω: "ó",
    ω: "ó",
    "\u0314": "",
    "·": ";",
    "᾿": "'",
    "—": "-",
  },
  [YOUNGIAN]: {
    Α: "A",
    α: "a",
    Β: "B",
    β: "b",
    Γ: "G",
    γ: "g",
    Δ: "D",
    δ: "d",
    Ε: "E",
    ε: "e",
    Υ: "U",
    υ: "u",
    Ζ: "Z",
    ζ: "z",
    Η: "É",
    η: "e",
    Θ: "T͡h",
    θ: "t͡h",
    Ι: "I",
    ι: "i",
    Κ: "K",
    κ: "k",
    Λ: "L",
    λ: "l",
    Μ: "M",
    μ: "m",
    Ν: "N",
    ν: "n",
    Ξ: "K͡s",
    ξ: "k͡s",
    Ο: "O",
    ο: "o",
    Π: "P",
    π: "p",
    Ρ: "R",
    ρ: "r",
    Σ: "S",
    σ: "s",
    ς: "ś",
    Τ: "T",
    τ: "t",
    Φ: "F",
    φ: "f",
    Χ: "K͡h",
    χ: "k͡h",
    Ψ: "P͡s",
    ψ: "p͡s",
    Ω: "Ó",
    ω: "ó",
    "\u0314": "h",
    "·": ";",
    "᾿": "'",
    "—": "-",
  },
};

const hebrewToLatinTable: { [scheme: string]: { [char: string]: string } } = {
  [PUNIC]: {
    א: "A",
    בּ: "B", // Bet with dagesh (fortition)
    ב: "Bh", // Bet without dagesh (spirantized)
    גּ: "G", // Gimel with dagesh (fortition)
    ג: "Gh", // Gimel without dagesh (spirantized)
    דּ: "D", // Dalet with dagesh (fortition)
    ד: "Dh", // Dalet without dagesh (spirantized)
    ה: "E",
    ו: "W",
    ז: "Z",
    ח: "H",
    ט: "θ",
    י: "I",
    כּ: "K", // Kaf with dagesh (fortition)
    כ: "Kh", // Kaf without dagesh (spirantized)
    ך: "Ḱ",
    ל: "L",
    מ: "M",
    ם: "Ḿ",
    נ: "N",
    ן: "Ń",
    ס: "X",
    ע: "O",
    פּ: "P", // Pe with dagesh (fortition)
    פ: "Ph", // Pe without dagesh (spirantized)
    ף: "Ṕ",
    צ: "S",
    ץ: "Ś",
    ק: "Q",
    ר: "R",
    ש: "C",
    תּ: "T", // Tav with dagesh (fortition)
    ת: "Th", // Tav without dagesh (spirantized)
    "־": "-",
    "\u05BC": ":", // Dagesh (gemination for non-BeGaD KeFaT)
    "\u05B0": "ə", // Shva
    "\u05B4": "i", // Hiriq
    "\u05B5": "ë", // Tsere
    "\u05B6": "ě", // Segol
    "\u05B7": "ā", // Patah
    "\u05B8": "â", // Qamats
    "\u05B1": "ě'", // Hataf Segol
    "\u05B2": "ā'", // Hataf Patah
    "\u05B3": "â'", // Hataf Qamats
    "\u05B9": "ȯ", // Holam
    "\u05BB": "ù", // Qubuts
  },
  [YOUNGIAN]: {
    א: "'",
    בּ: "b", // Bet with dagesh (fortition)
    ב: "bh", // Bet without dagesh (spirantized)
    גּ: "g", // Gimel with dagesh (fortition)
    ג: "gh", // Gimel without dagesh (spirantized)
    דּ: "d", // Dalet with dagesh (fortition)
    ד: "dh", // Dalet without dagesh (spirantized)
    ה: "h",
    ו: "w",
    ז: "z",
    ח: "k͡h",
    ט: "th́",
    י: "j",
    כּ: "k", // Kaf with dagesh (fortition)
    כ: "kh", // Kaf without dagesh (spirantized)
    ך: "ḱ",
    ל: "l",
    מ: "m",
    ם: "ḿ",
    נ: "n",
    ן: "ń",
    ס: "c",
    ע: "h́",
    פּ: "p", // Pe with dagesh (fortition)
    פ: "ph", // Pe without dagesh (spirantized)
    ף: "ṕ",
    צ: "c͡h́",
    ץ: "ć͡h́",
    ק: "q",
    ר: "r",
    ש: "s",
    תּ: "t", // Tav with dagesh (fortition)
    ת: "th", // Tav without dagesh (spirantized)
    "־": "-",
    "\u05BC": ":", // Dagesh (gemination for non-BeGaD KeFaT)
    "\u05B0": "ə", // Shva
    "\u05B4": "i", // Hiriq
    "\u05B5": "ë", // Tsere
    "\u05B6": "ě", // Segol
    "\u05B7": "ā", // Patah
    "\u05B8": "â", // Qamats
    "\u05B1": "ě'", // Hataf Segol
    "\u05B2": "ā'", // Hataf Patah
    "\u05B3": "â'", // Hataf Qamats
    "\u05B9": "ȯ", // Holam
    "\u05BB": "ù", // Qubuts
  },
};

export class Transliteration {
  scheme: SchemeName;

  constructor(scheme: SchemeName = PUNIC) {
    this.scheme = scheme;
  }

  static getAvailableSchemes(): SchemeName[] {
    return [PUNIC, YOUNGIAN];
  }

  greek2Latin(greekText: string): string {
    return Transliteration.greek2Latin(greekText, this.scheme);
  }

  static greek2Latin(greekText: string, scheme: SchemeName = YOUNGIAN): string {
    const normalized = greekText.normalize("NFD");
    const words = normalized.split(/(\s+)/);

    return words
      .map((word) => {
        if (/\s/.test(word)) return word;

        let hasH = false;
        let output = "";

        for (let i = 0; i < word.length; i++) {
          const char = word[i];
          const next = word[i + 1];

          if (next === "\u0314") {
            const isRho = /[ρΡ]/.test(char);
            const isUpper = char === char.toUpperCase();
            const base = greekToLatinTable[scheme][char] || char;
            output += isRho ? (isUpper ? "Rh" : "rh") : base;
            hasH = hasH || !isRho;
            i++;
          } else if (char !== "\u0314") {
            output += greekToLatinTable[scheme][char] || char;
          }
        }

        if (hasH) {
          // Find the first alphabetical character
          const firstAlphaIndex = output.search(/[a-zA-Z]/);
          if (firstAlphaIndex === -1) return output;

          const prefix = output.substring(0, firstAlphaIndex);
          const firstChar = output[firstAlphaIndex];
          const isUpper = firstChar === firstChar.toUpperCase();
          const rest = output.substring(firstAlphaIndex);

          return prefix + (isUpper ? "H" : "h") + rest.toLowerCase();
        }
        return output;
      })
      .join("");
  }

  hebrew2Latin(hebrewText: string): string {
    // Strip out Hebrew cantillation marks (Unicode range U+0591-U+05AF and U+05BD-U+05C7)
    // but keep vowel points and dagesh for transliteration
    const strippedText = hebrewText
      .replace(/[\u0591-\u05AF]/g, "")
      .replace(/[\u05BB\u05BD\u05C1-\u05C7]/g, "");

    return strippedText
      .split("")
      .map((char) => hebrewToLatinTable[this.scheme][char] || char)
      .join("");
  }

  static hebrew2Latin(
    hebrewText: string,
    scheme: SchemeName = YOUNGIAN
  ): string {
    // Strip out Hebrew cantillation marks (Unicode range U+0591-U+05AF and U+05BD-U+05C7)
    // but keep vowel points and dagesh for transliteration
    const strippedText = hebrewText
      .replace(/[\u0591-\u05AF]/g, "")
      .replace(/[\u05BB\u05BD\u05C1-\u05C7]/g, "");

    return strippedText
      .split("")
      .map((char) => hebrewToLatinTable[scheme][char] || char)
      .join("");
  }
}
