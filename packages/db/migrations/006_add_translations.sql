-- WCAG Criteria Translations Table
-- Stores translated text for success criteria in multiple languages

CREATE TABLE IF NOT EXISTS criteria_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criterion_id TEXT NOT NULL,           -- References criteria.id (e.g., "non-text-content")
  language TEXT NOT NULL,               -- ISO code (e.g., "nl", "fr", "zh")
  wcag_version TEXT NOT NULL,           -- "2.2" or "2.1" - version of translation source
  handle TEXT NOT NULL,                 -- Translated SC name (e.g., "Niet-tekstuele content")
  title TEXT NOT NULL,                  -- Translated SC description
  principle_handle TEXT,                -- Translated principle name (e.g., "Waarneembaar")
  guideline_handle TEXT,                -- Translated guideline name (e.g., "Tekstalternatieven")
  source_url TEXT,                      -- W3C translation URL
  translator TEXT,                      -- Organization that did translation
  translation_date TEXT,                -- Date of official translation
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criterion_id) REFERENCES criteria(id) ON DELETE CASCADE,
  UNIQUE(criterion_id, language)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_translations_language ON criteria_translations(language);
CREATE INDEX IF NOT EXISTS idx_translations_criterion ON criteria_translations(criterion_id);
CREATE INDEX IF NOT EXISTS idx_translations_lang_criterion ON criteria_translations(language, criterion_id);

-- Languages reference table for UI
CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,                -- ISO code (e.g., "nl", "fr")
  name TEXT NOT NULL,                   -- English name (e.g., "Dutch")
  native_name TEXT NOT NULL,            -- Native name (e.g., "Nederlands")
  wcag_version TEXT NOT NULL,           -- Version of WCAG translation available
  sc_count INTEGER NOT NULL,            -- Number of success criteria translated
  translator TEXT,                      -- Organization name
  source_url TEXT,                      -- W3C translation URL
  is_complete INTEGER DEFAULT 0         -- 1 if all SC are translated, 0 if partial
);
