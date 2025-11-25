/**
 * TypeScript types for WCAG translation data
 *
 * These types define the structure for both the input (translation-credits.json)
 * and output (parsed WCAG JSON) formats.
 */

// =============================================================================
// Translation Credits (Input from translation-credits.json)
// =============================================================================

export interface TranslationCreditsSource {
  description: string;
  url: string;
  last_updated_human: string;
}

export type AuthorizationType =
  | 'authorized'
  | 'candidate_authorized'
  | 'unofficial';

export type TranslatorType = 'lead_organization' | 'volunteer_translator';

export interface TranslationEntry {
  wcag_version: '2.0' | '2.1' | '2.2';
  language_english: string;
  language_native: string;
  translation_title: string;
  date: string | null;
  authorization_type: AuthorizationType;
  w3c_authorization_status: string;
  translator_type: TranslatorType;
  translator: string;
  url: string;
}

export interface TranslationCredits {
  source: TranslationCreditsSource;
  translations: TranslationEntry[];
}

// =============================================================================
// Language Code Mapping
// =============================================================================

export const LANGUAGE_CODES: Record<string, string> = {
  Arabic: 'ar',
  Belarusian: 'be',
  'Brazilian Portuguese': 'pt-BR',
  Catalan: 'ca',
  Danish: 'da',
  Dutch: 'nl',
  English: 'en',
  Estonian: 'et',
  'European Portuguese': 'pt-PT',
  Finnish: 'fi',
  French: 'fr',
  German: 'de',
  Hebrew: 'he',
  Hungarian: 'hu',
  Italian: 'it',
  Japanese: 'ja',
  Korean: 'ko',
  Norwegian: 'no',
  Polish: 'pl',
  Russian: 'ru',
  'Simplified Chinese': 'zh',
  Slovak: 'sk',
  Spanish: 'es',
  Swedish: 'sv',
  Ukrainian: 'uk',
};

export function getLanguageCode(languageEnglish: string): string {
  return LANGUAGE_CODES[languageEnglish] || languageEnglish.toLowerCase().slice(0, 2);
}

// =============================================================================
// WCAG JSON Output Structure (matches existing wcag.json format)
// =============================================================================

export interface WcagDetailItem {
  handle: string;
  text: string;
}

export interface WcagDetail {
  type: 'ulist' | 'olist' | 'note';
  items?: WcagDetailItem[];
  text?: string;
}

export interface WcagTechnique {
  id: string;
  technology: string;
  title: string;
  suffix?: string;
}

export interface WcagTechniqueGroup {
  id: string;
  title: string;
  techniques: WcagTechnique[];
}

export interface WcagTechniqueSection {
  title?: string;
  techniques?: WcagTechnique[];
  groups?: WcagTechniqueGroup[];
}

export interface WcagTechniques {
  sufficient?: WcagTechniqueSection[];
  advisory?: WcagTechnique[];
  failure?: WcagTechnique[];
}

export interface SuccessCriterion {
  id: string;
  num: string;
  alt_id?: string[];
  handle: string;
  title: string;
  content?: string;
  versions: string[];
  level: 'A' | 'AA' | 'AAA';
  details?: WcagDetail[];
  techniques?: WcagTechniques;
}

export interface Guideline {
  id: string;
  num: string;
  alt_id?: string[];
  handle: string;
  title: string;
  content?: string;
  versions: string[];
  successcriteria: SuccessCriterion[];
}

export interface Principle {
  id: string;
  num: string;
  handle: string;
  title: string;
  content?: string;
  versions: string[];
  guidelines: Guideline[];
}

// =============================================================================
// Translation Output Format (what we generate)
// =============================================================================

export interface TranslationMetadata {
  wcag_version: string;
  language: string;
  language_native: string;
  authorization_type: AuthorizationType;
  translator: string;
  source_url: string;
  fetch_date: string;
  translation_date: string | null;
}

export interface WcagTranslation {
  metadata: TranslationMetadata;
  principles: Principle[];
}

// =============================================================================
// Validation Results
// =============================================================================

export interface ValidationStats {
  principleCount: number;
  guidelineCount: number;
  criterionCount: number;
  missingTranslations: number;
}

export interface ValidationResult {
  language: string;
  version: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: ValidationStats;
}

// =============================================================================
// Translation Manifest (index of all translations)
// =============================================================================

export interface TranslationManifestEntry {
  language: string;
  language_native: string;
  wcag_version: string;
  authorization_type: AuthorizationType;
  translator: string;
  source_url: string;
  json_file: string;
  fetch_date: string;
  translation_date: string | null;
  stats: ValidationStats;
}

export interface TranslationManifest {
  generated_at: string;
  wcag_22: TranslationManifestEntry[];
  wcag_21: TranslationManifestEntry[];
  wcag_20: TranslationManifestEntry[];
}

// =============================================================================
// Target Languages Configuration (Tiers 1+2)
// =============================================================================

export interface TargetLanguage {
  code: string;
  name_english: string;
  name_native: string;
  wcag_version: '2.1' | '2.2';
  tier: 1 | 2;
}

export const TARGET_LANGUAGES: TargetLanguage[] = [
  // Tier 1: WCAG 2.2 Authorized (5 languages)
  { code: 'ca', name_english: 'Catalan', name_native: 'Catal\u00e0', wcag_version: '2.2', tier: 1 },
  { code: 'nl', name_english: 'Dutch', name_native: 'Nederlands', wcag_version: '2.2', tier: 1 },
  { code: 'fr', name_english: 'French', name_native: 'fran\u00e7ais', wcag_version: '2.2', tier: 1 },
  { code: 'it', name_english: 'Italian', name_native: 'Italiano', wcag_version: '2.2', tier: 1 },
  {
    code: 'pt-BR',
    name_english: 'Brazilian Portuguese',
    name_native: 'Portugu\u00eas do Brasil',
    wcag_version: '2.2',
    tier: 1,
  },

  // Tier 2: WCAG 2.1 Authorized (12 languages - those without 2.2)
  {
    code: 'ar',
    name_english: 'Arabic',
    name_native: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
    wcag_version: '2.1',
    tier: 2,
  },
  {
    code: 'zh',
    name_english: 'Simplified Chinese',
    name_native: '\u7b80\u4f53\u4e2d\u6587',
    wcag_version: '2.1',
    tier: 2,
  },
  { code: 'da', name_english: 'Danish', name_native: 'dansk', wcag_version: '2.1', tier: 2 },
  { code: 'fi', name_english: 'Finnish', name_native: 'suomi', wcag_version: '2.1', tier: 2 },
  { code: 'no', name_english: 'Norwegian', name_native: 'Norsk', wcag_version: '2.1', tier: 2 },
  { code: 'pl', name_english: 'Polish', name_native: 'polski', wcag_version: '2.1', tier: 2 },
  {
    code: 'uk',
    name_english: 'Ukrainian',
    name_native: '\u0443\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430',
    wcag_version: '2.1',
    tier: 2,
  },
];

// Note: German (de) and Korean (ko) excluded - unofficial translations only
