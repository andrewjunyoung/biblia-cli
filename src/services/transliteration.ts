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
    Η: "É",
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
    ς: "ś",
    Τ: "T",
    τ: "t",
    Φ: "F",
    φ: "f",
    Χ: "K͡h",
    χ: "k͡h",
    Ψ: "P͡s",
    ψ: "p͡s",
    Ω: "Ó",
    ω: "ó",
  },
};

const hebrewToLatinTable: { [scheme: string]: { [char: string]: string } } = {
  [PUNIC]: {
    א: "A",
    ב: "B",
    ג: "G",
    ד: "D",
    ה: "E",
    ו: "W",
    ז: "Z",
    ח: "H",
    ט: "θ",
    י: "I",
    כ: "K",
    ך: "Ḱ",
    ל: "L",
    מ: "M",
    ם: "Ḿ",
    נ: "N",
    ן: "Ń",
    ס: "X",
    ע: "O",
    פ: "P",
    ף: "Ṕ",
    צ: "S",
    ץ: "Ś",
    ק: "Q",
    ר: "R",
    ש: "C",
    ת: "T",
    "\u05B0": "ə", // Shva
    "\u05B4": "i", // Hiriq
    "\u05B5": "ë", // Tsere
    "\u05B6": "ě", // Segol
    "\u05B7": "ā", // Patah
    "\u05B8": "ô", // Qamats
    "\u05B1": "ě'", // Hataf Segol
    "\u05B2": "ā'", // Hataf Patah
    "\u05B3": "ô'", // Hataf Qamats
    "\u05B9": "ȯ", // Holam
    "\u05BB": "ù", // Qubuts
  },
  [YOUNGIAN]: {
    א: "'",
    ב: "b",
    ג: "g",
    ד: "d",
    ה: "h",
    ו: "w",
    ז: "z",
    ח: "h",
    ט: "th́",
    י: "j",
    כ: "k",
    ך: "ḱ",
    ל: "l",
    מ: "m",
    ם: "ḿ",
    נ: "n",
    ן: "ń",
    ס: "c",
    ע: "h́",
    פ: "p",
    ף: "ṕ",
    צ: "c͡h́",
    ץ: "ć͡h́",
    ק: "q",
    ר: "r",
    ש: "s",
    ת: "t",
    "\u05B0": "ə", // Shva
    "\u05B4": "i", // Hiriq
    "\u05B5": "ë", // Tsere
    "\u05B6": "ě", // Segol
    "\u05B7": "ā", // Patah
    "\u05B8": "ô", // Qamats
    "\u05B1": "ě'", // Hataf Segol
    "\u05B2": "ā'", // Hataf Patah
    "\u05B3": "ô'", // Hataf Qamats
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
    return greekText
      .split("")
      .map((char) => greekToLatinTable[this.scheme][char] || char)
      .join("");
  }

  static greek2Latin(greekText: string, scheme: SchemeName = YOUNGIAN): string {
    return greekText
      .split("")
      .map((char) => greekToLatinTable[scheme][char] || char)
      .join("");
  }

  hebrew2Latin(hebrewText: string): string {
    // Strip out Hebrew vowel points and cantillation marks (Unicode range U+0591-U+05C7)
    const strippedText = hebrewText
      .replace(/[\u0591-\u05AF]/g, "")
      .replace(/[\u05BC-\u05C7]/g, "");

    return strippedText
      .split("")
      .map((char) => hebrewToLatinTable[this.scheme][char] || char)
      .join("");
  }

  static hebrew2Latin(
    hebrewText: string,
    scheme: SchemeName = YOUNGIAN
  ): string {
    // Strip out Hebrew vowel points and cantillation marks (Unicode range U+0591-U+05C7)
    const strippedText = hebrewText
      .replace(/[\u0591-\u05AF]/g, "")
      .replace(/[\u05BC-\u05C7]/g, "");

    return strippedText
      .split("")
      .map((char) => hebrewToLatinTable[scheme][char] || char)
      .join("");
  }
}
