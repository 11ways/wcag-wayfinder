import { getCriterionWithMetadata } from './packages/db/src/client';

console.log('=== Verifying audio-control (1.4.2) ===\n');
const audioControl = getCriterionWithMetadata('audio-control');
if (audioControl) {
  console.log('Title:', audioControl.title);
  console.log('Affected Users:', audioControl.affected_users?.length || 0);
  console.log('Assignees:', audioControl.assignees?.length || 0);
  console.log('Technologies:', audioControl.technologies?.length || 0);
  console.log('Tags:', audioControl.tags?.length || 0);
  console.log('\nTechnologies:');
  audioControl.technologies?.forEach(t =>
    console.log(`  - ${t.name} (${t.relevance_score}): ${t.reasoning}`)
  );
} else {
  console.log('ERROR: Criterion not found!');
}

console.log('\n=== Verifying location (2.4.8) ===\n');
const location = getCriterionWithMetadata('location');
if (location) {
  console.log('Title:', location.title);
  console.log('Affected Users:', location.affected_users?.length || 0);
  console.log('Assignees:', location.assignees?.length || 0);
  console.log('Technologies:', location.technologies?.length || 0);
  console.log('Tags:', location.tags?.length || 0);
  console.log('\nTechnologies:');
  location.technologies?.forEach(t =>
    console.log(`  - ${t.name} (${t.relevance_score}): ${t.reasoning}`)
  );
} else {
  console.log('ERROR: Criterion not found!');
}

console.log('\n✓ Verification complete!');
