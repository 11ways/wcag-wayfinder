import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';

import { sanitizeProseHtml } from '../lib/sanitize';
import { FALLBACK_LANGUAGE } from '../lib/i18n/languages';

interface UseLocalizedContentOptions {
  /** Enable/disable the query (useful for conditional loading) */
  enabled?: boolean;
}

interface UseLocalizedContentResult {
  /** Sanitized HTML content */
  content: string;
  /** Whether content is being loaded */
  isLoading: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** Error message if any */
  error: Error | null;
  /** The language the content was loaded from (may differ from current if fallback was used) */
  loadedLanguage: string | null;
  /** Whether the content is from a fallback language */
  isFallback: boolean;
}

/**
 * Hook for loading localized Markdown content with automatic fallback to English
 *
 * @param contentPath - Path to the content file relative to /content/{lang}/
 *                      e.g., "filters/version.md" or "warnings/empty-versions.md"
 * @param options - Optional configuration
 *
 * @example
 * const { content, isLoading } = useLocalizedContent('filters/version.md');
 * if (isLoading) return <Spinner />;
 * return <div dangerouslySetInnerHTML={{ __html: content }} />;
 */
export function useLocalizedContent(
  contentPath: string,
  options: UseLocalizedContentOptions = {}
): UseLocalizedContentResult {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['content', locale, contentPath],
    queryFn: async (): Promise<{ html: string; loadedLanguage: string; isFallback: boolean }> => {
      // Try requested locale first
      const localePath = `/content/${locale}/${contentPath}`;
      let response = await fetch(localePath);
      let loadedLanguage = locale;
      let isFallback = false;

      // Fallback to English if not found
      if (!response.ok && locale !== FALLBACK_LANGUAGE) {
        const fallbackPath = `/content/${FALLBACK_LANGUAGE}/${contentPath}`;
        response = await fetch(fallbackPath);
        loadedLanguage = FALLBACK_LANGUAGE;
        isFallback = true;

        if (!response.ok) {
          throw new Error(`Content not found: ${contentPath}`);
        }
      }

      if (!response.ok) {
        throw new Error(`Content not found: ${contentPath}`);
      }

      const markdown = await response.text();
      const rawHtml = await marked(markdown);
      const html = sanitizeProseHtml(rawHtml);

      return { html, loadedLanguage, isFallback };
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes (matches existing cache time)
    retry: 1,
  });

  return {
    content: query.data?.html ?? '',
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    loadedLanguage: query.data?.loadedLanguage ?? null,
    isFallback: query.data?.isFallback ?? false,
  };
}

export default useLocalizedContent;
