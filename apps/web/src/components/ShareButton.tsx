import { useState } from 'react';

import { faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Modal from './Modal';
import { generateShareLink } from '../lib/textUtils';

interface ShareButtonProps {
  criterionNum: string;
  criterionTitle: string;
  className?: string;
}

export default function ShareButton({
  criterionNum,
  criterionTitle,
  className = '',
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareLink = generateShareLink(criterionNum);
    const fullUrl = `${window.location.origin}${shareLink}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: still show modal even if clipboard fails
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className={`text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ${className}`}
        aria-label={`Share link to ${criterionNum}`}
        title="Share link"
        data-easy-mode-hide="share"
      >
        <FontAwesomeIcon icon={faShareNodes} className="h-5 w-5" />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Link Copied"
      >
        <p>
          The link to <strong>{criterionNum}</strong> {criterionTitle} has been
          copied to your clipboard, ready to share.
        </p>
      </Modal>
    </>
  );
}
