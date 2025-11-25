/**
 * Shared HTML sanitization utilities using DOMPurify
 *
 * This module provides consistent sanitization configs for different content types
 * to prevent XSS attacks while allowing necessary HTML elements.
 */

import DOMPurify, { type Config } from 'dompurify';

/**
 * Sanitization config for prose/markdown content
 * Used for: Help modals, warning messages, no-results tips
 */
export const PROSE_SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'code',
    'pre',
    'blockquote',
    'span',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
};

/**
 * Sanitization config for content with term links
 * Used for: CriterionDetails, content with SVG icons
 */
export const TERM_LINK_SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    ...PROSE_SANITIZE_CONFIG.ALLOWED_TAGS!,
    'svg',
    'path',
    'dl',
    'dt',
    'dd',
  ],
  ALLOWED_ATTR: [
    ...PROSE_SANITIZE_CONFIG.ALLOWED_ATTR!,
    'fill',
    'viewBox',
    'd',
    'fill-rule',
    'clip-rule',
    'aria-hidden',
  ],
};

/**
 * Sanitize prose HTML content (markdown-derived content)
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeProseHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, PROSE_SANITIZE_CONFIG) as string;
}

/**
 * Sanitize HTML content that contains term links with SVG icons
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeTermLinkedHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, TERM_LINK_SANITIZE_CONFIG) as string;
}
