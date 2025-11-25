#!/usr/bin/env bun

import { queryCriteria, getCriterionById } from '@wcag-explorer/db/src/client';
import { MetadataGenerator } from './metadata-generator';

const args = process.argv.slice(2);

// Helper to find criterion by ID (slug) or number (1.1.1)
function findCriterion(idOrNumber: string) {
  // First try as direct ID (slug)
  let criterion = getCriterionById(idOrNumber);
  if (criterion) return criterion;

  // Try as number via query
  const result = queryCriteria({ pageSize: 100 });
  return result.items.find(c => c.num === idOrNumber);
}

function printUsage() {
  console.log(`
Usage:
  bun run generate <criterion-id>          Generate metadata for a single criterion
  bun run generate --all                    Generate metadata for all criteria
  bun run generate --batch <start> <end>   Generate metadata for a range of criteria

Examples:
  bun run generate 1.1.1                    Generate for criterion 1.1.1
  bun run generate --all                    Generate for all criteria
  bun run generate --batch 1 10             Generate for first 10 criteria

Environment Variables:
  ANTHROPIC_API_KEY    Required: Your Anthropic API key
  `);
}

async function main() {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  const generator = new MetadataGenerator();

  // Single criterion
  if (args.length === 1 && !args[0].startsWith('--')) {
    const criterionId = args[0];
    const criterion = findCriterion(criterionId);

    if (!criterion) {
      console.error(`Error: Criterion "${criterionId}" not found`);
      process.exit(1);
    }

    console.log(`\nProcessing: ${criterion.num} - ${criterion.title}\n`);

    const metadata = await generator.processcriterion(criterion);

    console.log('\nGenerated Metadata:');
    console.log(`  Affected Users: ${metadata.affected_users.length}`);
    console.log(`  Assignees: ${metadata.assignees.length}`);
    console.log(`  Technologies: ${metadata.technologies.length}`);
    console.log(`  Tags: ${metadata.tags.length}`);
    console.log('\n✓ Complete!');

    process.exit(0);
  }

  // All criteria
  if (args[0] === '--all') {
    const result = queryCriteria({ pageSize: 100 });
    console.log(`\nProcessing ${result.total} criteria...\n`);

    await generator.processBatch(result.items, {
      delayMs: 1000,
      onProgress: (current, total) => {
        const percent = Math.round((current / total) * 100);
        console.log(`Progress: ${current}/${total} (${percent}%)`);
      }
    });

    console.log('\n✓ All criteria processed!');
    process.exit(0);
  }

  // Batch
  if (args[0] === '--batch' && args.length === 3) {
    const start = parseInt(args[1], 10);
    const end = parseInt(args[2], 10);

    if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
      console.error('Error: Invalid batch range');
      printUsage();
      process.exit(1);
    }

    const count = end - start + 1;
    const result = queryCriteria({ page: 1, pageSize: end });
    const criteria = result.items.slice(start - 1, end);

    console.log(`\nProcessing ${criteria.length} criteria (${start}-${end})...\n`);

    await generator.processBatch(criteria, {
      delayMs: 1000,
      onProgress: (current, total) => {
        const percent = Math.round((current / total) * 100);
        console.log(`Progress: ${current}/${total} (${percent}%)`);
      }
    });

    console.log('\n✓ Batch processing complete!');
    process.exit(0);
  }

  console.error('Error: Invalid arguments');
  printUsage();
  process.exit(1);
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
