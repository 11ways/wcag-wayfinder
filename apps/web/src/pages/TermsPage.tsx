import { useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';

import type { Term } from '../lib/types';
import LoadingIndicator from '../components/LoadingIndicator';
import { useTerms } from '../hooks/useTerms';

export default function TermsPage() {
  const { terms, isLoading, error } = useTerms();

  // Scroll to hash anchor on load
  useEffect(() => {
    if (!isLoading && terms.length > 0) {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1); // Remove '#'
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  }, [isLoading, terms]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingIndicator show={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-200">
            Error loading terms: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to WCAG Wayfinder
        </Link>
      </div>

      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
        WCAG 2.2 Terms and Definitions
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead text-gray-600 dark:text-gray-400">
          This page contains terms and definitions used in WCAG 2.2 success criteria.
        </p>

        <div className="space-y-8">
          {terms.map((term: Term) => {
            // Convert markdown to HTML
            const htmlContent = marked.parse(term.content, {
              gfm: true,
              breaks: true,
            });

            // Sanitize HTML to prevent XSS
            const sanitizedHtml = DOMPurify.sanitize(htmlContent as string, {
              ALLOWED_TAGS: [
                'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
              ],
              ALLOWED_ATTR: ['href', 'target', 'rel'],
            });

            return (
              <article
                key={term.id}
                id={term.slug}
                className="scroll-mt-8 border-b border-gray-200 pb-8 last:border-b-0 dark:border-gray-700"
              >
                <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  <a
                    href={`#${term.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {term.title}
                  </a>
                </h2>
                <div
                  className="prose-sm prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              </article>
            );
          })}
        </div>
      </div>

      {terms.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No terms found.
        </p>
      )}
    </div>
  );
}
