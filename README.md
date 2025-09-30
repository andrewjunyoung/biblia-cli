# Biblia CLI

Biblia CLI is the power-tool for Bible power-users and novices alike.

You can use this CLI tool to retrieve and memorize verses, passages, compare meanings and translations, and study annotations.

```bash
$ biblia get-verse "John 3:16"
[
  {
    verse: 'Jhn.3.16',
    original: '[16] Οὕτως γὰρ ἠγάπησεν ὁ Θεὸς τὸν κόσμον ὥστε τὸν Υἱὸν αὐτοῦ τὸν μονογενῆ ἔδωκεν, ἵνα πᾶς ὁ πιστεύων εἰς αὐτὸν μὴ ἀπόληται, ἀλλ᾿ ἔχῃ ζωὴν αἰώνιον. \n',
    transcription: '[16] Outóś gar egapesen o T͡Heoś ton kosmon óste ton Uion autou ton monogene edóken, ina paś o pisteuón eiś auton me apoletai, all᾿ ek͡he zóen aiónion. \n',
    translation: '[16] For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. \n'
  }
]
```

## Setup

### Prerequisites

- Node.js (v20 or higher recommended)
- npm (this dependency will be removed in future releases)
- An API key from [Scripture API](https://scripture.api.bible)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cli
```

1. Install dependencies and setup:
```bash
make
```

1. Configure your app
```bash
biblia configure
```

## Usage

After building and linking, use the `biblia` command directly:
```bash
biblia <command>
```

### Available Commands

#### Configure
Set up your API key interactively:
```bash
biblia configure
```

#### List Available Bibles
```bash
biblia list-bibles
```

#### List Books in a Bible
```bash
biblia list-books --bible-id <bible-id>
```

#### Get Verse(s)
Fetch verses with original language text (Hebrew/Greek) and transliteration:
```bash
biblia get-verse "Genesis 1:1"
biblia get-verse "Gen 1:1-3"
```

Returns verse content in KJV translation along with original Hebrew (Old Testament) or Greek (New Testament) text and Latin transliteration.

#### Help
```bash
biblia help
```

## License

This project is licensed under the Unlicense. PLEASE download, tinker, and share this project with the world!
