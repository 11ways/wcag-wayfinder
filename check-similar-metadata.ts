import { queryCriteriaWithMetadata } from './packages/db/src/client';

// Check audio-related criteria (similar to 1.4.2 audio-control)
console.log('=== Audio/Media Related Criteria ===\n');
const audioResults = queryCriteriaWithMetadata({ q: 'audio', pageSize: 5 });
for (const criterion of audioResults.items) {
  if (criterion.num !== '1.4.2') {
    console.log(`${criterion.num}: ${criterion.title}`);
    console.log('Technologies:', criterion.technologies?.map(t => `${t.name} (${t.relevance_score})`).join(', ') || 'none');
    console.log('Tags:', criterion.tags?.map(t => t.name).join(', ') || 'none');
    console.log();
  }
}

// Check navigation/location criteria (similar to 2.4.8 location)
console.log('\n=== Navigation/Location Related Criteria ===\n');
const navResults = queryCriteriaWithMetadata({ guideline_id: '2.4', pageSize: 10 });
for (const criterion of navResults.items) {
  if (criterion.num !== '2.4.8' && criterion.num.startsWith('2.4')) {
    console.log(`${criterion.num}: ${criterion.title}`);
    console.log('Technologies:', criterion.technologies?.map(t => `${t.name} (${t.relevance_score})`).join(', ') || 'none');
    console.log('Tags:', criterion.tags?.map(t => t.name).join(', ') || 'none');
    console.log();
  }
}
