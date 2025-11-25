import { useState, useEffect } from 'react';
import { marked } from 'marked';

import Modal from './Modal';
import { sanitizeProseHtml } from '../lib/sanitize';
import type { Term } from '../lib/types';

interface TermModalProps {
  isOpen: boolean;
  onClose: () => void;
  term: Term | null;
}

export default function TermModal({ isOpen, onClose, term }: TermModalProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');

  // Convert Markdown to HTML with sanitization
  useEffect(() => {
    if (!term) {
      setHtmlContent('');
      return;
    }

    // Configure marked for inline rendering (no wrapping <p> tags for single line)
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    const parseContent = async () => {
      const rawHtml = await marked.parse(term.content);
      // Sanitize the HTML to prevent XSS
      const sanitizedHtml = sanitizeProseHtml(rawHtml);
      setHtmlContent(sanitizedHtml);
    };

    parseContent();
  }, [term]);

  if (!term) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={term.title}>
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </Modal>
  );
}
