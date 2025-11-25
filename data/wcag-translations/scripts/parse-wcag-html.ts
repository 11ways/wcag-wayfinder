#!/usr/bin/env bun
/**
 * parse-wcag-html.ts
 *
 * Parses WCAG HTML files from W3C and converts them to JSON format.
 * Supports both WCAG 2.1 and 2.2 HTML structures.
 *
 * Usage:
 *   bun run data/wcag-translations/scripts/parse-wcag-html.ts
 *
 * Output:
 *   Creates JSON files in data/wcag-translations/json/{wcag21,wcag22}/
 */

import * as cheerio from 'cheerio';
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

import {
  type Principle,
  type Guideline,
  type SuccessCriterion,
  type WcagTranslation,
  type TranslationMetadata,
  type TranslationCredits,
  type TranslationEntry,
  type WcagDetail,
  type WcagDetailItem,
  TARGET_LANGUAGES,
  getLanguageCode,
} from './types.js';

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../../..');
const RAW_HTML_DIR = join(__dirname, '../raw-html');
const JSON_DIR = join(__dirname, '../json');
const TRANSLATION_CREDITS_PATH = join(PROJECT_ROOT, 'translation-credits.json');

// Principle ID mapping
const PRINCIPLE_IDS: Record<string, string> = {
  '1': 'perceivable',
  '2': 'operable',
  '3': 'understandable',
  '4': 'robust',
};

// Level text mapping (handles translations)
const LEVEL_PATTERNS: Record<string, 'A' | 'AA' | 'AAA'> = {
  '(Level A)': 'A',
  '(Level AA)': 'AA',
  '(Level AAA)': 'AAA',
  '(Niveau A)': 'A', // Dutch/French/Danish
  '(Niveau AA)': 'AA',
  '(Niveau AAA)': 'AAA',
  '(Livello A)': 'A', // Italian
  '(Livello AA)': 'AA',
  '(Livello AAA)': 'AAA',
  '(Nivell A)': 'A', // Catalan
  '(Nivell AA)': 'AA',
  '(Nivell AAA)': 'AAA',
  '(N\u00edvel A)': 'A', // Portuguese
  '(N\u00edvel AA)': 'AA',
  '(N\u00edvel AAA)': 'AAA',
  // Arabic
  '(\u0627\u0644\u0645\u0633\u062a\u0648\u0649 A)': 'A',
  '(\u0627\u0644\u0645\u0633\u062a\u0648\u0649 AA)': 'AA',
  '(\u0627\u0644\u0645\u0633\u062a\u0648\u0649 AAA)': 'AAA',
  // Chinese
  '(\u7ea7\u522b A)': 'A',
  '(\u7ea7\u522b AA)': 'AA',
  '(\u7ea7\u522b AAA)': 'AAA',
  // Finnish
  '(Taso A)': 'A',
  '(Taso AA)': 'AA',
  '(Taso AAA)': 'AAA',
  // Norwegian
  '(Niv\u00e5 A)': 'A',
  '(Niv\u00e5 AA)': 'AA',
  '(Niv\u00e5 AAA)': 'AAA',
  // Polish
  '(Poziom A)': 'A',
  '(Poziom AA)': 'AA',
  '(Poziom AAA)': 'AAA',
  // Ukrainian
  '(\u0420\u0456\u0432\u0435\u043d\u044c A)': 'A',
  '(\u0420\u0456\u0432\u0435\u043d\u044c AA)': 'AA',
  '(\u0420\u0456\u0432\u0435\u043d\u044c AAA)': 'AAA',
};

/**
 * Extracts the conformance level from text
 */
function extractLevel(text: string): 'A' | 'AA' | 'AAA' {
  const normalized = text.trim();

  // Direct pattern match
  for (const [pattern, level] of Object.entries(LEVEL_PATTERNS)) {
    if (normalized.includes(pattern)) {
      return level;
    }
  }

  // Fallback regex: look for A, AA, or AAA
  const match = normalized.match(/\b(AAA|AA|A)\b/);
  if (match) {
    return match[1] as 'A' | 'AA' | 'AAA';
  }

  console.warn(`  Warning: Could not extract level from: "${normalized}"`);
  return 'A'; // Default fallback
}

/**
 * Extracts number from section header (e.g., "1.1.1" from "Success Criterion 1.1.1 Non-text Content")
 */
function extractNumber(text: string): string {
  const match = text.match(/(\d+(?:\.\d+)*)/);
  return match ? match[1] : '';
}

/**
 * Extracts the title (handle) from a heading, removing the number prefix
 */
function extractTitle(text: string): string {
  // Remove various prefixes like "1. ", "Guideline 1.1 ", "Success Criterion 1.1.1 "
  let title = text
    .replace(/^\d+\.\s*/, '') // "1. Perceivable"
    .replace(/^Guideline\s+\d+\.\d+\s*/i, '') // "Guideline 1.1 Text Alternatives"
    .replace(/^Success\s+Criterion\s+\d+\.\d+\.\d+\s*/i, '') // "Success Criterion 1.1.1 Non-text Content"
    .replace(/^Richtlijn\s+\d+\.\d+\s*/i, '') // Dutch guideline
    .replace(/^Succescriterium\s+\d+\.\d+\.\d+\s*/i, '') // Dutch SC
    .replace(/^Crit\u00e8re\s+de\s+succ\u00e8s\s+\d+\.\d+\.\d+\s*/i, '') // French SC
    .replace(/^R\u00e8gle\s+\d+\.\d+\s*/i, '') // French guideline
    .replace(/^Criterio\s+di\s+successo\s+\d+\.\d+\.\d+\s*/i, '') // Italian SC
    .replace(/^Linea\s+guida\s+\d+\.\d+\s*/i, '') // Italian guideline
    .replace(/^Criteri\s+d['']exit\s+\d+\.\d+\.\d+\s*/i, '') // Catalan SC
    .replace(/^Directriu\s+\d+\.\d+\s*/i, '') // Catalan guideline
    .replace(/^Crit\u00e9rio\s+de\s+Sucesso\s+\d+\.\d+\.\d+\s*/i, '') // Portuguese SC
    .replace(/^Diretriz\s+\d+\.\d+\s*/i, '') // Portuguese guideline
    .trim();

  // Also handle secno spans that might be in there
  title = title.replace(/^\d+\.\d+\.?\d*\s*/, '');

  return title;
}

/**
 * Cleans HTML content, removing doclinks and extra whitespace
 */
function cleanContent($: cheerio.CheerioAPI, $el: cheerio.Cheerio<cheerio.Element>): string {
  // Clone to avoid modifying original
  const $clone = $el.clone();

  // Remove doclinks, headers, and other non-content elements
  $clone.find('.doclinks, .header-wrapper, h2, h3, h4, .conformance-level, section').remove();

  // Get text content
  let text = $clone
    .html()
    ?.replace(/<[^>]+>/g, ' ') // Strip tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return text || '';
}

/**
 * Parses a success criterion section
 */
function parseSuccessCriterion(
  $: cheerio.CheerioAPI,
  $el: cheerio.Cheerio<cheerio.Element>
): SuccessCriterion | null {
  const id = $el.attr('id') || '';

  // Get the heading (h4)
  const $heading = $el.find('h4').first();
  const headingText = $heading.text().trim();

  // Extract number
  const num = extractNumber(headingText);
  if (!num || !num.includes('.')) {
    return null; // Not a valid SC
  }

  // Extract title (handle)
  const handle = extractTitle(headingText);

  // Get conformance level
  const levelText = $el.find('.conformance-level').first().text();
  const level = extractLevel(levelText);

  // Get the content paragraph (first p that's not conformance-level)
  const $contentP = $el.find('> p:not(.conformance-level)').first();
  const title = $contentP.text().trim() || handle;

  // Determine WCAG versions (based on num)
  const versions = getVersionsForSC(num);

  // Extract <dl> elements as details (exception lists, etc.)
  const details: WcagDetail[] = [];

  $el.find('> dl').each((_, dlEl) => {
    const $dl = $(dlEl);
    const items: WcagDetailItem[] = [];

    $dl.find('dt').each((_, dtEl) => {
      const $dt = $(dtEl);
      const $dd = $dt.next('dd');

      // Get the text content, preserving links as HTML
      const ddHtml = $dd.find('p').first().html()?.trim() || $dd.html()?.trim() || '';

      // Clean up the HTML - remove internal links but keep the text
      const cleanedText = ddHtml
        .replace(/<a[^>]*class="internalDFN"[^>]*>([^<]*)<\/a>/g, '$1')
        .replace(/<a[^>]*href="#[^"]*"[^>]*>([^<]*)<\/a>/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanedText) {
        items.push({
          handle: $dt.text().trim(),
          text: cleanedText,
        });
      }
    });

    if (items.length > 0) {
      details.push({ type: 'ulist', items });
    }
  });

  // Also extract notes (div.note or p.note)
  $el.find('.note').each((_, noteEl) => {
    const $note = $(noteEl);
    const noteText = $note.text().trim();
    if (noteText) {
      details.push({ type: 'note', text: noteText });
    }
  });

  return {
    id,
    num,
    handle,
    title,
    level,
    versions,
    ...(details.length > 0 && { details }),
  };
}

/**
 * Determines which WCAG versions include a given success criterion
 */
function getVersionsForSC(num: string): string[] {
  // Success criteria added in WCAG 2.2
  const wcag22Only = [
    '2.4.11', // Focus Not Obscured (Minimum)
    '2.4.12', // Focus Not Obscured (Enhanced)
    '2.4.13', // Focus Appearance
    '2.5.7', // Dragging Movements
    '2.5.8', // Target Size (Minimum)
    '3.2.6', // Consistent Help
    '3.3.7', // Redundant Entry
    '3.3.8', // Accessible Authentication (Minimum)
    '3.3.9', // Accessible Authentication (Enhanced)
  ];

  // Success criteria added in WCAG 2.1
  const wcag21Only = [
    '1.3.4', // Orientation
    '1.3.5', // Identify Input Purpose
    '1.3.6', // Identify Purpose
    '1.4.10', // Reflow
    '1.4.11', // Non-text Contrast
    '1.4.12', // Text Spacing
    '1.4.13', // Content on Hover or Focus
    '2.1.4', // Character Key Shortcuts
    '2.2.6', // Timeouts
    '2.3.3', // Animation from Interactions
    '2.5.1', // Pointer Gestures
    '2.5.2', // Pointer Cancellation
    '2.5.3', // Label in Name
    '2.5.4', // Motion Actuation
    '2.5.5', // Target Size (Enhanced)
    '2.5.6', // Concurrent Input Mechanisms
    '4.1.3', // Status Messages
  ];

  if (wcag22Only.includes(num)) {
    return ['2.2'];
  }

  if (wcag21Only.includes(num)) {
    return ['2.1', '2.2'];
  }

  return ['2.0', '2.1', '2.2'];
}

/**
 * Parses a guideline section
 */
function parseGuideline(
  $: cheerio.CheerioAPI,
  $el: cheerio.Cheerio<cheerio.Element>
): Guideline | null {
  const id = $el.attr('id') || '';

  // Get the heading (h3)
  const $heading = $el.find('> .header-wrapper h3, > h3').first();
  const headingText = $heading.text().trim();

  // Extract number
  const num = extractNumber(headingText);
  if (!num || num.split('.').length !== 2) {
    return null; // Not a valid guideline number
  }

  // Extract title (handle)
  const handle = extractTitle(headingText);

  // Get intro paragraph
  const $intro = $el.find('> p').first();
  const title = $intro.text().trim() || handle;

  // Parse success criteria - look for multiple selectors
  // SC may have class="sc", class="guideline" (in English), or no class at all (Portuguese)
  const successcriteria: SuccessCriterion[] = [];
  $el.find('section').each((_, scEl) => {
    const $scEl = $(scEl);
    // Check if it's actually an SC (has h4 with SC number pattern)
    const $h4 = $scEl.find('> .header-wrapper h4, > h4, > div.header-wrapper h4').first();
    const h4Text = $h4.text().trim();
    const scNum = extractNumber(h4Text);

    // Valid SC has 3-part number (e.g., 1.1.1) and belongs to this guideline
    if (scNum && scNum.split('.').length === 3 && scNum.startsWith(num + '.')) {
      const sc = parseSuccessCriterion($, $scEl);
      if (sc) {
        successcriteria.push(sc);
      }
    }
  });

  // Determine versions
  const versions = getVersionsForGuideline(num);

  return {
    id,
    num,
    handle,
    title,
    versions,
    successcriteria,
  };
}

/**
 * Determines which WCAG versions include a given guideline
 */
function getVersionsForGuideline(num: string): string[] {
  // All guidelines exist in all versions
  return ['2.0', '2.1', '2.2'];
}

/**
 * Parses a principle section
 */
function parsePrinciple($: cheerio.CheerioAPI, $el: cheerio.Cheerio<cheerio.Element>): Principle | null {
  const id = $el.attr('id') || '';

  // Get the heading (h2)
  const $heading = $el.find('> .header-wrapper h2, > h2').first();
  const headingText = $heading.text().trim();

  // Extract number
  const num = extractNumber(headingText);
  if (!num || num.length !== 1) {
    return null; // Not a valid principle number
  }

  // Extract handle
  const handle = extractTitle(headingText);

  // Get intro paragraph
  const $intro = $el.find('> p').first();
  const title = $intro.text().trim() || handle;

  // Parse guidelines - be flexible about class names
  // Some translations don't have class="guideline" on all sections
  const guidelines: Guideline[] = [];
  const guidelineMap = new Map<string, Guideline>();

  // First try sections with guideline class
  $el.find('> section.guideline').each((_, glEl) => {
    const guideline = parseGuideline($, $(glEl));
    if (guideline) {
      guidelines.push(guideline);
      guidelineMap.set(guideline.num, guideline);
    }
  });

  // Also try any section that has an h3 with a guideline number pattern
  $el.find('> section').each((_, sectionEl) => {
    const $section = $(sectionEl);
    // Skip if already parsed as guideline
    if ($section.hasClass('guideline')) return;

    // Check if this looks like a guideline (has h3 with X.Y pattern)
    const $h3 = $section.find('> .header-wrapper h3, > h3, > div.header-wrapper h3').first();
    const h3Text = $h3.text().trim();
    const glNum = extractNumber(h3Text);

    if (glNum && glNum.split('.').length === 2 && glNum.startsWith(num + '.')) {
      // Check if we already have this guideline
      if (guidelineMap.has(glNum)) return;

      const guideline = parseGuideline($, $section);
      if (guideline) {
        guidelines.push(guideline);
        guidelineMap.set(guideline.num, guideline);
      }
    }
  });

  // Also look for orphaned SC that are direct children of principle (Arabic)
  // or siblings of guidelines that ended up outside (Dutch WCAG 2.2)
  $el.find('> section.sc, > section[class="sc"]').each((_, scEl) => {
    const $scEl = $(scEl);
    const $h4 = $scEl.find('> .header-wrapper h4, > h4, > div.header-wrapper h4').first();
    const h4Text = $h4.text().trim();
    const scNum = extractNumber(h4Text);

    if (scNum && scNum.split('.').length === 3) {
      // Determine which guideline this SC belongs to
      const glNum = scNum.split('.').slice(0, 2).join('.');
      let guideline = guidelineMap.get(glNum);

      // If guideline doesn't exist, create a placeholder
      if (!guideline) {
        guideline = {
          id: `guideline-${glNum.replace('.', '-')}`,
          num: glNum,
          handle: `Guideline ${glNum}`,
          title: '',
          versions: ['2.0', '2.1', '2.2'],
          successcriteria: [],
        };
        guidelines.push(guideline);
        guidelineMap.set(glNum, guideline);
      }

      const sc = parseSuccessCriterion($, $scEl);
      if (sc && !guideline.successcriteria.find((s) => s.num === sc.num)) {
        guideline.successcriteria.push(sc);
      }
    }
  });

  // Sort guidelines by number
  guidelines.sort((a, b) => {
    const [aMaj, aMin] = a.num.split('.').map(Number);
    const [bMaj, bMin] = b.num.split('.').map(Number);
    return aMaj !== bMaj ? aMaj - bMaj : aMin - bMin;
  });

  // Sort success criteria within each guideline
  for (const gl of guidelines) {
    gl.successcriteria.sort((a, b) => {
      const aParts = a.num.split('.').map(Number);
      const bParts = b.num.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
      }
      return 0;
    });
  }

  return {
    id: PRINCIPLE_IDS[num] || id,
    num,
    handle,
    title,
    versions: ['2.0', '2.1', '2.2'],
    guidelines,
  };
}

/**
 * Parses a WCAG HTML file and returns the structured data
 */
function parseWcagHtml(html: string): Principle[] {
  const $ = cheerio.load(html);
  const principles: Principle[] = [];
  const principleMap = new Map<string, Principle>();

  // Find all principle sections
  $('section.principle').each((_, el) => {
    const principle = parsePrinciple($, $(el));
    if (principle) {
      principles.push(principle);
      principleMap.set(principle.num, principle);
    }
  });

  // Also look for orphaned SC that are completely outside principle sections
  // This handles cases like Dutch WCAG 2.2 where 3.3.7-3.3.9 are outside
  $('body > section.sc, section.principle ~ section.sc').each((_, scEl) => {
    const $scEl = $(scEl);
    const $h4 = $scEl.find('> .header-wrapper h4, > h4, > div.header-wrapper h4').first();
    const h4Text = $h4.text().trim();
    const scNum = extractNumber(h4Text);

    if (scNum && scNum.split('.').length === 3) {
      const principleNum = scNum.split('.')[0];
      const glNum = scNum.split('.').slice(0, 2).join('.');

      let principle = principleMap.get(principleNum);
      if (!principle) return; // Can't add to unknown principle

      let guideline = principle.guidelines.find((g) => g.num === glNum);
      if (!guideline) {
        // Create placeholder guideline
        guideline = {
          id: `guideline-${glNum.replace('.', '-')}`,
          num: glNum,
          handle: `Guideline ${glNum}`,
          title: '',
          versions: ['2.0', '2.1', '2.2'],
          successcriteria: [],
        };
        principle.guidelines.push(guideline);
        // Resort guidelines
        principle.guidelines.sort((a, b) => {
          const [aMaj, aMin] = a.num.split('.').map(Number);
          const [bMaj, bMin] = b.num.split('.').map(Number);
          return aMaj !== bMaj ? aMaj - bMaj : aMin - bMin;
        });
      }

      const sc = parseSuccessCriterion($, $scEl);
      if (sc && !guideline.successcriteria.find((s) => s.num === sc.num)) {
        guideline.successcriteria.push(sc);
        // Resort SC
        guideline.successcriteria.sort((a, b) => {
          const aParts = a.num.split('.').map(Number);
          const bParts = b.num.split('.').map(Number);
          for (let i = 0; i < 3; i++) {
            if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
          }
          return 0;
        });
      }
    }
  });

  return principles;
}

/**
 * Gets metadata for a translation file
 */
function getMetadataForFile(
  filename: string,
  credits: TranslationCredits
): TranslationMetadata | null {
  // Parse filename: wcag22-nl.html -> version=2.2, lang=nl
  const match = filename.match(/wcag(\d)(\d)-([a-z-]+)\.html/i);
  if (!match) return null;

  const version = `${match[1]}.${match[2]}`;
  const langCode = match[3];

  // Special case for English
  if (langCode === 'en') {
    return {
      wcag_version: version,
      language: 'en',
      language_native: 'English',
      authorization_type: 'authorized',
      translator: 'W3C',
      source_url: `https://www.w3.org/TR/WCAG${match[1]}${match[2]}/`,
      fetch_date: new Date().toISOString().split('T')[0],
      translation_date: version === '2.2' ? '2023-10-05' : '2018-06-05',
    };
  }

  // Find matching entry in credits
  const entry = credits.translations.find((t) => {
    const code = getLanguageCode(t.language_english);
    return code === langCode && t.wcag_version === version;
  });

  if (!entry) {
    // Try to find by language code for different version
    const anyEntry = credits.translations.find((t) => getLanguageCode(t.language_english) === langCode);
    if (!anyEntry) return null;

    return {
      wcag_version: version,
      language: langCode,
      language_native: anyEntry.language_native,
      authorization_type: 'authorized',
      translator: 'Unknown',
      source_url: `https://www.w3.org/Translations/WCAG${match[1]}${match[2]}-${langCode}/`,
      fetch_date: new Date().toISOString().split('T')[0],
      translation_date: null,
    };
  }

  return {
    wcag_version: version,
    language: langCode,
    language_native: entry.language_native,
    authorization_type: entry.authorization_type,
    translator: entry.translator,
    source_url: entry.url,
    fetch_date: new Date().toISOString().split('T')[0],
    translation_date: entry.date,
  };
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('WCAG HTML to JSON Parser');
  console.log('='.repeat(60));
  console.log();

  // Create output directories
  await mkdir(join(JSON_DIR, 'wcag22'), { recursive: true });
  await mkdir(join(JSON_DIR, 'wcag21'), { recursive: true });

  // Load translation credits for metadata
  const creditsContent = await readFile(TRANSLATION_CREDITS_PATH, 'utf-8');
  const credits: TranslationCredits = JSON.parse(creditsContent);

  // Get list of HTML files
  const htmlFiles = (await readdir(RAW_HTML_DIR)).filter((f) => f.endsWith('.html'));
  console.log(`Found ${htmlFiles.length} HTML files to parse\n`);

  const results: Array<{ file: string; success: boolean; scCount: number; error?: string }> = [];

  for (const htmlFile of htmlFiles) {
    console.log(`Parsing ${htmlFile}...`);

    try {
      // Read HTML
      const htmlPath = join(RAW_HTML_DIR, htmlFile);
      const html = await readFile(htmlPath, 'utf-8');

      // Get metadata
      const metadata = getMetadataForFile(htmlFile, credits);
      if (!metadata) {
        console.log(`  Skipping: Could not determine metadata for ${htmlFile}`);
        results.push({ file: htmlFile, success: false, scCount: 0, error: 'No metadata' });
        continue;
      }

      // Parse HTML
      const principles = parseWcagHtml(html);

      // Count success criteria
      let scCount = 0;
      for (const p of principles) {
        for (const g of p.guidelines) {
          scCount += g.successcriteria.length;
        }
      }

      // Create output
      const translation: WcagTranslation = {
        metadata,
        principles,
      };

      // Determine output path
      const versionDir = metadata.wcag_version === '2.2' ? 'wcag22' : 'wcag21';
      const jsonFilename = htmlFile.replace('.html', '.json');
      const jsonPath = join(JSON_DIR, versionDir, jsonFilename);

      // Write JSON
      await writeFile(jsonPath, JSON.stringify(translation, null, 2), 'utf-8');

      console.log(`  Saved: ${versionDir}/${jsonFilename}`);
      console.log(`  Principles: ${principles.length}, SC: ${scCount}`);

      results.push({ file: htmlFile, success: true, scCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  Error: ${message}`);
      results.push({ file: htmlFile, success: false, scCount: 0, error: message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\nParsed: ${successful.length}/${results.length} files`);

  if (successful.length > 0) {
    console.log('\nSuccess criterion counts:');
    for (const r of successful) {
      console.log(`  ${r.file}: ${r.scCount} SC`);
    }
  }

  if (failed.length > 0) {
    console.log('\nFailed files:');
    for (const r of failed) {
      console.log(`  ${r.file}: ${r.error}`);
    }
  }
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
