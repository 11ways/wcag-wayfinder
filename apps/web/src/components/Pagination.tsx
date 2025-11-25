import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel,
}: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];

  // Always show first page
  pages.push(1);

  // Show pages around current page
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    if (
      pages[pages.length - 1] !== i - 1 &&
      pages[pages.length - 1] !== '...'
    ) {
      pages.push('...');
    }
    pages.push(i);
  }

  // Always show last page
  if (
    pages[pages.length - 1] !== totalPages - 1 &&
    pages[pages.length - 1] !== totalPages
  ) {
    if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  if (pages[pages.length - 1] !== totalPages) {
    pages.push(totalPages);
  }

  return (
    <nav
      aria-label={ariaLabel || t('common:navigation.pageOf', { page: currentPage, total: totalPages })}
      className="mt-6 flex items-center justify-center gap-2"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t('common:navigation.previous')}
        className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('common:navigation.previous')}
      </button>

      <div className="flex gap-1">
        {pages.map((page, index) =>
          page === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center px-2 py-1"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-label={t('common:navigation.pageLabel', { page })}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`min-h-[44px] min-w-[44px] rounded px-3 py-2 font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t('common:navigation.next')}
        className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('common:navigation.next')}
      </button>
    </nav>
  );
}
