import { useEffect, useRef, useMemo, useState } from 'react';

import DOMPurify from 'dompurify';
import { FocusTrap } from 'focus-trap-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string; // HTML content from markdown
}

export default function HelpModal({
  isOpen,
  onClose,
  title,
  content,
}: HelpModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    if (!content || !content.trim()) return '';
    return DOMPurify.sanitize(content, {
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
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    });
  }, [content]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && sanitizedContent) {
      // Store the currently focused element to return focus later
      previousActiveElement.current = document.activeElement as HTMLElement;

      dialog.showModal();
      setIsDialogOpen(true);
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      dialog.addEventListener('keydown', handleKeyDown);
      return () => dialog.removeEventListener('keydown', handleKeyDown);
    } else {
      dialog.close();
      setIsDialogOpen(false);

      // Return focus to the element that opened the modal
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, onClose, sanitizedContent]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!isInDialog) {
      onClose();
    }
  };

  if (!isOpen || !sanitizedContent) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="w-full max-w-2xl rounded-lg bg-white p-0 shadow-xl backdrop:bg-black backdrop:bg-opacity-50 dark:bg-gray-900"
      aria-labelledby="modal-title"
    >
      {isDialogOpen ? (
        <FocusTrap
          focusTrapOptions={{
            initialFocus: () => closeButtonRef.current!,
            allowOutsideClick: true,
          }}
        >
          <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <h2 id="modal-title" className="text-2xl font-bold">
              {title}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close dialog"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
        </FocusTrap>
      ) : (
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <h2 id="modal-title" className="text-2xl font-bold">
              {title}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close dialog"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
