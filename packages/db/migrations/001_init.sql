-- WCAG Criteria Table
CREATE TABLE IF NOT EXISTS criteria (
  id TEXT PRIMARY KEY,                -- "1.1.1"
  num TEXT NOT NULL,                   -- "1.1.1"
  title TEXT NOT NULL,
  description TEXT,
  level TEXT CHECK(level IN ('A','AA','AAA','')),
  version TEXT,                        -- "2.0" | "2.1" | "2.2"
  principle TEXT,                      -- Perceivable | Operable | Understandable | Robust
  principle_id TEXT,                   -- "perceivable"
  guideline_id TEXT,                   -- "1.1"
  guideline_title TEXT,
  handle TEXT,                         -- Short name
  content TEXT,                        -- Full HTML content
  how_to_meet TEXT,                    -- URL to how to meet
  understanding TEXT                   -- URL to understanding
);

-- Indexes for common filters
CREATE INDEX IF NOT EXISTS idx_criteria_level ON criteria(level);
CREATE INDEX IF NOT EXISTS idx_criteria_version ON criteria(version);
CREATE INDEX IF NOT EXISTS idx_criteria_principle ON criteria(principle);
CREATE INDEX IF NOT EXISTS idx_criteria_guideline ON criteria(guideline_id);

-- Tags table (optional - for techniques, etc.)
CREATE TABLE IF NOT EXISTS tags (
  criteria_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY(criteria_id, tag),
  FOREIGN KEY(criteria_id) REFERENCES criteria(id) ON DELETE CASCADE
);

-- Full-Text Search Virtual Table
CREATE VIRTUAL TABLE IF NOT EXISTS criteria_fts USING fts5(
  id UNINDEXED,
  title,
  description,
  guideline_title,
  principle,
  level UNINDEXED,
  version UNINDEXED,
  content='criteria',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS criteria_ai AFTER INSERT ON criteria BEGIN
  INSERT INTO criteria_fts(rowid, id, title, description, guideline_title, principle, level, version)
  VALUES (new.rowid, new.id, new.title, new.description, new.guideline_title, new.principle, new.level, new.version);
END;

CREATE TRIGGER IF NOT EXISTS criteria_ad AFTER DELETE ON criteria BEGIN
  DELETE FROM criteria_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS criteria_au AFTER UPDATE ON criteria BEGIN
  UPDATE criteria_fts SET
    id = new.id,
    title = new.title,
    description = new.description,
    guideline_title = new.guideline_title,
    principle = new.principle,
    level = new.level,
    version = new.version
  WHERE rowid = new.rowid;
END;
