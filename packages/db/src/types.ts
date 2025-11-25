export type WcagLevel = 'A' | 'AA' | 'AAA' | '';
export type WcagVersion = '2.0' | '2.1' | '2.2';
export type WcagPrinciple = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';

// WCAG Detail structure from original JSON
export interface WcagDetailItem {
  text: string;
  handle?: string;
}

export interface WcagDetail {
  type: 'note' | 'p' | 'ulist';
  text?: string;
  handle?: string;
  items?: WcagDetailItem[];
}

export interface Criterion {
  id: string;
  num: string;
  title: string;
  description: string | null;
  details_json: string | null; // JSON string of WcagDetail[]
  level: WcagLevel;
  version: string; // Current WCAG version (always 2.2)
  introduced_in_version: WcagVersion; // Version when criterion was first introduced
  removed_in_version?: WcagVersion | null; // Version when criterion was removed (if applicable)
  principle: WcagPrinciple;
  principle_id: string;
  guideline_id: string;
  guideline_title: string;
  handle: string;
  content: string | null;
  how_to_meet: string | null;
  understanding: string | null;
}

export interface CriterionWithTags extends Criterion {
  tags: string[];
}

export interface Guideline {
  guideline_id: string;
  guideline_title: string;
  principle: WcagPrinciple;
}

export interface QueryFilters {
  q?: string;
  principle?: string | string[];
  guideline_id?: string;
  level?: string | string[];
  version?: string | string[];
  tag_id?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// METADATA TYPES
// ============================================================================

// Reference Tables
export interface AffectedUser {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Assignee {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Technology {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  category: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

// Junction Tables (with scoring)
export interface CriterionAffectedUser {
  id: number;
  criterion_id: string;
  affected_user_id: number;
  relevance_score: number; // 0.0 to 1.0
  rank_order: number | null;
  reasoning: string | null;
  reviewed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CriterionAssignee {
  id: number;
  criterion_id: string;
  assignee_id: number;
  relevance_score: number;
  rank_order: number | null;
  reasoning: string | null;
  reviewed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CriterionTechnology {
  id: number;
  criterion_id: string;
  technology_id: number;
  relevance_score: number;
  rank_order: number | null;
  reasoning: string | null;
  reviewed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CriterionTag {
  id: number;
  criterion_id: string;
  tag_id: number;
  relevance_score: number;
  rank_order: number | null;
  reasoning: string | null;
  reviewed: boolean;
  created_at: string;
  updated_at: string;
}

// Combined types with full reference data
export interface AffectedUserWithScore extends AffectedUser {
  relevance_score: number;
  rank_order: number | null;
  reasoning: string | null;
  reviewed: boolean;
}

export interface AssigneeWithScore extends Assignee {
  relevance_score: number;
  rank_order: number | null;
  reasoning: string | null;
  reviewed: boolean;
}

export interface TechnologyWithScore extends Technology {
  relevance_score: number;
  rank_order: number | null;
  reasoning: string | null;
  reviewed: boolean;
}

export interface TagWithScore extends Tag {
  relevance_score: number;
  rank_order: number | null;
  reasoning: string | null;
  reviewed: boolean;
}

// Extended Criterion with all metadata
export interface CriterionWithMetadata extends Criterion {
  affected_users: AffectedUserWithScore[];
  assignees: AssigneeWithScore[];
  technologies: TechnologyWithScore[];
  tags: TagWithScore[];
}

// Metadata creation/update types
export interface CreateMetadataRelationship {
  relevance_score: number;
  rank_order?: number;
  reasoning?: string;
  reviewed?: boolean;
}

export interface UpdateMetadataRelationship extends Partial<CreateMetadataRelationship> {
  id: number;
}

// ============================================================================
// TERMS TYPES
// ============================================================================

export interface Term {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

// ============================================================================
// TRANSLATION TYPES
// ============================================================================

export interface CriterionTranslation {
  id: number;
  criterion_id: string;
  language: string;
  wcag_version: string;
  handle: string;
  title: string;
  principle_handle: string | null;
  guideline_handle: string | null;
  source_url: string | null;
  translator: string | null;
  translation_date: string | null;
  details_json: string | null;
  created_at: string;
}

export interface Language {
  code: string;
  name: string;
  native_name: string;
  wcag_version: string;
  sc_count: number;
  translator: string | null;
  source_url: string | null;
  is_complete: boolean;
  // Extended translation credit fields
  authorization_type?: string;
  w3c_authorization_status?: string;
  translator_type?: string;
  translation_date?: string;
  translation_title?: string;
}

// Criterion with translated fields merged in
export interface CriterionWithTranslation extends Criterion {
  translated_handle?: string;
  translated_title?: string;
  translated_principle_handle?: string;
  translated_guideline_handle?: string;
  translated_details_json?: string;
  has_translation: boolean;
  translation_language?: string;
  translation_source_url?: string;
}

// Extended criterion with both metadata and translation
export interface CriterionWithMetadataAndTranslation extends CriterionWithMetadata {
  translated_handle?: string;
  translated_title?: string;
  translated_principle_handle?: string;
  translated_guideline_handle?: string;
  translated_details_json?: string;
  has_translation: boolean;
  translation_language?: string;
  translation_source_url?: string;
  // Localized W3C URLs (language-specific when available)
  localized_understanding_url?: string;
  localized_how_to_meet_url?: string;
}
