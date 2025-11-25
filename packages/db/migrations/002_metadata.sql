-- ============================================================================
-- Migration 002: Metadata Enhancement
-- Adds support for tags, affected users, assignees, and technologies
-- with relevance scoring and ranking
-- ============================================================================

-- Preserve existing tags table (in case we need to migrate data)
ALTER TABLE tags RENAME TO tags_old;

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================

-- Affected Users (User personas/disability types)
CREATE TABLE IF NOT EXISTS affected_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Assignees (Professional roles responsible for implementation)
CREATE TABLE IF NOT EXISTS assignees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Technologies (Implementation methods and tools)
CREATE TABLE IF NOT EXISTS technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tags (Categorization and classification)
CREATE TABLE IF NOT EXISTS tags_reference (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,  -- e.g., "content-type", "interaction", "media", etc.
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- JUNCTION TABLES (Many-to-Many with Scoring)
-- ============================================================================

-- Criteria <-> Affected Users relationship
CREATE TABLE IF NOT EXISTS criteria_affected_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criterion_id TEXT NOT NULL,
  affected_user_id INTEGER NOT NULL,
  relevance_score REAL NOT NULL CHECK(relevance_score >= 0.0 AND relevance_score <= 1.0),
  rank_order INTEGER,  -- Manual ordering (1 = most relevant)
  reasoning TEXT,      -- AI-generated or manual explanation
  reviewed BOOLEAN DEFAULT 0,  -- Has a human reviewed this?
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criterion_id) REFERENCES criteria (id) ON DELETE CASCADE,
  FOREIGN KEY (affected_user_id) REFERENCES affected_users (id) ON DELETE CASCADE,
  UNIQUE(criterion_id, affected_user_id)
);

-- Criteria <-> Assignees relationship
CREATE TABLE IF NOT EXISTS criteria_assignees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criterion_id TEXT NOT NULL,
  assignee_id INTEGER NOT NULL,
  relevance_score REAL NOT NULL CHECK(relevance_score >= 0.0 AND relevance_score <= 1.0),
  rank_order INTEGER,
  reasoning TEXT,
  reviewed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criterion_id) REFERENCES criteria (id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES assignees (id) ON DELETE CASCADE,
  UNIQUE(criterion_id, assignee_id)
);

-- Criteria <-> Technologies relationship
CREATE TABLE IF NOT EXISTS criteria_technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criterion_id TEXT NOT NULL,
  technology_id INTEGER NOT NULL,
  relevance_score REAL NOT NULL CHECK(relevance_score >= 0.0 AND relevance_score <= 1.0),
  rank_order INTEGER,
  reasoning TEXT,
  reviewed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criterion_id) REFERENCES criteria (id) ON DELETE CASCADE,
  FOREIGN KEY (technology_id) REFERENCES technologies (id) ON DELETE CASCADE,
  UNIQUE(criterion_id, technology_id)
);

-- Criteria <-> Tags relationship
CREATE TABLE IF NOT EXISTS criteria_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criterion_id TEXT NOT NULL,
  tag_id INTEGER NOT NULL,
  relevance_score REAL NOT NULL CHECK(relevance_score >= 0.0 AND relevance_score <= 1.0),
  rank_order INTEGER,
  reasoning TEXT,
  reviewed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criterion_id) REFERENCES criteria (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags_reference (id) ON DELETE CASCADE,
  UNIQUE(criterion_id, tag_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Reference table indexes
CREATE INDEX IF NOT EXISTS idx_affected_users_slug ON affected_users(slug);
CREATE INDEX IF NOT EXISTS idx_assignees_slug ON assignees(slug);
CREATE INDEX IF NOT EXISTS idx_technologies_slug ON technologies(slug);
CREATE INDEX IF NOT EXISTS idx_tags_reference_slug ON tags_reference(slug);
CREATE INDEX IF NOT EXISTS idx_tags_reference_category ON tags_reference(category);

-- Junction table indexes for lookups
CREATE INDEX IF NOT EXISTS idx_criteria_affected_users_criterion ON criteria_affected_users(criterion_id);
CREATE INDEX IF NOT EXISTS idx_criteria_affected_users_user ON criteria_affected_users(affected_user_id);
CREATE INDEX IF NOT EXISTS idx_criteria_affected_users_score ON criteria_affected_users(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_criteria_affected_users_rank ON criteria_affected_users(rank_order);

CREATE INDEX IF NOT EXISTS idx_criteria_assignees_criterion ON criteria_assignees(criterion_id);
CREATE INDEX IF NOT EXISTS idx_criteria_assignees_assignee ON criteria_assignees(assignee_id);
CREATE INDEX IF NOT EXISTS idx_criteria_assignees_score ON criteria_assignees(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_criteria_assignees_rank ON criteria_assignees(rank_order);

CREATE INDEX IF NOT EXISTS idx_criteria_technologies_criterion ON criteria_technologies(criterion_id);
CREATE INDEX IF NOT EXISTS idx_criteria_technologies_technology ON criteria_technologies(technology_id);
CREATE INDEX IF NOT EXISTS idx_criteria_technologies_score ON criteria_technologies(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_criteria_technologies_rank ON criteria_technologies(rank_order);

CREATE INDEX IF NOT EXISTS idx_criteria_tags_criterion ON criteria_tags(criterion_id);
CREATE INDEX IF NOT EXISTS idx_criteria_tags_tag ON criteria_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_criteria_tags_score ON criteria_tags(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_criteria_tags_rank ON criteria_tags(rank_order);

-- Indexes for filtering by review status
CREATE INDEX IF NOT EXISTS idx_criteria_affected_users_reviewed ON criteria_affected_users(reviewed);
CREATE INDEX IF NOT EXISTS idx_criteria_assignees_reviewed ON criteria_assignees(reviewed);
CREATE INDEX IF NOT EXISTS idx_criteria_technologies_reviewed ON criteria_technologies(reviewed);
CREATE INDEX IF NOT EXISTS idx_criteria_tags_reviewed ON criteria_tags(reviewed);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Affected Users
CREATE TRIGGER IF NOT EXISTS trigger_affected_users_updated_at
AFTER UPDATE ON affected_users
FOR EACH ROW
BEGIN
  UPDATE affected_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Assignees
CREATE TRIGGER IF NOT EXISTS trigger_assignees_updated_at
AFTER UPDATE ON assignees
FOR EACH ROW
BEGIN
  UPDATE assignees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Technologies
CREATE TRIGGER IF NOT EXISTS trigger_technologies_updated_at
AFTER UPDATE ON technologies
FOR EACH ROW
BEGIN
  UPDATE technologies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Tags Reference
CREATE TRIGGER IF NOT EXISTS trigger_tags_reference_updated_at
AFTER UPDATE ON tags_reference
FOR EACH ROW
BEGIN
  UPDATE tags_reference SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Junction Tables
CREATE TRIGGER IF NOT EXISTS trigger_criteria_affected_users_updated_at
AFTER UPDATE ON criteria_affected_users
FOR EACH ROW
BEGIN
  UPDATE criteria_affected_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_criteria_assignees_updated_at
AFTER UPDATE ON criteria_assignees
FOR EACH ROW
BEGIN
  UPDATE criteria_assignees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_criteria_technologies_updated_at
AFTER UPDATE ON criteria_technologies
FOR EACH ROW
BEGIN
  UPDATE criteria_technologies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_criteria_tags_updated_at
AFTER UPDATE ON criteria_tags
FOR EACH ROW
BEGIN
  UPDATE criteria_tags SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
