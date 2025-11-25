#!/usr/bin/env bun
/**
 * fetch-translations.ts
 *
 * Downloads WCAG translation HTML files from W3C for authorized translations.
 * Stores them in the raw-html/ directory for subsequent parsing.
 *
 * Usage:
 *   bun run data/wcag-translations/scripts/fetch-translations.ts
 *
 * Options:
 *   --force    Re-download existing files
 *   --dry-run  Show what would be downloaded without actually downloading
 */

import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  type TranslationCredits,
  type TranslationEntry,
  TARGET_LANGUAGES,
  getLanguageCode,
} from './types.js';

// Resolve paths relative to this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../../..');
const RAW_HTML_DIR = join(__dirname, '../raw-html');
const TRANSLATION_CREDITS_PATH = join(PROJECT_ROOT, 'translation-credits.json');

// Parse CLI arguments
const args = process.argv.slice(2);
const FORCE_DOWNLOAD = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');

interface FetchResult {
  language: string;
  version: string;
  url: string;
  status: 'downloaded' | 'skipped' | 'failed';
  error?: string;
  filePath?: string;
}

/**
 * Loads translation credits from the project's translation-credits.json
 */
async function loadTranslationCredits(): Promise<TranslationCredits> {
  const content = await readFile(TRANSLATION_CREDITS_PATH, 'utf-8');
  return JSON.parse(content) as TranslationCredits;
}

/**
 * Generates a filename for a translation HTML file
 */
function getFilename(version: string, languageCode: string): string {
  const versionNum = version.replace('.', '');
  return `wcag${versionNum}-${languageCode}.html`;
}

/**
 * Fetches HTML content from a URL with proper error handling
 */
async function fetchHtml(url: string): Promise<string> {
  console.log(`  Fetching: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'WCAG-Translation-Gatherer/1.0 (https://github.com/wcag-wayfinder)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.text();
}

/**
 * Downloads a single translation and saves it to disk
 */
async function downloadTranslation(
  entry: TranslationEntry,
  languageCode: string
): Promise<FetchResult> {
  const filename = getFilename(entry.wcag_version, languageCode);
  const filepath = join(RAW_HTML_DIR, filename);

  const result: FetchResult = {
    language: entry.language_english,
    version: entry.wcag_version,
    url: entry.url,
    status: 'failed',
    filePath: filepath,
  };

  // Skip if file exists (unless force flag is set)
  if (existsSync(filepath) && !FORCE_DOWNLOAD) {
    console.log(`  Skipping ${filename} (already exists)`);
    result.status = 'skipped';
    return result;
  }

  if (DRY_RUN) {
    console.log(`  Would download: ${filename}`);
    result.status = 'skipped';
    return result;
  }

  try {
    const html = await fetchHtml(entry.url);
    await writeFile(filepath, html, 'utf-8');
    console.log(`  Saved: ${filename} (${(html.length / 1024).toFixed(1)} KB)`);
    result.status = 'downloaded';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`  Error downloading ${entry.language_english}: ${message}`);
    result.status = 'failed';
    result.error = message;
  }

  return result;
}

/**
 * Filters translations to only include our target languages
 */
function filterTargetTranslations(
  translations: TranslationEntry[]
): Map<string, TranslationEntry> {
  const targetMap = new Map<string, TranslationEntry>();

  for (const target of TARGET_LANGUAGES) {
    // Find the matching translation entry
    const entry = translations.find((t) => {
      const code = getLanguageCode(t.language_english);
      return (
        code === target.code &&
        t.wcag_version === target.wcag_version &&
        t.authorization_type === 'authorized'
      );
    });

    if (entry) {
      targetMap.set(`${target.code}-${target.wcag_version}`, entry);
    }
  }

  return targetMap;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('WCAG Translation Fetcher');
  console.log('='.repeat(60));
  console.log();

  if (DRY_RUN) {
    console.log('DRY RUN MODE - No files will be downloaded\n');
  }

  if (FORCE_DOWNLOAD) {
    console.log('FORCE MODE - Re-downloading existing files\n');
  }

  // Ensure raw-html directory exists
  await mkdir(RAW_HTML_DIR, { recursive: true });

  // Load translation credits
  console.log('Loading translation credits...');
  const credits = await loadTranslationCredits();
  console.log(`Found ${credits.translations.length} translations in credits file\n`);

  // Filter to our target languages
  const targetTranslations = filterTargetTranslations(credits.translations);
  console.log(`Target languages to fetch: ${targetTranslations.size}\n`);

  // Group by WCAG version for organized output
  const byVersion = new Map<string, TranslationEntry[]>();
  for (const [key, entry] of targetTranslations) {
    const version = entry.wcag_version;
    if (!byVersion.has(version)) {
      byVersion.set(version, []);
    }
    byVersion.get(version)!.push(entry);
  }

  // Download each version group
  const results: FetchResult[] = [];

  for (const version of ['2.2', '2.1']) {
    const entries = byVersion.get(version) || [];
    if (entries.length === 0) continue;

    console.log(`\nWCAG ${version} Translations (${entries.length} languages):`);
    console.log('-'.repeat(40));

    for (const entry of entries) {
      const code = getLanguageCode(entry.language_english);
      console.log(`\n${entry.language_english} (${code}):`);
      const result = await downloadTranslation(entry, code);
      results.push(result);

      // Small delay to be polite to the server
      if (result.status === 'downloaded') {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  // Also fetch English WCAG 2.2 as reference
  console.log('\n\nFetching English WCAG 2.2 reference:');
  console.log('-'.repeat(40));
  const englishEntry: TranslationEntry = {
    wcag_version: '2.2',
    language_english: 'English',
    language_native: 'English',
    translation_title: 'Web Content Accessibility Guidelines (WCAG) 2.2',
    date: '2023-10-05',
    authorization_type: 'authorized',
    w3c_authorization_status: 'W3C Recommendation',
    translator_type: 'lead_organization',
    translator: 'W3C',
    url: 'https://www.w3.org/TR/WCAG22/',
  };
  console.log('\nEnglish (en):');
  const englishResult = await downloadTranslation(englishEntry, 'en');
  results.push(englishResult);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));

  const downloaded = results.filter((r) => r.status === 'downloaded').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const failed = results.filter((r) => r.status === 'failed').length;

  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped:    ${skipped}`);
  console.log(`Failed:     ${failed}`);

  if (failed > 0) {
    console.log('\nFailed downloads:');
    for (const result of results.filter((r) => r.status === 'failed')) {
      console.log(`  - ${result.language} (${result.version}): ${result.error}`);
    }
  }

  console.log(`\nHTML files saved to: ${RAW_HTML_DIR}`);
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
