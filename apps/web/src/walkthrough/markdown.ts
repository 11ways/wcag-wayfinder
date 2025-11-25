/**
 * Walkthrough Mode - Markdown Content Loader
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { StepContent } from './types';

// Cache for loaded markdown content
const markdownCache = new Map<string, StepContent>();

/**
 * Extracts title from markdown (first h1 or h2)
 */
function extractTitle(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const heading = tempDiv.querySelector('h1, h2');
  if (heading) {
    const title = heading.textContent || '';
    heading.remove();
    return title;
  }

  return `Step ${Date.now()}`; // Fallback
}

/**
 * Loads and parses markdown content for a step
 */
export async function loadStepContent(
  stepNumber: number,
  pathGenerator: (n: number) => string
): Promise<StepContent> {
  const path = pathGenerator(stepNumber);

  // Check cache
  if (markdownCache.has(path)) {
    return markdownCache.get(path)!;
  }

  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed to load: ${response.statusText}`);
    }

    const markdown = await response.text();
    let html = await marked(markdown);

    // Sanitize HTML
    html = DOMPurify.sanitize(html);

    // Extract title
    const title = extractTitle(html);

    const content: StepContent = {
      title,
      body: html,
    };

    // Cache it
    markdownCache.set(path, content);

    return content;
  } catch (error) {
    console.error(`Failed to load walkthrough step ${stepNumber}:`, error);

    // Return fallback content
    return {
      title: `Step ${stepNumber}`,
      body: `<p>Content for step ${stepNumber} could not be loaded.</p>`,
    };
  }
}

/**
 * Clears the markdown cache
 */
export function clearCache(): void {
  markdownCache.clear();
}
