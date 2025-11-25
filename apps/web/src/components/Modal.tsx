import { useEffect, useRef, useCallback } from 'react';

import { announce } from '../utils/announce';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Helper function to get all focusable elements within a container
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  const elements = container.querySelectorAll<HTMLElement>(
    focusableSelectors.join(', ')
  );

  return Array.from(elements).filter(
    (element) => element.offsetParent !== null // Filter out hidden elements
  );
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Wrapper for onClose that announces to screen readers
  const handleClose = useCallback(() => {
    announce('Dialog closed');
    onClose();
  }, [onClose]);

  // Handle focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!dialogRef.current) return;

      // Handle Escape key
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      // Handle Tab key for focus trap
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements(dialogRef.current);

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift + Tab (backward)
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        }
        // Tab (forward)
        else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (isOpen) {
      // Save the currently focused element
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus the first heading when modal opens (or close button as fallback)
      setTimeout(() => {
        if (headingRef.current) {
          headingRef.current.focus();
        } else if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        } else if (dialogRef.current) {
          const focusableElements = getFocusableElements(dialogRef.current);
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }
      }, 100);

      // Add keyboard event listener
      document.addEventListener('keydown', handleKeyDown);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Return focus to the previously focused element
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
        previouslyFocusedElement.current = null;
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby="modal-description"
    >
      <div
        ref={dialogRef}
        className="bg-primary border-primary mx-4 w-full max-w-md rounded-lg border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {title && (
          <h2
            ref={headingRef}
            id="modal-title"
            tabIndex={-1}
            className="text-primary mb-4 text-xl font-semibold"
          >
            {title}
          </h2>
        )}
        <div id="modal-description" className="text-secondary mb-6">
          {children}
        </div>
        <div className="flex justify-end gap-3">
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            className="btn btn-primary"
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
