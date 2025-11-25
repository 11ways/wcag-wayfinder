/**
 * Re-export shared types from @wcag-explorer/shared
 * This allows existing imports to continue working
 */

export type {
  WcagLevel,
  WcagVersion,
  WcagPrinciple,
  WcagDetailItem,
  WcagDetail,
  Criterion,
  AffectedUser,
  AffectedUserWithScore,
  Assignee,
  AssigneeWithScore,
  Technology,
  TechnologyWithScore,
  Tag,
  TagWithScore,
  MetadataItem,
  Guideline,
  TranslatedPrinciple,
  PaginatedResult,
  QueryFilters,
  Term,
  ApiError,
  Language,
} from '@wcag-explorer/shared';
