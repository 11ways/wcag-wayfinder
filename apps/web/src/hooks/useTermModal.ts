import { useState, useEffect, useCallback, useRef } from 'react';

import type { Term } from '../lib/types';

interface UseTermModalReturn {
  selectedTerm: Term | null;
  isModalOpen: boolean;
  closeModal: () => void;
}

/**
 * Hook to manage term modal state and handle term link clicks
 *
 * This hook intercepts clicks on .term links and shows a modal
 * instead of navigating to the terms page.
 *
 * @param containerRef - Ref to the container element with term links
 * @param terms - Array of available terms
 */
export function useTermModal(
  containerRef: React.RefObject<HTMLElement>,
  terms: Term[]
): UseTermModalReturn {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const termsMapRef = useRef<Map<string, Term>>(new Map());

  // Build a map of slug -> term for quick lookup
  useEffect(() => {
    const termsMap = new Map<string, Term>();
    for (const term of terms) {
      termsMap.set(term.slug, term);
    }
    termsMapRef.current = termsMap;
  }, [terms]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTerm(null);
  }, []);

  const openModal = useCallback((term: Term) => {
    setSelectedTerm(term);
    setIsModalOpen(true);
  }, []);

  // Handle clicks on term links
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Find the closest .term link (in case user clicked the icon inside)
      const termLink = target.closest('a.term') as HTMLAnchorElement;

      if (!termLink) return;

      // Extract slug from href (format: /terms#slug)
      const href = termLink.getAttribute('href');
      if (!href) return;

      const slug = href.replace('/terms#', '');
      const term = termsMapRef.current.get(slug);

      if (term) {
        // Prevent default navigation
        e.preventDefault();
        openModal(term);
      }
    };

    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [containerRef, openModal]);

  return {
    selectedTerm,
    isModalOpen,
    closeModal,
  };
}
