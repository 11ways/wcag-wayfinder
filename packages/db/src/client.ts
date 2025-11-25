import { Database } from 'bun:sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type {
  Criterion,
  CriterionWithTags,
  Guideline,
  QueryFilters,
  PaginatedResult,
  WcagLevel,
  WcagPrinciple,
  AffectedUser,
  Assignee,
  Technology,
  Tag,
  Term,
  CriterionWithMetadata,
  AffectedUserWithScore,
  AssigneeWithScore,
  TechnologyWithScore,
  TagWithScore,
  Language,
  CriterionTranslation,
  CriterionWithTranslation,
  CriterionWithMetadataAndTranslation
} from './types';

// Find workspace root by going up from this file
const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(__dirname, '..', '..', '..');
const DB_PATH = join(workspaceRoot, 'data', 'wcag.sqlite');

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    db = new Database(DB_PATH, { create: true });
    db.run('PRAGMA journal_mode = WAL');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Custom comparator for WCAG IDs (e.g., "1.2.10" > "1.2.3")
 */
export function compareWcagIds(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal !== bVal) return aVal - bVal;
  }
  return 0;
}

/**
 * Query criteria with filters, FTS, and pagination
 */
export function queryCriteria(filters: QueryFilters): PaginatedResult<Criterion> {
  const database = getDb();
  const { q, principle, guideline_id, guideline_ids, level, version, tag_id, page = 1, pageSize = 25 } = filters;

  const actualPageSize = Math.min(pageSize, 100);
  const offset = (page - 1) * actualPageSize;

  let whereClauses: string[] = [];
  let params: any = {};

  // Build WHERE clauses
  if (q) {
    whereClauses.push(`c.rowid IN (SELECT rowid FROM criteria_fts WHERE criteria_fts MATCH $q)`);
    params.$q = q;
  }

  if (principle) {
    const principles = Array.isArray(principle) ? principle : [principle];
    whereClauses.push(`c.principle IN (${principles.map((_, i) => `$principle${i}`).join(',')})`);
    principles.forEach((p, i) => params[`$principle${i}`] = p);
  }

  if (guideline_id) {
    whereClauses.push(`c.guideline_id = $guideline_id`);
    params.$guideline_id = guideline_id;
  }

  if (guideline_ids && guideline_ids.length > 0) {
    whereClauses.push(`c.guideline_id IN (${guideline_ids.map((_, i) => `$guideline${i}`).join(',')})`);
    guideline_ids.forEach((g, i) => params[`$guideline${i}`] = g);
  }

  if (level) {
    const levels = Array.isArray(level) ? level : [level];
    // Empty array means no results (explicit filter with nothing selected)
    if (levels.length === 0) {
      whereClauses.push(`1 = 0`); // Always false
    } else {
      whereClauses.push(`c.level IN (${levels.map((_, i) => `$level${i}`).join(',')})`);
      levels.forEach((l, i) => params[`$level${i}`] = l);
    }
  }

  if (version) {
    const versions = Array.isArray(version) ? version : [version];
    // Empty array means no results (explicit filter with nothing selected)
    if (versions.length === 0) {
      whereClauses.push(`1 = 0`); // Always false
    } else {
      // Filter by introduced_in_version to show criteria introduced in selected versions
      // Also exclude removed criteria unless their removal version is later than all selected versions
      whereClauses.push(`c.introduced_in_version IN (${versions.map((_, i) => `$version${i}`).join(',')})`);
      versions.forEach((v, i) => params[`$version${i}`] = v);

      // If only 2.2 is selected, exclude criteria removed in 2.2
      // If 2.0 or 2.1 is selected, include criteria that were active in those versions
      const has20 = versions.includes('2.0');
      const has21 = versions.includes('2.1');
      const has22 = versions.includes('2.2');

      if (has22 && !has20 && !has21) {
        // Only 2.2 selected: exclude criteria removed in 2.2
        whereClauses.push(`(c.removed_in_version IS NULL OR c.removed_in_version != '2.2')`);
      }
      // If 2.0 or 2.1 is selected, show all criteria including removed ones
      // because they were active in those earlier versions
    }
  }

  if (tag_id !== undefined) {
    whereClauses.push(`c.id IN (SELECT criterion_id FROM criteria_tags WHERE tag_id = $tag_id)`);
    params.$tag_id = tag_id;
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count total
  const countQuery = `SELECT COUNT(*) as count FROM criteria c ${whereClause}`;
  const countStmt = database.prepare(countQuery);
  const { count } = countStmt.get(params) as { count: number };

  // Get paginated results
  let query = `
    SELECT c.*
    FROM criteria c
    ${whereClause}
    ${q ? `ORDER BY (SELECT bm25(criteria_fts) FROM criteria_fts WHERE rowid = c.rowid) ASC` : ''}
    LIMIT $limit OFFSET $offset
  `;

  params.$limit = actualPageSize;
  params.$offset = offset;

  const stmt = database.prepare(query);
  let items = stmt.all(params) as Criterion[];

  // Sort by WCAG ID if not using FTS
  if (!q) {
    items.sort((a, b) => compareWcagIds(a.id, b.id));
  }

  return {
    items,
    total: count,
    page,
    pageSize: actualPageSize,
    totalPages: Math.ceil(count / actualPageSize)
  };
}

/**
 * Query criteria with filters, FTS, pagination, and metadata
 * Optimized to use a single query with the criteria_with_metadata VIEW
 */
export function queryCriteriaWithMetadata(filters: QueryFilters): PaginatedResult<CriterionWithMetadata> {
  const database = getDb();
  const { q, principle, guideline_id, guideline_ids, level, version, tag_id, page = 1, pageSize = 25 } = filters;

  const actualPageSize = Math.min(pageSize, 100);
  const offset = (page - 1) * actualPageSize;

  let whereClauses: string[] = [];
  let params: any = {};

  // Build WHERE clauses (same as queryCriteria)
  if (q) {
    whereClauses.push(`c.rowid IN (SELECT rowid FROM criteria_fts WHERE criteria_fts MATCH $q)`);
    params.$q = q;
  }

  if (principle) {
    const principles = Array.isArray(principle) ? principle : [principle];
    whereClauses.push(`c.principle IN (${principles.map((_, i) => `$principle${i}`).join(',')})`);
    principles.forEach((p, i) => params[`$principle${i}`] = p);
  }

  if (guideline_id) {
    whereClauses.push(`c.guideline_id = $guideline_id`);
    params.$guideline_id = guideline_id;
  }

  if (guideline_ids && guideline_ids.length > 0) {
    whereClauses.push(`c.guideline_id IN (${guideline_ids.map((_, i) => `$guideline${i}`).join(',')})`);
    guideline_ids.forEach((g, i) => params[`$guideline${i}`] = g);
  }

  if (level) {
    const levels = Array.isArray(level) ? level : [level];
    if (levels.length === 0) {
      whereClauses.push(`1 = 0`);
    } else {
      whereClauses.push(`c.level IN (${levels.map((_, i) => `$level${i}`).join(',')})`);
      levels.forEach((l, i) => params[`$level${i}`] = l);
    }
  }

  if (version) {
    const versions = Array.isArray(version) ? version : [version];
    if (versions.length === 0) {
      whereClauses.push(`1 = 0`);
    } else {
      whereClauses.push(`c.introduced_in_version IN (${versions.map((_, i) => `$version${i}`).join(',')})`);
      versions.forEach((v, i) => params[`$version${i}`] = v);

      const has20 = versions.includes('2.0');
      const has21 = versions.includes('2.1');
      const has22 = versions.includes('2.2');

      if (has22 && !has20 && !has21) {
        whereClauses.push(`(c.removed_in_version IS NULL OR c.removed_in_version != '2.2')`);
      }
    }
  }

  if (tag_id !== undefined) {
    whereClauses.push(`c.id IN (SELECT criterion_id FROM criteria_tags WHERE tag_id = $tag_id)`);
    params.$tag_id = tag_id;
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count total
  const countQuery = `SELECT COUNT(*) as count FROM criteria c ${whereClause}`;
  const countStmt = database.prepare(countQuery);
  const { count } = countStmt.get(params) as { count: number };

  // Get paginated results with metadata using the VIEW
  let query = `
    SELECT c.*
    FROM criteria_with_metadata c
    ${whereClause}
    ${q ? `ORDER BY (SELECT bm25(criteria_fts) FROM criteria_fts WHERE rowid = c.rowid) ASC` : ''}
    LIMIT $limit OFFSET $offset
  `;

  params.$limit = actualPageSize;
  params.$offset = offset;

  const stmt = database.prepare(query);
  const rows = stmt.all(params) as any[];

  // Parse JSON metadata from the VIEW
  const items: CriterionWithMetadata[] = rows.map(row => {
    const { affected_users_json, assignees_json, technologies_json, tags_json, ...criterion } = row;
    return {
      ...criterion,
      affected_users: parseJsonArray(affected_users_json),
      assignees: parseJsonArray(assignees_json),
      technologies: parseJsonArray(technologies_json),
      tags: parseJsonArray(tags_json)
    };
  });

  // Sort by WCAG ID if not using FTS
  if (!q) {
    items.sort((a, b) => compareWcagIds(a.id, b.id));
  }

  return {
    items,
    total: count,
    page,
    pageSize: actualPageSize,
    totalPages: Math.ceil(count / actualPageSize)
  };
}

/**
 * Helper to parse JSON array from SQLite, handling null/empty cases
 */
function parseJsonArray(jsonStr: string | null): any[] {
  if (!jsonStr || jsonStr === '[null]') return [];
  try {
    const parsed = JSON.parse(jsonStr);
    // Filter out null entries (from empty subqueries)
    return Array.isArray(parsed) ? parsed.filter(item => item && item.id != null) : [];
  } catch {
    return [];
  }
}

/**
 * Get a single criterion by ID with metadata
 * (Redirects to getCriterionWithMetadata for consistency)
 */
export function getCriterionById(id: string): CriterionWithMetadata | null {
  return getCriterionWithMetadata(id);
}

/**
 * Get distinct principles
 */
export function getPrinciples(): WcagPrinciple[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT DISTINCT principle FROM criteria
    WHERE principle IS NOT NULL
    ORDER BY
      CASE principle
        WHEN 'Perceivable' THEN 1
        WHEN 'Operable' THEN 2
        WHEN 'Understandable' THEN 3
        WHEN 'Robust' THEN 4
        ELSE 5
      END
  `);
  return stmt.all().map((row: any) => row.principle);
}

/**
 * Get all guidelines with their principles
 */
export function getGuidelines(): Guideline[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT DISTINCT guideline_id, guideline_title, principle
    FROM criteria
    WHERE guideline_id IS NOT NULL
    ORDER BY guideline_id
  `);
  const guidelines = stmt.all() as Guideline[];
  return guidelines.sort((a, b) => compareWcagIds(a.guideline_id, b.guideline_id));
}

/**
 * Get distinct WCAG versions (based on when criteria were introduced)
 */
export function getVersions(): string[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT DISTINCT introduced_in_version as version
    FROM criteria
    WHERE introduced_in_version IS NOT NULL
    ORDER BY version
  `);
  return stmt.all().map((row: any) => row.version);
}

/**
 * Get available levels
 */
export function getLevels(): WcagLevel[] {
  return ['A', 'AA', 'AAA'];
}

// ============================================================================
// METADATA QUERIES
// ============================================================================

/**
 * Get all affected user types
 */
export function getAffectedUsers(): AffectedUser[] {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM affected_users ORDER BY name');
  return stmt.all() as AffectedUser[];
}

/**
 * Get all assignee roles
 */
export function getAssignees(): Assignee[] {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM assignees ORDER BY name');
  return stmt.all() as Assignee[];
}

/**
 * Get all technologies
 */
export function getTechnologies(): Technology[] {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM technologies ORDER BY name');
  return stmt.all() as Technology[];
}

/**
 * Get all tags
 */
export function getTags(): Tag[] {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM tags_reference ORDER BY category, name');
  return stmt.all() as Tag[];
}

/**
 * Get tags grouped by category
 */
export function getTagsByCategory(): Record<string, Tag[]> {
  const tags = getTags();
  const grouped: Record<string, Tag[]> = {};

  for (const tag of tags) {
    const category = tag.category || 'uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(tag);
  }

  return grouped;
}

/**
 * Get a single criterion with all metadata
 */
export function getCriterionWithMetadata(id: string): CriterionWithMetadata | null {
  const database = getDb();

  // Get base criterion
  const stmt = database.prepare('SELECT * FROM criteria WHERE id = ?');
  const criterion = stmt.get(id) as Criterion | undefined;

  if (!criterion) return null;

  // Get affected users with scores
  const affectedUsersStmt = database.prepare(`
    SELECT
      au.*,
      cau.relevance_score,
      cau.rank_order,
      cau.reasoning,
      cau.reviewed
    FROM criteria_affected_users cau
    JOIN affected_users au ON cau.affected_user_id = au.id
    WHERE cau.criterion_id = ?
    ORDER BY cau.rank_order, cau.relevance_score DESC
  `);
  const affected_users = affectedUsersStmt.all(id) as AffectedUserWithScore[];

  // Get assignees with scores
  const assigneesStmt = database.prepare(`
    SELECT
      a.*,
      ca.relevance_score,
      ca.rank_order,
      ca.reasoning,
      ca.reviewed
    FROM criteria_assignees ca
    JOIN assignees a ON ca.assignee_id = a.id
    WHERE ca.criterion_id = ?
    ORDER BY ca.rank_order, ca.relevance_score DESC
  `);
  const assignees = assigneesStmt.all(id) as AssigneeWithScore[];

  // Get technologies with scores
  const technologiesStmt = database.prepare(`
    SELECT
      t.*,
      ct.relevance_score,
      ct.rank_order,
      ct.reasoning,
      ct.reviewed
    FROM criteria_technologies ct
    JOIN technologies t ON ct.technology_id = t.id
    WHERE ct.criterion_id = ?
    ORDER BY ct.rank_order, ct.relevance_score DESC
  `);
  const technologies = technologiesStmt.all(id) as TechnologyWithScore[];

  // Get tags with scores
  const tagsStmt = database.prepare(`
    SELECT
      tr.*,
      ctg.relevance_score,
      ctg.rank_order,
      ctg.reasoning,
      ctg.reviewed
    FROM criteria_tags ctg
    JOIN tags_reference tr ON ctg.tag_id = tr.id
    WHERE ctg.criterion_id = ?
    ORDER BY ctg.rank_order, ctg.relevance_score DESC
  `);
  const tags = tagsStmt.all(id) as TagWithScore[];

  return {
    ...criterion,
    affected_users,
    assignees,
    technologies,
    tags
  };
}

/**
 * Get criteria by affected user
 */
export function getCriteriaByAffectedUser(affectedUserId: number): Criterion[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT DISTINCT c.*
    FROM criteria c
    JOIN criteria_affected_users cau ON c.id = cau.criterion_id
    WHERE cau.affected_user_id = ?
    ORDER BY cau.relevance_score DESC
  `);
  const items = stmt.all(affectedUserId) as Criterion[];
  return items.sort((a, b) => compareWcagIds(a.id, b.id));
}

/**
 * Get criteria by assignee
 */
export function getCriteriaByAssignee(assigneeId: number): Criterion[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT DISTINCT c.*
    FROM criteria c
    JOIN criteria_assignees ca ON c.id = ca.criterion_id
    WHERE ca.assignee_id = ?
    ORDER BY ca.relevance_score DESC
  `);
  const items = stmt.all(assigneeId) as Criterion[];
  return items.sort((a, b) => compareWcagIds(a.id, b.id));
}

/**
 * Get criteria by technology
 */
export function getCriteriaByTechnology(technologyId: number): Criterion[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT DISTINCT c.*
    FROM criteria c
    JOIN criteria_technologies ct ON c.id = ct.criterion_id
    WHERE ct.technology_id = ?
    ORDER BY ct.relevance_score DESC
  `);
  const items = stmt.all(technologyId) as Criterion[];
  return items.sort((a, b) => compareWcagIds(a.id, b.id));
}

/**
 * Get criteria by tag
 */
export function getCriteriaByTag(tagId: number): Criterion[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT DISTINCT c.*
    FROM criteria c
    JOIN criteria_tags ctg ON c.id = ctg.criterion_id
    WHERE ctg.tag_id = ?
    ORDER BY ctg.relevance_score DESC
  `);
  const items = stmt.all(tagId) as Criterion[];
  return items.sort((a, b) => compareWcagIds(a.id, b.id));
}

// ============================================================================
// TERMS
// ============================================================================

/**
 * Get all terms
 */
export function getTerms(): Term[] {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM terms ORDER BY title');
  return stmt.all() as Term[];
}

/**
 * Get a single term by slug
 */
export function getTermBySlug(slug: string): Term | undefined {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM terms WHERE slug = ?');
  return stmt.get(slug) as Term | undefined;
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

/**
 * Get all available languages
 */
export function getLanguages(): Language[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT code, name, native_name, wcag_version, sc_count, translator, source_url,
           is_complete = 1 as is_complete,
           authorization_type, w3c_authorization_status, translator_type,
           translation_date, translation_title
    FROM languages
    ORDER BY
      CASE WHEN wcag_version = '2.2' THEN 0 ELSE 1 END,
      name
  `);
  return stmt.all() as Language[];
}

/**
 * Get a single language by code
 */
export function getLanguageByCode(code: string): Language | undefined {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT code, name, native_name, wcag_version, sc_count, translator, source_url,
           is_complete = 1 as is_complete,
           authorization_type, w3c_authorization_status, translator_type,
           translation_date, translation_title
    FROM languages
    WHERE code = ?
  `);
  return stmt.get(code) as Language | undefined;
}

/**
 * Get translation for a specific criterion and language
 */
export function getTranslation(criterionId: string, language: string): CriterionTranslation | undefined {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT * FROM criteria_translations
    WHERE criterion_id = ? AND language = ?
  `);
  return stmt.get(criterionId, language) as CriterionTranslation | undefined;
}

/**
 * Get all translations for a language
 */
export function getTranslationsForLanguage(language: string): CriterionTranslation[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT * FROM criteria_translations
    WHERE language = ?
    ORDER BY criterion_id
  `);
  return stmt.all(language) as CriterionTranslation[];
}

/**
 * Get a criterion with its translation merged in (falls back to English if no translation)
 */
export function getCriterionWithTranslation(id: string, language: string): CriterionWithTranslation | null {
  const database = getDb();

  // Get base criterion
  const stmt = database.prepare('SELECT * FROM criteria WHERE id = ?');
  const criterion = stmt.get(id) as Criterion | undefined;

  if (!criterion) return null;

  // If language is English, return criterion without translation
  if (language === 'en') {
    return {
      ...criterion,
      has_translation: true, // English is always "translated" (it's the source)
      translation_language: 'en'
    };
  }

  // Get translation
  const translation = getTranslation(id, language);

  return {
    ...criterion,
    translated_handle: translation?.handle,
    translated_title: translation?.title,
    translated_principle_handle: translation?.principle_handle ?? undefined,
    translated_guideline_handle: translation?.guideline_handle ?? undefined,
    has_translation: !!translation,
    translation_language: translation ? language : 'en',
    translation_source_url: translation?.source_url ?? undefined
  };
}

/**
 * Get all criteria with translations for a language
 * Returns all criteria with translation fields merged in (falling back to English)
 */
export function getAllCriteriaWithTranslations(language: string): CriterionWithTranslation[] {
  const database = getDb();

  // If English, just return all criteria with has_translation: true
  if (language === 'en') {
    const stmt = database.prepare('SELECT * FROM criteria ORDER BY id');
    const criteria = stmt.all() as Criterion[];
    return criteria.map(c => ({
      ...c,
      has_translation: true,
      translation_language: 'en'
    }));
  }

  // Join criteria with translations
  const stmt = database.prepare(`
    SELECT
      c.*,
      t.handle as translated_handle,
      t.title as translated_title,
      t.principle_handle as translated_principle_handle,
      t.guideline_handle as translated_guideline_handle,
      t.source_url as translation_source_url,
      CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END as has_translation
    FROM criteria c
    LEFT JOIN criteria_translations t ON c.id = t.criterion_id AND t.language = ?
    ORDER BY c.id
  `);

  const rows = stmt.all(language) as any[];

  return rows.map(row => ({
    ...row,
    has_translation: row.has_translation === 1,
    translation_language: row.has_translation === 1 ? language : 'en',
    translated_handle: row.translated_handle || undefined,
    translated_title: row.translated_title || undefined,
    translated_principle_handle: row.translated_principle_handle || undefined,
    translated_guideline_handle: row.translated_guideline_handle || undefined,
    translation_source_url: row.translation_source_url || undefined
  }));
}

/**
 * Get translated principles for a language
 * Returns unique principle names with their translations from criteria_translations
 */
export function getTranslatedPrinciples(language: string): { name: string; translated_name: string }[] {
  const database = getDb();

  // If English, return standard principles without translation
  if (language === 'en') {
    return [
      { name: 'Perceivable', translated_name: 'Perceivable' },
      { name: 'Operable', translated_name: 'Operable' },
      { name: 'Understandable', translated_name: 'Understandable' },
      { name: 'Robust', translated_name: 'Robust' }
    ];
  }

  // Query distinct translated principle names from criteria_translations
  const stmt = database.prepare(`
    SELECT DISTINCT
      c.principle as name,
      COALESCE(t.principle_handle, c.principle) as translated_name
    FROM criteria c
    LEFT JOIN criteria_translations t ON c.id = t.criterion_id AND t.language = ?
    WHERE c.principle IS NOT NULL
    ORDER BY
      CASE c.principle
        WHEN 'Perceivable' THEN 1
        WHEN 'Operable' THEN 2
        WHEN 'Understandable' THEN 3
        WHEN 'Robust' THEN 4
        ELSE 5
      END
  `);

  const results = stmt.all(language) as { name: string; translated_name: string }[];

  // If we got results, return them; otherwise fallback to English
  if (results.length > 0) {
    return results;
  }

  return [
    { name: 'Perceivable', translated_name: 'Perceivable' },
    { name: 'Operable', translated_name: 'Operable' },
    { name: 'Understandable', translated_name: 'Understandable' },
    { name: 'Robust', translated_name: 'Robust' }
  ];
}

/**
 * Get translated guidelines for a language
 * Returns guidelines with their translated names from criteria_translations
 */
export function getTranslatedGuidelines(language: string): {
  guideline_id: string;
  guideline_title: string;
  translated_title: string;
  principle: string;
  translated_principle: string;
}[] {
  const database = getDb();

  // Query guidelines with their translations
  const stmt = database.prepare(`
    SELECT DISTINCT
      c.guideline_id,
      c.guideline_title,
      COALESCE(t.guideline_handle, c.guideline_title) as translated_title,
      c.principle,
      COALESCE(t.principle_handle, c.principle) as translated_principle
    FROM criteria c
    LEFT JOIN criteria_translations t ON c.id = t.criterion_id AND t.language = ?
    WHERE c.guideline_id IS NOT NULL
    ORDER BY c.guideline_id
  `);

  const results = stmt.all(language) as {
    guideline_id: string;
    guideline_title: string;
    translated_title: string;
    principle: string;
    translated_principle: string;
  }[];

  // Sort by WCAG ID
  return results.sort((a, b) => compareWcagIds(a.guideline_id, b.guideline_id));
}

/**
 * W3C Translation URL mapping
 * Maps language codes to their official W3C translation URLs
 */
const W3C_TRANSLATION_URLS: Record<string, { wcagVersion: '2.2' | '2.1'; understandingBase: string }> = {
  // WCAG 2.2 Translations
  'nl': { wcagVersion: '2.2', understandingBase: 'https://www.w3.org/Translations/WCAG22-nl/' },
  'fr': { wcagVersion: '2.2', understandingBase: 'https://www.w3.org/Translations/WCAG22-fr/' },
  'it': { wcagVersion: '2.2', understandingBase: 'https://www.w3.org/Translations/WCAG22-it/' },
  'ca': { wcagVersion: '2.2', understandingBase: 'https://www.w3.org/Translations/WCAG22-ca/' },
  'pt-BR': { wcagVersion: '2.2', understandingBase: 'https://www.w3.org/Translations/WCAG22-pt-BR/' },
  // WCAG 2.1 Translations (no 2.2 version available)
  'zh': { wcagVersion: '2.1', understandingBase: 'https://www.w3.org/Translations/WCAG21-zh/' },
  'da': { wcagVersion: '2.1', understandingBase: 'https://www.w3.org/Translations/WCAG21-da/' },
  'fi': { wcagVersion: '2.1', understandingBase: 'https://www.w3.org/Translations/WCAG21-fi/' },
  'no': { wcagVersion: '2.1', understandingBase: 'https://www.w3.org/Translations/WCAG21-no/' },
  'pl': { wcagVersion: '2.1', understandingBase: 'https://www.w3.org/Translations/WCAG21-pl/' },
};

/**
 * Get localized W3C "Understanding" URL for a criterion
 * Returns the official W3C translation URL if available, otherwise English
 */
export function getLocalizedUnderstandingUrl(criterionId: string, language: string): string {
  const englishBase = 'https://www.w3.org/WAI/WCAG22/Understanding/';
  const scSlug = criterionId.replace(/\./g, '-'); // e.g., "1.1.1" -> "1-1-1"

  if (language === 'en' || !W3C_TRANSLATION_URLS[language]) {
    return `${englishBase}${scSlug}`;
  }

  // Use translated URL
  const translation = W3C_TRANSLATION_URLS[language];
  // Note: Translated Understanding docs follow same pattern but with translated base
  return `${translation.understandingBase}#${scSlug}`;
}

/**
 * Get localized W3C "How to Meet" URL for a criterion
 * The Quick Reference supports language via query parameter
 */
export function getLocalizedHowToMeetUrl(criterionId: string, language: string): string {
  const baseUrl = 'https://www.w3.org/WAI/WCAG22/quickref/';
  const scSlug = criterionId.replace(/\./g, ''); // e.g., "1.1.1" -> "111"

  // How to Meet supports language via query parameter for many languages
  const langParam = language !== 'en' ? `?lang=${language}` : '';
  return `${baseUrl}${langParam}#${scSlug}`;
}

/**
 * Get a single criterion with all metadata AND translation
 */
export function getCriterionWithMetadataAndTranslation(
  id: string,
  language: string
): CriterionWithMetadataAndTranslation | null {
  // Get criterion with metadata
  const criterionWithMetadata = getCriterionWithMetadata(id);
  if (!criterionWithMetadata) return null;

  // Get localized W3C URLs
  const localizedUnderstandingUrl = getLocalizedUnderstandingUrl(id, language);
  const localizedHowToMeetUrl = getLocalizedHowToMeetUrl(id, language);

  // If English, return as-is with translation flag
  if (language === 'en') {
    return {
      ...criterionWithMetadata,
      has_translation: true,
      translation_language: 'en',
      localized_understanding_url: localizedUnderstandingUrl,
      localized_how_to_meet_url: localizedHowToMeetUrl
    };
  }

  // Get translation
  const translation = getTranslation(id, language);

  return {
    ...criterionWithMetadata,
    translated_handle: translation?.handle,
    translated_title: translation?.title,
    translated_principle_handle: translation?.principle_handle ?? undefined,
    translated_guideline_handle: translation?.guideline_handle ?? undefined,
    has_translation: !!translation,
    translation_language: translation ? language : 'en',
    translation_source_url: translation?.source_url ?? undefined,
    localized_understanding_url: localizedUnderstandingUrl,
    localized_how_to_meet_url: localizedHowToMeetUrl
  };
}
