#!/usr/bin/env bun
/**
 * validate-translations.ts
 *
 * Validates parsed WCAG translation JSON files against the English reference.
 * Checks criterion counts, numbering consistency, and reports issues.
 *
 * Usage:
 *   bun run data/wcag-translations/scripts/validate-translations.ts
 */

import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import type {
  WcagTranslation,
  Principle,
  Guideline,
  SuccessCriterion,
  ValidationResult,
  ValidationStats,
} from './types.js';

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const JSON_DIR = join(__dirname, '../json');

// Expected SC counts
const EXPECTED_SC_COUNTS: Record<string, number> = {
  '2.2': 87,
  '2.1': 78,
  '2.0': 61,
};

interface DetailedValidation extends ValidationResult {
  filename: string;
  missingCriteria: string[];
  extraCriteria: string[];
}

/**
 * Counts success criteria in a translation
 */
function countSuccessCriteria(translation: WcagTranslation): number {
  let count = 0;
  for (const principle of translation.principles) {
    for (const guideline of principle.guidelines) {
      count += guideline.successcriteria.length;
    }
  }
  return count;
}

/**
 * Extracts all SC numbers from a translation
 */
function extractScNumbers(translation: WcagTranslation): Set<string> {
  const numbers = new Set<string>();
  for (const principle of translation.principles) {
    for (const guideline of principle.guidelines) {
      for (const sc of guideline.successcriteria) {
        numbers.add(sc.num);
      }
    }
  }
  return numbers;
}

/**
 * Gets the expected SC numbers for a WCAG version
 */
function getExpectedScNumbers(version: string): Set<string> {
  // Expected SC numbers for each version
  const wcag20 = [
    '1.1.1',
    '1.2.1',
    '1.2.2',
    '1.2.3',
    '1.2.4',
    '1.2.5',
    '1.2.6',
    '1.2.7',
    '1.2.8',
    '1.2.9',
    '1.3.1',
    '1.3.2',
    '1.3.3',
    '1.4.1',
    '1.4.2',
    '1.4.3',
    '1.4.4',
    '1.4.5',
    '1.4.6',
    '1.4.7',
    '1.4.8',
    '1.4.9',
    '2.1.1',
    '2.1.2',
    '2.1.3',
    '2.2.1',
    '2.2.2',
    '2.2.3',
    '2.2.4',
    '2.2.5',
    '2.3.1',
    '2.3.2',
    '2.4.1',
    '2.4.2',
    '2.4.3',
    '2.4.4',
    '2.4.5',
    '2.4.6',
    '2.4.7',
    '2.4.8',
    '2.4.9',
    '2.4.10',
    '3.1.1',
    '3.1.2',
    '3.1.3',
    '3.1.4',
    '3.1.5',
    '3.1.6',
    '3.2.1',
    '3.2.2',
    '3.2.3',
    '3.2.4',
    '3.2.5',
    '3.3.1',
    '3.3.2',
    '3.3.3',
    '3.3.4',
    '3.3.5',
    '3.3.6',
    '4.1.1',
    '4.1.2',
  ];

  const wcag21Added = [
    '1.3.4',
    '1.3.5',
    '1.3.6',
    '1.4.10',
    '1.4.11',
    '1.4.12',
    '1.4.13',
    '2.1.4',
    '2.2.6',
    '2.3.3',
    '2.5.1',
    '2.5.2',
    '2.5.3',
    '2.5.4',
    '2.5.5',
    '2.5.6',
    '4.1.3',
  ];

  const wcag22Added = [
    '2.4.11',
    '2.4.12',
    '2.4.13',
    '2.5.7',
    '2.5.8',
    '3.2.6',
    '3.3.7',
    '3.3.8',
    '3.3.9',
  ];

  // WCAG 2.2 removed 4.1.1
  const wcag22Removed = ['4.1.1'];

  let scList: string[] = [];

  if (version === '2.0') {
    scList = [...wcag20];
  } else if (version === '2.1') {
    scList = [...wcag20, ...wcag21Added];
  } else if (version === '2.2') {
    scList = [...wcag20, ...wcag21Added, ...wcag22Added].filter(
      (sc) => !wcag22Removed.includes(sc)
    );
  }

  return new Set(scList);
}

/**
 * Validates a single translation file
 */
async function validateTranslation(
  filepath: string,
  filename: string
): Promise<DetailedValidation> {
  const content = await readFile(filepath, 'utf-8');
  const translation: WcagTranslation = JSON.parse(content);

  const errors: string[] = [];
  const warnings: string[] = [];
  const version = translation.metadata.wcag_version;

  // Get expected SC
  const expectedSc = getExpectedScNumbers(version);
  const actualSc = extractScNumbers(translation);

  // Find missing and extra criteria
  const missingCriteria: string[] = [];
  const extraCriteria: string[] = [];

  for (const expected of expectedSc) {
    if (!actualSc.has(expected)) {
      missingCriteria.push(expected);
    }
  }

  for (const actual of actualSc) {
    if (!expectedSc.has(actual)) {
      extraCriteria.push(actual);
    }
  }

  // Check criterion count
  const scCount = countSuccessCriteria(translation);
  const expectedCount = EXPECTED_SC_COUNTS[version] || 0;

  if (scCount !== expectedCount) {
    if (missingCriteria.length > 0) {
      errors.push(`Missing ${missingCriteria.length} SC: ${missingCriteria.slice(0, 5).join(', ')}${missingCriteria.length > 5 ? '...' : ''}`);
    }
    if (extraCriteria.length > 0) {
      errors.push(`Extra ${extraCriteria.length} SC: ${extraCriteria.slice(0, 5).join(', ')}${extraCriteria.length > 5 ? '...' : ''}`);
    }
  }

  // Check principle count
  if (translation.principles.length !== 4) {
    errors.push(`Principle count: ${translation.principles.length} (expected 4)`);
  }

  // Check for empty translations
  let emptyCount = 0;
  for (const principle of translation.principles) {
    if (!principle.handle || !principle.title) emptyCount++;
    for (const guideline of principle.guidelines) {
      if (!guideline.handle) emptyCount++;
      for (const sc of guideline.successcriteria) {
        if (!sc.handle || !sc.title) emptyCount++;
      }
    }
  }

  if (emptyCount > 0) {
    warnings.push(`${emptyCount} empty/missing translations`);
  }

  // Count stats
  let guidelineCount = 0;
  for (const p of translation.principles) {
    guidelineCount += p.guidelines.length;
  }

  return {
    filename,
    language: translation.metadata.language,
    version,
    valid: errors.length === 0,
    errors,
    warnings,
    missingCriteria,
    extraCriteria,
    stats: {
      principleCount: translation.principles.length,
      guidelineCount,
      criterionCount: scCount,
      missingTranslations: emptyCount,
    },
  };
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('WCAG Translation Validator');
  console.log('='.repeat(60));
  console.log();

  const results: DetailedValidation[] = [];

  // Validate WCAG 2.2 translations
  console.log('WCAG 2.2 Translations:');
  console.log('-'.repeat(40));

  try {
    const wcag22Dir = join(JSON_DIR, 'wcag22');
    const wcag22Files = (await readdir(wcag22Dir)).filter((f) => f.endsWith('.json'));

    for (const filename of wcag22Files) {
      const filepath = join(wcag22Dir, filename);
      const result = await validateTranslation(filepath, filename);
      results.push(result);

      const status = result.valid ? '\u2713' : '\u2717';
      console.log(`  ${status} ${result.language} (${filename}): ${result.stats.criterionCount} SC`);

      if (result.errors.length > 0) {
        for (const error of result.errors) {
          console.log(`      Error: ${error}`);
        }
      }
      if (result.warnings.length > 0) {
        for (const warning of result.warnings) {
          console.log(`      Warning: ${warning}`);
        }
      }
    }
  } catch (error) {
    console.log('  No WCAG 2.2 translations found');
  }

  // Validate WCAG 2.1 translations
  console.log('\nWCAG 2.1 Translations:');
  console.log('-'.repeat(40));

  try {
    const wcag21Dir = join(JSON_DIR, 'wcag21');
    const wcag21Files = (await readdir(wcag21Dir)).filter((f) => f.endsWith('.json'));

    for (const filename of wcag21Files) {
      const filepath = join(wcag21Dir, filename);
      const result = await validateTranslation(filepath, filename);
      results.push(result);

      const status = result.valid ? '\u2713' : '\u2717';
      console.log(`  ${status} ${result.language} (${filename}): ${result.stats.criterionCount} SC`);

      if (result.errors.length > 0) {
        for (const error of result.errors) {
          console.log(`      Error: ${error}`);
        }
      }
      if (result.warnings.length > 0) {
        for (const warning of result.warnings) {
          console.log(`      Warning: ${warning}`);
        }
      }
    }
  } catch (error) {
    console.log('  No WCAG 2.1 translations found');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));

  const valid = results.filter((r) => r.valid);
  const invalid = results.filter((r) => !r.valid);

  console.log(`\nValid translations:   ${valid.length}/${results.length}`);
  console.log(`Invalid translations: ${invalid.length}/${results.length}`);

  if (invalid.length > 0) {
    console.log('\nInvalid files:');
    for (const r of invalid) {
      console.log(`  - ${r.filename} (${r.language})`);
      if (r.missingCriteria.length > 0) {
        console.log(`    Missing: ${r.missingCriteria.join(', ')}`);
      }
      if (r.extraCriteria.length > 0) {
        console.log(`    Extra: ${r.extraCriteria.join(', ')}`);
      }
    }
  }

  // Exit with error code if any invalid
  if (invalid.length > 0) {
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
