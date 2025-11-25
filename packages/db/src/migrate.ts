import { Database } from 'bun:sqlite';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(__dirname, '..', '..', '..');
const DB_PATH = join(workspaceRoot, 'data', 'wcag.sqlite');
const MIGRATIONS_DIR = join(import.meta.dir, '..', 'migrations');

export function runMigrations() {
  // Ensure data directory exists
  const dataDir = dirname(DB_PATH);
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH, { create: true });
  db.run('PRAGMA journal_mode = WAL');

  console.log('Running migrations...');

  // List of migrations to run in order
  const migrations = [
    '001_init.sql',
    '002_metadata.sql',
    '003_add_details_json.sql',
    '004_add_terms.sql',
    '005_metadata_view.sql',
    '006_add_translations.sql'
  ];

  // Execute each migration
  for (const migration of migrations) {
    const migrationPath = join(MIGRATIONS_DIR, migration);
    if (!existsSync(migrationPath)) {
      console.log(`⚠ Skipping ${migration} (file not found)`);
      continue;
    }

    console.log(`  Running ${migration}...`);
    const sql = readFileSync(migrationPath, 'utf-8');

    // Execute the entire migration file
    // Bun's SQLite can execute multiple statements in one go
    db.exec(sql);
    console.log(`  ✓ ${migration} completed`);
  }

  console.log('✓ All migrations completed');
  db.close();
}

// Run migrations if this file is executed directly
if (import.meta.main) {
  runMigrations();
}
