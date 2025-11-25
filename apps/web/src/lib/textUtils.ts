/**
 * Truncates text to a maximum length, breaking on word boundaries
 * @param text The text to truncate
 * @param maxLength Maximum character length (default: 40)
 * @returns Object with truncated text and whether it was truncated
 */
export function truncateOnWordBoundary(
  text: string,
  maxLength: number = 40
): { truncated: string; wasTruncated: boolean; remaining: string } {
  if (text.length <= maxLength) {
    return { truncated: text, wasTruncated: false, remaining: '' };
  }

  // Find the last space within maxLength
  let truncateAt = text.lastIndexOf(' ', maxLength);

  // If no space found, truncate at maxLength
  if (truncateAt === -1) {
    truncateAt = maxLength;
  }

  const truncated = text.substring(0, truncateAt);
  const remaining = text.substring(truncateAt).trim();

  return { truncated, wasTruncated: true, remaining };
}

/**
 * Generates an article ID from a success criterion number
 * @param num Success criterion number (e.g., "1.1.1")
 * @returns ID string (e.g., "sc-1-1-1")
 */
export function generateCriterionId(num: string): string {
  return `sc-${num.replace(/\./g, '-')}`;
}

/**
 * Generates a shareable link for a success criterion
 * @param num Success criterion number (e.g., "1.1.1")
 * @returns Share link path (e.g., "/guideline:1-1#sc-1-1-1")
 */
export function generateShareLink(num: string): string {
  const parts = num.split('.');
  if (parts.length < 2) return '/';

  const guidelineNum = `${parts[0]}-${parts[1]}`;
  const criterionId = generateCriterionId(num);

  return `/guideline:${guidelineNum}#${criterionId}`;
}
