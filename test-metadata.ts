import { queryCriteriaWithMetadata } from './packages/db/src/client';

// Test the function directly
const result = queryCriteriaWithMetadata({
  page: 1,
  pageSize: 1
});

console.log('Total items:', result.total);
console.log('First item:', JSON.stringify(result.items[0], null, 2));

if (result.items[0]) {
  const criterion = result.items[0];
  console.log('\nMetadata check:');
  console.log('- affected_users:', criterion.affected_users?.length || 0);
  console.log('- assignees:', criterion.assignees?.length || 0);
  console.log('- technologies:', criterion.technologies?.length || 0);
  console.log('- tags:', criterion.tags?.length || 0);
}
