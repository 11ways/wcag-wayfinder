/**
 * Shared types for WCAG Explorer
 * These types are used across web, api, and admin apps
 */

// WCAG Core Types
export type WcagLevel = 'A' | 'AA' | 'AAA' | '';
export type WcagVersion = '2.0' | '2.1' | '2.2';
export type WcagPrinciple =
  | 'Perceivable'
  | 'Operable'
  | 'Understandable'
  | 'Robust';

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

// Main Criterion type
export interface Criterion {
  id: string;
  num: string;
  title: string;
  description: string | null;
  details_json: string | null; // JSON string of WcagDetail[]
  level: WcagLevel;
  version: string;
  principle: WcagPrinciple;
  principle_id: string;
  guideline_id: string;
  guideline_title: string;
  handle: string;
  content: string | null;
  how_to_meet: string | null;
  understanding: string | null;
  affected_users?: AffectedUserWithScore[];
  assignees?: AssigneeWithScore[];
  technologies?: TechnologyWithScore[];
  tags?: TagWithScore[];
  // Translation fields (optional - only present when lang param is used)
  translated_handle?: string;
  translated_title?: string;
  translated_principle_handle?: string;
  translated_guideline_handle?: string;
  has_translation?: boolean;
  translation_language?: string;
  translation_source_url?: string;
  // Localized W3C URLs (language-specific when available)
  localized_understanding_url?: string;
  localized_how_to_meet_url?: string;
}

// Base Metadata types
export interface AffectedUser {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
}

export interface Assignee {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
}

export interface Technology {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
}

export interface Tag {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  category: string | null;
  icon: string | null;
}

// Metadata types with scores (from criterion relationships)
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

// Union type for all metadata items with scores
export type MetadataItem =
  | AffectedUserWithScore
  | AssigneeWithScore
  | TechnologyWithScore
  | TagWithScore;

// Guidelines
export interface Guideline {
  guideline_id: string;
  guideline_title: string;
  principle: WcagPrinciple;
  // Translation fields (only present when ?lang= is used)
  translated_title?: string;
  translated_principle?: string;
}

// Translated Principle (returned by /api/principles?lang=xx)
export interface TranslatedPrinciple {
  name: WcagPrinciple;
  translated_name: string;
}

// API Response types
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryFilters {
  q?: string;
  principle?: string[];
  guideline_id?: string; // Legacy single guideline (for backward compatibility)
  guideline_ids?: string[]; // Multiple guidelines
  level?: string[];
  version?: string[];
  tag_id?: number; // Legacy single tag (for backward compatibility)
  tag_ids?: number[]; // Multiple tags (up to 3)
  page?: number;
  pageSize?: number;
  lang?: string; // Language code for translations (e.g., 'nl', 'fr')
}

// Terms (glossary)
export interface Term {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

// API Error Response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Language/Translation types
export interface Language {
  code: string;
  name: string;
  native_name: string;
  wcag_version: '2.2' | '2.1';
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
