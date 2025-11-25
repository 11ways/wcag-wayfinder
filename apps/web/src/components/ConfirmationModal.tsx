import { useEffect, useRef, useCallback } from 'react';

import { announce } from '../utils/announce';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
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
    (element) => element.offsetParent !== null
  );
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}: ConfirmationModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const confirmButtonClass = {
    danger:
      'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
    warning:
      'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
  }[variant];

  const handleClose = useCallback(() => {
    announce('Dialog closed');
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

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

      // Focus the heading when modal opens
      setTimeout(() => {
        if (headingRef.current) {
          headingRef.current.focus();
        } else if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
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
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <div
        ref={dialogRef}
        className="bg-primary border-primary mx-4 w-full max-w-md rounded-lg border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <h2
          ref={headingRef}
          id="confirmation-modal-title"
          tabIndex={-1}
          className="text-primary mb-4 text-xl font-semibold"
        >
          {title}
        </h2>
        <p
          id="confirmation-modal-description"
          className="text-secondary mb-6"
        >
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            onClick={handleClose}
            className="btn btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`btn ${confirmButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
