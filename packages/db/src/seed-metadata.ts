import { readFileSync } from 'fs';
import { join } from 'path';
import { getDb, closeDb } from './client';

const SEEDS_DIR = join(import.meta.dir, '..', 'seeds');

export async function seedMetadata() {
  console.log('Starting metadata reference seed...');

  const db = getDb();

  // Read and execute seed SQL
  const seedPath = join(SEEDS_DIR, 'metadata_reference.sql');
  const sql = readFileSync(seedPath, 'utf-8');

  // Execute the entire seed file
  db.exec(sql);

  // Count inserted records
  const affectedUsersCount = db.prepare('SELECT COUNT(*) as count FROM affected_users').get() as { count: number };
  const assigneesCount = db.prepare('SELECT COUNT(*) as count FROM assignees').get() as { count: number };
  const technologiesCount = db.prepare('SELECT COUNT(*) as count FROM technologies').get() as { count: number };
  const tagsCount = db.prepare('SELECT COUNT(*) as count FROM tags_reference').get() as { count: number };

  console.log('\n✓ Metadata reference seed completed');
  console.log(`  - ${affectedUsersCount.count} affected user types`);
  console.log(`  - ${assigneesCount.count} assignee roles`);
  console.log(`  - ${technologiesCount.count} technologies`);
  console.log(`  - ${tagsCount.count} tags`);

  closeDb();
}

// Run seed if this file is executed directly
if (import.meta.main) {
  seedMetadata().catch(console.error);
}
