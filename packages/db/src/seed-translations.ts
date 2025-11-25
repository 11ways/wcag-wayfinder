import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDb, closeDb } from './client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(__dirname, '..', '..', '..');
const TRANSLATIONS_DIR = join(workspaceRoot, 'data', 'wcag-translations');
const MANIFEST_PATH = join(TRANSLATIONS_DIR, 'translation-manifest.json');

interface TranslationMetadata {
  language: string;
  language_native: string;
  wcag_version: string;
  authorization_type: string;
  translator: string;
  translator_type?: string;
  w3c_authorization_status?: string;
  translation_title?: string;
  source_url: string;
  json_file: string;
  fetch_date: string;
  translation_date: string;
  stats: {
    principleCount: number;
    guidelineCount: number;
    criterionCount: number;
    missingTranslations: number;
  };
  notes?: string;
}

interface TranslationManifest {
  generated_at: string;
  wcag_22: TranslationMetadata[];
  wcag_21: TranslationMetadata[];
  wcag_20: TranslationMetadata[];
}

interface SuccessCriterion {
  id: string;
  num: string;
  handle: string;
  title: string;
  level: string;
  versions: string[];
}

interface Guideline {
  id: string;
  num: string;
  handle: string;
  title: string;
  versions: string[];
  successcriteria: SuccessCriterion[];
}

interface Principle {
  id: string;
  num: string;
  handle: string;
  title: string;
  versions: string[];
  guidelines: Guideline[];
}

interface TranslationFile {
  metadata: {
    wcag_version: string;
    language: string;
    language_native: string;
    authorization_type: string;
    translator: string;
    source_url: string;
    fetch_date: string;
    translation_date: string;
  };
  principles: Principle[];
}

export async function seedTranslations() {
  console.log('Starting translation seed process...');

  // Check if manifest exists
  if (!existsSync(MANIFEST_PATH)) {
    console.error('Translation manifest not found at:', MANIFEST_PATH);
    console.log('Run the translation fetch scripts first.');
    return;
  }

  const manifest: TranslationManifest = JSON.parse(
    readFileSync(MANIFEST_PATH, 'utf-8')
  );

  const db = getDb();

  // Clear existing translations
  console.log('Clearing existing translations...');
  db.run('DELETE FROM criteria_translations');
  db.run('DELETE FROM languages');

  // Prepare insert statements
  const insertTranslationStmt = db.prepare(`
    INSERT OR REPLACE INTO criteria_translations (
      criterion_id, language, wcag_version, handle, title,
      principle_handle, guideline_handle, source_url, translator, translation_date
    ) VALUES (
      $criterion_id, $language, $wcag_version, $handle, $title,
      $principle_handle, $guideline_handle, $source_url, $translator, $translation_date
    )
  `);

  const insertLanguageStmt = db.prepare(`
    INSERT OR REPLACE INTO languages (
      code, name, native_name, wcag_version, sc_count, translator, source_url, is_complete,
      authorization_type, w3c_authorization_status, translator_type, translation_date, translation_title
    ) VALUES (
      $code, $name, $native_name, $wcag_version, $sc_count, $translator, $source_url, $is_complete,
      $authorization_type, $w3c_authorization_status, $translator_type, $translation_date, $translation_title
    )
  `);

  // Track stats
  let translationCount = 0;
  let languageCount = 0;
  const processedLanguages = new Set<string>();

  // Process all translations from manifest
  const allTranslations = [
    ...manifest.wcag_22,
    ...manifest.wcag_21,
    ...manifest.wcag_20
  ];

  for (const translationMeta of allTranslations) {
    // Skip English - it's the base data, not a translation
    if (translationMeta.language === 'en') {
      console.log(`  Skipping ${translationMeta.language} (source language)`);
      continue;
    }

    // Skip incomplete translations (noted in manifest)
    if (translationMeta.notes?.includes('Incomplete') ||
        translationMeta.notes?.includes('parsing issues')) {
      console.log(`  Skipping ${translationMeta.language} (${translationMeta.notes})`);
      continue;
    }

    const jsonPath = join(TRANSLATIONS_DIR, translationMeta.json_file);

    if (!existsSync(jsonPath)) {
      console.log(`  Skipping ${translationMeta.language} (file not found: ${translationMeta.json_file})`);
      continue;
    }

    console.log(`  Processing ${translationMeta.language_native} (${translationMeta.language})...`);

    const translationFile: TranslationFile = JSON.parse(
      readFileSync(jsonPath, 'utf-8')
    );

    // Insert language info (only once per language)
    if (!processedLanguages.has(translationMeta.language)) {
      // Determine language name from manifest
      const languageNames: Record<string, string> = {
        'nl': 'Dutch', 'fr': 'French', 'it': 'Italian', 'ca': 'Catalan',
        'pt-BR': 'Portuguese (Brazil)', 'zh': 'Chinese (Simplified)',
        'da': 'Danish', 'fi': 'Finnish', 'no': 'Norwegian', 'pl': 'Polish',
        'ar': 'Arabic', 'uk': 'Ukrainian', 'de': 'German', 'es': 'Spanish'
      };

      // Map authorization_type to readable status
      const authStatusMap: Record<string, string> = {
        'authorized': 'Authorized W3C Translation',
        'candidate_authorized': 'Candidate Authorized Translation',
        'unofficial': 'Unofficial translation (informative)'
      };

      insertLanguageStmt.run({
        $code: translationMeta.language,
        $name: languageNames[translationMeta.language] || translationMeta.language,
        $native_name: translationMeta.language_native,
        $wcag_version: translationMeta.wcag_version,
        $sc_count: translationMeta.stats.criterionCount,
        $translator: translationMeta.translator,
        $source_url: translationMeta.source_url,
        $is_complete: translationMeta.stats.missingTranslations === 0 ? 1 : 0,
        $authorization_type: translationMeta.authorization_type || 'authorized',
        $w3c_authorization_status: translationMeta.w3c_authorization_status || authStatusMap[translationMeta.authorization_type] || 'Authorized W3C Translation',
        $translator_type: translationMeta.translator_type || 'lead_organization',
        $translation_date: translationMeta.translation_date || null,
        $translation_title: translationMeta.translation_title || null
      });

      processedLanguages.add(translationMeta.language);
      languageCount++;
    }

    // Process all success criteria
    for (const principle of translationFile.principles) {
      for (const guideline of principle.guidelines) {
        for (const sc of guideline.successcriteria) {
          insertTranslationStmt.run({
            $criterion_id: sc.id,
            $language: translationMeta.language,
            $wcag_version: translationMeta.wcag_version,
            $handle: sc.handle,
            $title: sc.title,
            $principle_handle: principle.handle,
            $guideline_handle: guideline.handle,
            $source_url: translationMeta.source_url,
            $translator: translationMeta.translator,
            $translation_date: translationMeta.translation_date
          });

          translationCount++;
        }
      }
    }
  }

  console.log('\n✓ Translation seed completed');
  console.log(`  - Imported ${languageCount} languages`);
  console.log(`  - Imported ${translationCount} translated success criteria`);

  closeDb();
}

// Run seed if this file is executed directly
if (import.meta.main) {
  seedTranslations().catch(console.error);
}
