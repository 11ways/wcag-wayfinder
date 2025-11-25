import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getPrinciples, getGuidelines, getVersions, getLevels } from '../../lib/api';
import { queryKeys } from '../../lib/queryClient';
import type { Guideline, TranslatedPrinciple } from '../../lib/types';

/**
 * Query hook for fetching principles with translations
 * Returns string[] for English, TranslatedPrinciple[] for other languages
 */
export function usePrinciplesQuery() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useQuery<string[] | TranslatedPrinciple[], Error>({
    queryKey: [...queryKeys.principles(), lang],
    queryFn: () => getPrinciples(lang),
    staleTime: Infinity, // Principles never change within a language
  });
}

/**
 * Query hook for fetching guidelines with translations
 */
export function useGuidelinesQuery() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useQuery<Guideline[], Error>({
    queryKey: [...queryKeys.guidelines(), lang],
    queryFn: () => getGuidelines(lang),
    staleTime: Infinity, // Guidelines never change within a language
  });
}

/**
 * Query hook for fetching WCAG versions
 */
export function useVersionsQuery() {
  return useQuery<string[], Error>({
    queryKey: queryKeys.versions(),
    queryFn: getVersions,
    staleTime: Infinity, // Versions rarely change
  });
}

/**
 * Query hook for fetching conformance levels
 */
export function useLevelsQuery() {
  return useQuery<string[], Error>({
    queryKey: queryKeys.levels(),
    queryFn: getLevels,
    staleTime: Infinity, // Levels never change
  });
}
