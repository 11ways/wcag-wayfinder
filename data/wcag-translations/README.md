# WCAG Translations

This directory contains WCAG (Web Content Accessibility Guidelines) translations in JSON format, gathered from official W3C authorized translations.

## Status

| Version | Valid | Total | Languages |
|---------|-------|-------|-----------|
| WCAG 2.2 | 6 | 6 | Catalan, Dutch, English, French, Italian, Portuguese (BR) |
| WCAG 2.1 | 5 | 7 | Chinese, Danish, Finnish, Norwegian, Polish |

**Note:** Arabic and Ukrainian WCAG 2.1 translations have structural issues in the source HTML that prevent complete parsing.

## Directory Structure

```
wcag-translations/
├── README.md                    # This file
├── scripts/
│   ├── types.ts                 # TypeScript type definitions
│   ├── fetch-translations.ts    # Download HTML from W3C
│   ├── parse-wcag-html.ts       # Convert HTML to JSON
│   └── validate-translations.ts # Validate against schema
├── raw-html/                    # Cached HTML files (gitignored)
│   ├── wcag22-en.html
│   ├── wcag22-nl.html
│   └── ...
├── json/
│   ├── wcag22/                  # WCAG 2.2 translations (87 SC)
│   │   ├── wcag22-en.json       # English (reference)
│   │   ├── wcag22-nl.json       # Dutch
│   │   ├── wcag22-fr.json       # French
│   │   ├── wcag22-it.json       # Italian
│   │   ├── wcag22-ca.json       # Catalan
│   │   └── wcag22-pt-BR.json    # Brazilian Portuguese
│   └── wcag21/                  # WCAG 2.1 translations (78 SC)
│       ├── wcag21-zh.json       # Simplified Chinese
│       ├── wcag21-da.json       # Danish
│       ├── wcag21-fi.json       # Finnish
│       ├── wcag21-no.json       # Norwegian
│       ├── wcag21-pl.json       # Polish
│       ├── wcag21-ar.json       # Arabic (incomplete)
│       └── wcag21-uk.json       # Ukrainian (has parsing issues)
└── unified/                     # Future: merged multi-language JSON
```

## JSON Schema

Each translation file follows this structure:

```json
{
  "metadata": {
    "wcag_version": "2.2",
    "language": "nl",
    "language_native": "Nederlands",
    "authorization_type": "authorized",
    "translator": "Accessibility Foundation",
    "source_url": "https://www.w3.org/Translations/WCAG22-nl/",
    "fetch_date": "2025-11-25",
    "translation_date": "12 June 2024"
  },
  "principles": [
    {
      "id": "perceivable",
      "num": "1",
      "handle": "Waarneembaar",
      "title": "Informatie en componenten...",
      "versions": ["2.0", "2.1", "2.2"],
      "guidelines": [
        {
          "id": "text-alternatives",
          "num": "1.1",
          "handle": "Tekstalternatieven",
          "title": "Lever tekstalternatieven...",
          "versions": ["2.0", "2.1", "2.2"],
          "successcriteria": [
            {
              "id": "non-text-content",
              "num": "1.1.1",
              "handle": "Niet-tekstuele content",
              "title": "Alle niet-tekstuele content...",
              "level": "A",
              "versions": ["2.0", "2.1", "2.2"]
            }
          ]
        }
      ]
    }
  ]
}
```

## Scripts

### Fetch Translations

Downloads HTML from W3C for all authorized translations:

```bash
bun run data/wcag-translations/scripts/fetch-translations.ts

# Options:
#   --force    Re-download existing files
#   --dry-run  Preview without downloading
```

### Parse HTML to JSON

Converts downloaded HTML to structured JSON:

```bash
bun run data/wcag-translations/scripts/parse-wcag-html.ts
```

### Validate Translations

Checks JSON files against expected structure:

```bash
bun run data/wcag-translations/scripts/validate-translations.ts
```

## Translation Sources

### WCAG 2.2 Authorized Translations

| Language | Code | Translator | Date |
|----------|------|------------|------|
| Catalan | ca | Universitat de Barcelona | May 2024 |
| Dutch | nl | Accessibility Foundation | June 2024 |
| French | fr | Access42 | March 2025 |
| Italian | it | IWA | December 2023 |
| Portuguese (BR) | pt-BR | Ceweb.br | March 2025 |

### WCAG 2.1 Authorized Translations

| Language | Code | Translator | Date |
|----------|------|------------|------|
| Arabic | ar | Mada Center (Qatar) | November 2021 |
| Chinese | zh | Zhejiang University | March 2019 |
| Danish | da | Digitaliseringsstyrelsen | December 2019 |
| Finnish | fi | Kehitysvammaliitto | November 2019 |
| Norwegian | no | Digitaliseringsdirektoratet | June 2021 |
| Polish | pl | Fundacja Instytut Rozwoju | April 2021 |
| Ukrainian | uk | UNDP Ukraine | February 2023 |

## Updating Translations

To update translations when new versions are published:

1. Update `translation-credits.json` with new translation URLs
2. Run `fetch-translations.ts --force` to re-download HTML
3. Run `parse-wcag-html.ts` to regenerate JSON
4. Run `validate-translations.ts` to verify
5. Commit changes

## Known Issues

### Arabic (WCAG 2.1)
- Missing SC from guidelines 1.2, 1.3, 1.4
- Source HTML has inconsistent structure
- 61/78 SC parsed (22% incomplete)

### Ukrainian (WCAG 2.1)
- Conformance section parsed as 5th principle
- Extra phantom SC (5.x.x)
- URL uses `-ua` instead of standard `-uk` code

## Authorization Types

- **authorized**: Official W3C Authorized Translation
- **candidate_authorized**: Under W3C authorization process
- **unofficial**: Community translation, not W3C endorsed

All translations in this repository are authorized unless noted otherwise.

## License

WCAG content is copyright W3C. Translations are provided under the [W3C Document License](https://www.w3.org/copyright/document-license-2023/).

## Last Updated

- Fetch date: 2025-11-25
- Parser version: 1.0.0
