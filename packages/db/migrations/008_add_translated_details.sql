-- Add details_json column to store translated SC details (exception lists, notes)
-- This column stores JSON array matching WcagDetail[] type:
-- [{ "type": "ulist", "items": [{ "handle": "...", "text": "..." }] }]

ALTER TABLE criteria_translations ADD COLUMN details_json TEXT;
