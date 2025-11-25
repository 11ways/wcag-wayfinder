import { useRef } from 'react';

import type { WcagDetail, Term } from '../lib/types';
import { linkTermsInHtml } from '../lib/termUtils';
import { useTermModal } from '../hooks/useTermModal';
import TermModal from './TermModal';

interface CriterionDetailsProps {
  detailsJson: string | null;
  terms?: Term[];
  className?: string;
}

export default function CriterionDetails({
  detailsJson,
  terms = [],
  className = '',
}: CriterionDetailsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedTerm, isModalOpen, closeModal } = useTermModal(
    containerRef,
    terms
  );

  if (!detailsJson) {
    return null;
  }

  let details: WcagDetail[];
  try {
    details = JSON.parse(detailsJson);
  } catch (error) {
    console.error('Failed to parse details_json:', error);
    return null;
  }

  if (!details || details.length === 0) {
    return null;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`prose dark:prose-invert max-w-none ${className}`}
      >
      {details.map((detail, index) => {
        if (detail.type === 'p' && detail.text) {
          const linkedText = linkTermsInHtml(detail.text, terms);
          return (
            <p
              key={index}
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: linkedText }}
            />
          );
        }

        if (detail.type === 'note' && detail.text) {
          const linkedText = linkTermsInHtml(detail.text, terms);
          return (
            <div
              key={index}
              className="mb-3 border-l-4 border-blue-500 bg-blue-50 p-3 text-sm dark:bg-blue-900/20"
            >
              {detail.handle && (
                <strong className="mb-1 block">{detail.handle}:</strong>
              )}
              <p
                className="mb-0"
                dangerouslySetInnerHTML={{ __html: linkedText }}
              />
            </div>
          );
        }

        if (
          detail.type === 'ulist' &&
          detail.items &&
          detail.items.length > 0
        ) {
          return (
            <dl key={index} className="space-y-3 text-sm">
              {detail.items.map((item, itemIndex) => {
                const linkedText = linkTermsInHtml(item.text, terms);
                return (
                  <div key={itemIndex}>
                    {item.handle && (
                      <dt className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                        {item.handle}
                      </dt>
                    )}
                    <dd
                      className={item.handle ? 'ml-0' : ''}
                      dangerouslySetInnerHTML={{ __html: linkedText }}
                    />
                  </div>
                );
              })}
            </dl>
          );
        }

        return null;
      })}
      </div>

      <TermModal
        isOpen={isModalOpen}
        onClose={closeModal}
        term={selectedTerm}
      />
    </>
  );
}
