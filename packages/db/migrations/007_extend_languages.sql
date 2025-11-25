-- Extend languages table with additional translation credit fields
-- These fields support the comprehensive translation credits modal

-- Add authorization type (authorized, candidate_authorized, unofficial)
ALTER TABLE languages ADD COLUMN authorization_type TEXT DEFAULT 'authorized';

-- Add W3C authorization status (human-readable status description)
ALTER TABLE languages ADD COLUMN w3c_authorization_status TEXT;

-- Add translator type (lead_organization, volunteer_translator)
ALTER TABLE languages ADD COLUMN translator_type TEXT DEFAULT 'lead_organization';

-- Add translation publication date
ALTER TABLE languages ADD COLUMN translation_date TEXT;

-- Add translated WCAG title
ALTER TABLE languages ADD COLUMN translation_title TEXT;
