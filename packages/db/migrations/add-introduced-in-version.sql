-- Migration: Add introduced_in_version column
-- This tracks when each criterion was first introduced in WCAG

-- Add the new column
ALTER TABLE criteria ADD COLUMN introduced_in_version TEXT CHECK(introduced_in_version IN ('2.0', '2.1', '2.2'));

-- Create index for the new column
CREATE INDEX idx_criteria_introduced_in_version ON criteria(introduced_in_version);

-- WCAG 2.2 new criteria (9)
UPDATE criteria SET introduced_in_version = '2.2' WHERE num IN (
  '2.4.11', '2.4.12', '2.4.13',
  '2.5.7', '2.5.8',
  '3.2.6',
  '3.3.7', '3.3.8', '3.3.9'
);

-- WCAG 2.1 new criteria (17)
UPDATE criteria SET introduced_in_version = '2.1' WHERE num IN (
  '1.3.4', '1.3.5', '1.3.6',
  '1.4.10', '1.4.11', '1.4.12', '1.4.13',
  '2.1.4',
  '2.2.6',
  '2.3.3',
  '2.5.1', '2.5.2', '2.5.3', '2.5.4', '2.5.5', '2.5.6',
  '4.1.3'
);

-- 4.1.1 was in WCAG 2.0 but removed in 2.2
UPDATE criteria SET introduced_in_version = '2.0', version = '2.1' WHERE num = '4.1.1';

-- All remaining criteria are from WCAG 2.0 (61 criteria)
UPDATE criteria SET introduced_in_version = '2.0' WHERE introduced_in_version IS NULL;

-- Update version column to reflect current status
-- All active criteria should have version = '2.2' (the current spec)
UPDATE criteria SET version = '2.2' WHERE version != '2.1';

-- Update FTS triggers to include introduced_in_version
DROP TRIGGER criteria_ai;
DROP TRIGGER criteria_au;

CREATE TRIGGER criteria_ai AFTER INSERT ON criteria BEGIN
  INSERT INTO criteria_fts(rowid, id, title, description, guideline_title, principle, level, version)
  VALUES (new.rowid, new.id, new.title, new.description, new.guideline_title, new.principle, new.level, new.introduced_in_version);
END;

CREATE TRIGGER criteria_au AFTER UPDATE ON criteria BEGIN
  UPDATE criteria_fts SET
    id = new.id,
    title = new.title,
    description = new.description,
    guideline_title = new.guideline_title,
    principle = new.principle,
    level = new.level,
    version = new.introduced_in_version
  WHERE rowid = new.rowid;
END;
