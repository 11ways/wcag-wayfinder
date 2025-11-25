import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDb, closeDb } from './client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(__dirname, '..', '..', '..');
const JSON_PATH = join(workspaceRoot, 'data', 'wcag.json');
const TERMS_JSON_PATH = join(workspaceRoot, 'wcag22_terms.json');

interface WcagDetail {
  type: 'note' | 'p' | 'ulist';
  text?: string;
  handle?: string;
  items?: Array<{ text: string; handle?: string }>;
}

interface WcagSuccessCriterion {
  id: string;
  num: string;
  alt_id?: string[];
  content: string;
  handle: string;
  title: string;
  versions: string[];
  level: 'A' | 'AA' | 'AAA' | '';
  details: WcagDetail[];
  techniques?: any;
}

interface WcagGuideline {
  id: string;
  num: string;
  alt_id?: string[];
  content: string;
  handle: string;
  title: string;
  versions: string[];
  successcriteria: WcagSuccessCriterion[];
}

interface WcagPrinciple {
  id: string;
  num: string;
  content: string;
  handle: string;
  title: string;
  versions: string[];
  guidelines: WcagGuideline[];
}

interface WcagJson {
  principles: WcagPrinciple[];
  terms: Array<{
    id: string;
    definition: string;
    name: string;
  }>;
}

interface TermJson {
  title: string;
  content: string;
}

function createSlug(title: string): string {
  // Remove parenthetical content like "(as used in this document)"
  const cleanTitle = title.replace(/\([^)]*\)/g, '').trim();

  // Convert to lowercase and replace spaces/special chars with hyphens
  return cleanTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function extractTextFromHtml(html: string): string {
  // Simple HTML tag stripper (for better readability in descriptions)
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDescription(details: WcagDetail[]): string {
  const parts: string[] = [];

  for (const detail of details) {
    if (detail.type === 'p' && detail.text) {
      parts.push(extractTextFromHtml(detail.text));
    } else if (detail.type === 'note' && detail.text) {
      const handle = detail.handle ? `${detail.handle}: ` : 'Note: ';
      parts.push(handle + extractTextFromHtml(detail.text));
    } else if (detail.type === 'ulist' && detail.items) {
      const items = detail.items.map(item => {
        const prefix = item.handle ? `${item.handle}: ` : '• ';
        return prefix + extractTextFromHtml(item.text);
      });
      parts.push(items.join('\n'));
    }
  }

  return parts.join('\n\n');
}

function seedTerms(db: ReturnType<typeof getDb>) {
  console.log('Seeding terms...');

  // Clear existing terms
  db.run('DELETE FROM terms');

  // Read terms JSON file
  let termsData: TermJson[];
  try {
    const termsContent = readFileSync(TERMS_JSON_PATH, 'utf-8');
    termsData = JSON.parse(termsContent);
  } catch (error) {
    console.error('Warning: Could not read wcag22_terms.json, skipping terms seeding');
    return 0;
  }

  // Prepare insert statement
  const insertTermStmt = db.prepare(`
    INSERT INTO terms (title, slug, content)
    VALUES ($title, $slug, $content)
  `);

  let termsCount = 0;
  for (const term of termsData) {
    const slug = createSlug(term.title);

    insertTermStmt.run({
      $title: term.title,
      $slug: slug,
      $content: term.content
    });

    termsCount++;
  }

  return termsCount;
}

export async function seed() {
  console.log('Starting seed process...');

  const jsonContent = readFileSync(JSON_PATH, 'utf-8');
  const data: WcagJson = JSON.parse(jsonContent);

  const db = getDb();

  // Clear existing data
  console.log('Clearing existing data...');
  db.run('DELETE FROM tags');
  db.run('DELETE FROM criteria');

  // Prepare insert statement
  const insertStmt = db.prepare(`
    INSERT INTO criteria (
      id, num, title, description, details_json, level, version,
      introduced_in_version, removed_in_version,
      principle, principle_id, guideline_id, guideline_title,
      handle, content, how_to_meet, understanding
    ) VALUES (
      $id, $num, $title, $description, $details_json, $level, $version,
      $introduced_in_version, $removed_in_version,
      $principle, $principle_id, $guideline_id, $guideline_title,
      $handle, $content, $how_to_meet, $understanding
    )
  `);

  let criteriaCount = 0;
  const unmappedFields: Set<string> = new Set();

  // Process each principle
  for (const principle of data.principles) {
    for (const guideline of principle.guidelines) {
      for (const sc of guideline.successcriteria) {
        // Build URLs
        const scSlug = sc.id;
        const versionPath = sc.versions[sc.versions.length - 1]?.replace('.', '') || '22';
        const howToMeet = `https://www.w3.org/WAI/WCAG${versionPath}/quickref/#${scSlug}`;
        const understanding = `https://www.w3.org/WAI/WCAG${versionPath}/Understanding/${scSlug}`;

        // Get latest version
        const version = sc.versions[sc.versions.length - 1] || '2.2';

        // Determine when criterion was introduced and if it was removed
        const introducedInVersion = sc.versions[0] || '2.0';
        const latestVersion = sc.versions[sc.versions.length - 1];
        const removedInVersion = latestVersion !== '2.2' ? latestVersion : null;

        // Build description from details
        const description = buildDescription(sc.details);

        // Store details as JSON for semantic rendering
        const detailsJson = sc.details && sc.details.length > 0
          ? JSON.stringify(sc.details)
          : null;

        insertStmt.run({
          $id: sc.id,
          $num: sc.num,
          $title: sc.title,
          $description: description || null,
          $details_json: detailsJson,
          $level: sc.level,
          $version: version,
          $introduced_in_version: introducedInVersion,
          $removed_in_version: removedInVersion,
          $principle: principle.handle,
          $principle_id: principle.id,
          $guideline_id: guideline.num,
          $guideline_title: guideline.title,
          $handle: sc.handle,
          $content: sc.content,
          $how_to_meet: howToMeet,
          $understanding: understanding
        });

        criteriaCount++;
      }
    }
  }

  // Rebuild FTS index
  console.log('Rebuilding FTS index...');
  db.run("INSERT INTO criteria_fts(criteria_fts) VALUES('rebuild')");

  // Seed terms
  const termsCount = seedTerms(db);

  console.log('\n✓ Seed completed');
  console.log(`  - Imported ${criteriaCount} success criteria`);
  console.log(`  - ${data.principles.length} principles`);
  console.log(`  - ${termsCount} terms`);
  console.log(`  - FTS index built`);

  if (unmappedFields.size > 0) {
    console.log(`\nUnmapped fields: ${Array.from(unmappedFields).join(', ')}`);
  }

  closeDb();
}

// Run seed if this file is executed directly
if (import.meta.main) {
  seed().catch(console.error);
}
