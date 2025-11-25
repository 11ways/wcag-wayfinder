import { useEffect, useRef } from 'react';

import { ANNOUNCE_EVENT, type Priority } from '../utils/announce';

/**
 * LiveRegion component for screen reader announcements
 *
 * This component creates two visually-hidden ARIA live regions:
 * - One with aria-live="polite" for non-urgent announcements
 * - One with aria-live="assertive" for urgent announcements
 *
 * Place this component once at the root of your application.
 */
export default function LiveRegion() {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleAnnounce = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message: string;
        priority: Priority;
      }>;
      const { message, priority } = customEvent.detail;

      const targetRef = priority === 'assertive' ? assertiveRef : politeRef;

      if (!targetRef.current) return;

      // Clear the region first to ensure the message is announced even if it's the same
      targetRef.current.textContent = '';

      // Use setTimeout to ensure screen readers detect the change
      setTimeout(() => {
        if (targetRef.current) {
          targetRef.current.textContent = message;
        }

        // Clear the message after a delay to prevent re-announcing on re-renders
        setTimeout(() => {
          if (targetRef.current) {
            targetRef.current.textContent = '';
          }
        }, 1000);
      }, 100);
    };

    window.addEventListener(ANNOUNCE_EVENT, handleAnnounce);

    return () => {
      window.removeEventListener(ANNOUNCE_EVENT, handleAnnounce);
    };
  }, []);

  return (
    <>
      {/* Polite live region - announces when screen reader is idle */}
      <div
        ref={politeRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Assertive live region - interrupts current screen reader announcements */}
      <div
        ref={assertiveRef}
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
      />
    </>
  );
}
