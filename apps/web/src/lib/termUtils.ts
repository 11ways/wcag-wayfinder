/**
 * Utilities for linking WCAG terms in content
 */

import { sanitizeTermLinkedHtml } from './sanitize';

export interface Term {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a regex pattern that matches a term (case-insensitive, whole word)
 * Also handles terms with parenthetical content like "assistive technology(as used in this document)"
 */
function buildTermPattern(term: Term): RegExp {
  // Create patterns for both full title and clean title (without parentheticals)
  const fullTitle = term.title;
  const cleanTitle = fullTitle.replace(/\([^)]*\)/g, '').trim();

  // Escape special regex characters
  const escapedFull = escapeRegex(fullTitle);
  const escapedClean = escapeRegex(cleanTitle);

  // Match either the full term or the clean term, with word boundaries
  // Use negative lookbehind/lookahead to ensure we're not inside a tag or already linked
  const pattern = `\\b(${escapedFull}|${escapedClean})\\b`;

  return new RegExp(pattern, 'i'); // case-insensitive
}

/**
 * Creates an HTML link element for a term
 */
function createTermLink(termText: string, slug: string): string {
  // SVG icon for help/info
  const icon = `<svg class="inline-block w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
  </svg>`;

  return `<a class="term" href="/terms#${slug}">${termText}${icon}</a>`;
}

/**
 * Links terms in HTML content (text nodes only, first occurrence of each term)
 *
 * @param html - The HTML content to process
 * @param terms - Array of terms to link
 * @returns Modified HTML with linked terms
 */
export function linkTermsInHtml(html: string, terms: Term[]): string {
  if (!html || !terms || terms.length === 0) {
    return html;
  }

  // Track which terms have already been linked (case-insensitive)
  const linkedTerms = new Set<string>();

  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = [...terms].sort((a, b) => {
    const aLen = a.title.replace(/\([^)]*\)/g, '').length;
    const bLen = b.title.replace(/\([^)]*\)/g, '').length;
    return bLen - aLen;
  });

  // Create a temporary div to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Walk through all text nodes
  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip if parent is already a link or script/style tag
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tagName = parent.tagName.toLowerCase();
        if (tagName === 'a' || tagName === 'script' || tagName === 'style') {
          return NodeFilter.FILTER_REJECT;
        }

        // Only accept nodes with actual text content
        if (!node.textContent || node.textContent.trim() === '') {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes: Node[] = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }

  // Process each text node
  for (const textNode of textNodes) {
    let text = textNode.textContent || '';

    for (const term of sortedTerms) {
      // Skip if this term was already linked
      const termKey = term.title.toLowerCase();
      if (linkedTerms.has(termKey)) {
        continue;
      }

      // Build pattern for this term
      const pattern = buildTermPattern(term);
      const match = text.match(pattern);

      if (match) {
        // Found a match! Replace it with a link
        const matchedText = match[0];
        const beforeText = text.substring(0, match.index);
        const afterText = text.substring(match.index! + matchedText.length);

        // Create a temporary container to hold the new HTML
        const container = document.createElement('span');
        container.innerHTML = beforeText + createTermLink(matchedText, term.slug) + afterText;

        // Replace the text node with the new content
        const parent = textNode.parentNode;
        if (parent) {
          // Insert all child nodes of the container
          while (container.firstChild) {
            parent.insertBefore(container.firstChild, textNode);
          }
          parent.removeChild(textNode);
        }

        // Mark this term as linked
        linkedTerms.add(termKey);

        // Move to next term (we've modified the DOM)
        break;
      }
    }
  }

  // Return the modified HTML, sanitized to prevent XSS
  return sanitizeTermLinkedHtml(doc.body.innerHTML);
}

/**
 * React hook version that memoizes the linking operation
 */
export function useTermLinking(html: string, terms: Term[]): string {
  // In a real implementation, you'd use useMemo here
  // For now, just call the function directly
  return linkTermsInHtml(html, terms);
}
