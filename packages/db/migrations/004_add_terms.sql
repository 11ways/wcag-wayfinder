-- Migration: Add terms table for WCAG terminology
-- Description: Creates a table to store WCAG terms and their definitions

CREATE TABLE IF NOT EXISTS terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_terms_slug ON terms(slug);

-- Create index on title for case-insensitive searching
CREATE INDEX IF NOT EXISTS idx_terms_title_lower ON terms(LOWER(title));
