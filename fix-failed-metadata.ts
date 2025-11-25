import { getDb } from './packages/db/src/client';

const db = getDb();

// Manual metadata for audio-control (1.4.2)
// Based on similar audio/media criteria
const audioControlMetadata = {
  affected_users: [
    { id: 2, relevance_score: 0.95, reasoning: 'Deaf users cannot hear audio warnings and need visible controls' },
    { id: 1, relevance_score: 0.9, reasoning: 'Users with hearing disabilities benefit from audio control options' },
    { id: 7, relevance_score: 0.85, reasoning: 'Users with cognitive disabilities may be distracted by auto-playing audio' },
    { id: 8, relevance_score: 0.8, reasoning: 'Users with neurological disabilities may be startled or disoriented by unexpected audio' }
  ],
  assignees: [
    { id: 3, relevance_score: 0.95, reasoning: 'Developers implement audio controls and autoplay prevention' },
    { id: 9, relevance_score: 0.9, reasoning: 'Video producers ensure audio controls are available' },
    { id: 2, relevance_score: 0.75, reasoning: 'Designers create accessible audio control interfaces' }
  ],
  technologies: [
    { id: 22, relevance_score: 0.95, reasoning: 'Video players provide audio control mechanisms' },
    { id: 3, relevance_score: 0.9, reasoning: 'JavaScript implements autoplay detection and control logic' },
    { id: 1, relevance_score: 0.85, reasoning: 'HTML audio and video elements require control attributes' },
    { id: 4, relevance_score: 0.75, reasoning: 'ARIA provides accessible names and states for audio controls' }
  ],
  tags: [
    { id: 48, relevance_score: 1, reasoning: 'Audio control is the primary focus of this criterion' },
    { id: 47, relevance_score: 0.95, reasoning: 'Autoplay behavior is directly addressed' },
    { id: 45, relevance_score: 0.85, reasoning: 'Audio accessibility requirements apply' },
    { id: 46, relevance_score: 0.8, reasoning: 'Multimedia content requires accessible controls' }
  ]
};

// Manual metadata for location (2.4.8)
// Based on similar navigation criteria
const locationMetadata = {
  affected_users: [
    { id: 4, relevance_score: 0.95, reasoning: 'Blind users rely on location indicators to understand page context' },
    { id: 7, relevance_score: 0.9, reasoning: 'Users with cognitive disabilities benefit from clear location indicators' },
    { id: 13, relevance_score: 0.8, reasoning: 'Users with assistive technology need programmatically available location information' },
    { id: 5, relevance_score: 0.75, reasoning: 'Low vision users benefit from clear location breadcrumbs' }
  ],
  assignees: [
    { id: 3, relevance_score: 0.95, reasoning: 'Developers implement breadcrumbs and location indicators' },
    { id: 2, relevance_score: 0.85, reasoning: 'Designers create visual location and navigation elements' },
    { id: 1, relevance_score: 0.75, reasoning: 'Content creators ensure page hierarchies are clear' }
  ],
  technologies: [
    { id: 1, relevance_score: 0.95, reasoning: 'HTML semantic elements provide structural location information' },
    { id: 26, relevance_score: 0.9, reasoning: 'Navigation patterns include breadcrumbs and location indicators' },
    { id: 4, relevance_score: 0.85, reasoning: 'ARIA landmarks help identify page regions and location' }
  ],
  tags: [
    { id: 41, relevance_score: 1, reasoning: 'Breadcrumbs are the primary mechanism for indicating location' },
    { id: 37, relevance_score: 0.95, reasoning: 'Navigation patterns support location awareness' },
    { id: 40, relevance_score: 0.85, reasoning: 'Consistent navigation helps users orient themselves' },
    { id: 51, relevance_score: 0.75, reasoning: 'HTML semantic structure supports location indication' }
  ]
};

console.log('Inserting metadata for audio-control (1.4.2)...');

// Insert audio-control metadata
const transaction1 = db.transaction(() => {
  // Insert affected users
  const affectedUserStmt = db.prepare(`
    INSERT OR REPLACE INTO criteria_affected_users
    (criterion_id, affected_user_id, relevance_score, reasoning, reviewed)
    VALUES (?, ?, ?, ?, 0)
  `);
  for (const item of audioControlMetadata.affected_users) {
    affectedUserStmt.run('audio-control', item.id, item.relevance_score, item.reasoning);
  }

  // Insert assignees
  const assigneeStmt = db.prepare(`
    INSERT OR REPLACE INTO criteria_assignees
    (criterion_id, assignee_id, relevance_score, reasoning, reviewed)
    VALUES (?, ?, ?, ?, 0)
  `);
  for (const item of audioControlMetadata.assignees) {
    assigneeStmt.run('audio-control', item.id, item.relevance_score, item.reasoning);
  }

  // Insert technologies
  const technologyStmt = db.prepare(`
    INSERT OR REPLACE INTO criteria_technologies
    (criterion_id, technology_id, relevance_score, reasoning, reviewed)
    VALUES (?, ?, ?, ?, 0)
  `);
  for (const item of audioControlMetadata.technologies) {
    technologyStmt.run('audio-control', item.id, item.relevance_score, item.reasoning);
  }

  // Insert tags
  const tagStmt = db.prepare(`
    INSERT OR REPLACE INTO criteria_tags
    (criterion_id, tag_id, relevance_score, reasoning, reviewed)
    VALUES (?, ?, ?, ?, 0)
  `);
  for (const item of audioControlMetadata.tags) {
    tagStmt.run('audio-control', item.id, item.relevance_score, item.reasoning);
  }
});

transaction1();
console.log('✓ Saved metadata for audio-control');

console.log('\nInserting metadata for location (2.4.8)...');

// Insert location metadata
const transaction2 = db.transaction(() => {
  // Insert affected users
  const affectedUserStmt = db.prepare(`
    INSERT OR REPLACE INTO criteria_affected_users
    (criterion_id, affected_user_id, relevance_score, reasoning, reviewed)
    VALUES (?, ?, ?, ?, 0)
  `);
  for (const item of locationMetadata.affected_users) {
    affectedUserStmt.run('location', item.id, item.relevance_score, item.reasoning);
  }

  // Insert assignees
  const assigneeStmt = db.prepare(`
    INSERT OR REPLACE INTO criteria_assignees
    (criterion_id, assignee_id, relevance_score, reasoning, reviewed)
    VALUES (?, ?, ?, ?, 0)
  `);
  for (const item of locationMetadata.assignees) {
    assigneeStmt.run('location', item.id, item.relevance_score, item.reasoning);
  }

  // Insert technologies
  const technologyStmt = db.prepare(`
    INSERT OR REPLACE INTO criteria_technologies
    (criterion_id, technology_id, relevance_score, reasoning, reviewed)
    VALUES (?, ?, ?, ?, 0)
  `);
  for (const item of locationMetadata.technologies) {
    technologyStmt.run('location', item.id, item.relevance_score, item.reasoning);
  }

  // Insert tags
  const tagStmt = db.prepare(`
    INSERT OR REPLACE INTO criteria_tags
    (criterion_id, tag_id, relevance_score, reasoning, reviewed)
    VALUES (?, ?, ?, ?, 0)
  `);
  for (const item of locationMetadata.tags) {
    tagStmt.run('location', item.id, item.relevance_score, item.reasoning);
  }
});

transaction2();
console.log('✓ Saved metadata for location');

console.log('\n✓ Successfully fixed both failed criteria!');
