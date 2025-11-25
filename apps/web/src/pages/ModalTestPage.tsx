import { useState } from 'react';

import LiveRegion from '../components/LiveRegion';
import Modal from '../components/Modal';

export default function ModalTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-secondary min-h-screen p-8">
      {/* Live region for screen reader announcements */}
      <LiveRegion />
      <div className="mx-auto max-w-4xl">
        <h1 className="text-primary mb-6 text-3xl font-bold">
          Modal Focus Trap Test Page
        </h1>

        <div className="card mb-6">
          <h2 className="text-primary mb-4 text-xl font-semibold">
            Test Instructions
          </h2>
          <ol className="text-secondary list-inside list-decimal space-y-2">
            <li>Click the "Open Test Modal" button below</li>
            <li>
              Notice that focus automatically moves to the modal heading for
              context
            </li>
            <li>
              Press Tab to move to the "Close" button (the first interactive
              element)
            </li>
            <li>
              Press Tab again - focus stays on the Close button (trapped in
              modal)
            </li>
            <li>Press Shift+Tab - focus cycles back to the Close button</li>
            <li>Try to tab outside the modal - you should be trapped inside</li>
            <li>Press Escape to close the modal</li>
            <li>Notice that focus returns to the "Open Test Modal" button</li>
          </ol>
        </div>

        <div className="card mb-6">
          <h2 className="text-primary mb-4 text-xl font-semibold">
            Focusable Elements Before Modal
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-secondary">Dummy Button 1</button>
            <button className="btn btn-secondary">Dummy Button 2</button>
            <input
              type="text"
              className="form-input"
              placeholder="Dummy input field"
            />
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Open Test Modal
            </button>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-primary mb-4 text-xl font-semibold">
            More Focusable Elements
          </h2>
          <div className="flex flex-wrap gap-3">
            <a href="#test" className="text-accent">
              Test Link
            </a>
            <button className="btn btn-secondary">Dummy Button 3</button>
            <select className="form-input">
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
        </div>

        <div className="card">
          <h2 className="text-primary mb-4 text-xl font-semibold">
            Accessibility Features Implemented
          </h2>
          <ul className="text-secondary list-inside list-disc space-y-2">
            <li>
              <strong>Focus Trap:</strong> Tab and Shift+Tab cycle only within
              the modal
            </li>
            <li>
              <strong>Escape Key:</strong> Closes the modal
            </li>
            <li>
              <strong>Focus Management:</strong> Focus returns to the trigger
              element when modal closes
            </li>
            <li>
              <strong>Heading Focus:</strong> Modal heading receives initial
              focus (tabindex="-1") to provide immediate context for screen
              reader users
            </li>
            <li>
              <strong>Auto-focus:</strong> After heading, first Tab moves to the
              Close button (first interactive element)
            </li>
            <li>
              <strong>Body Scroll Lock:</strong> Background scrolling is
              prevented when modal is open
            </li>
            <li>
              <strong>ARIA Attributes:</strong> Proper role="dialog",
              aria-modal="true", aria-labelledby, aria-describedby
            </li>
            <li>
              <strong>Click Outside:</strong> Clicking the backdrop closes the
              modal
            </li>
            <li>
              <strong>Screen Reader Announcements:</strong> Announces "Dialog
              closed" via ARIA live region when modal is dismissed
            </li>
          </ul>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Test Modal with Focus Trap"
      >
        <p className="mb-4">
          This is a test modal to demonstrate the focus trap functionality.
        </p>
        <p className="mb-4">
          Try pressing{' '}
          <kbd className="rounded bg-gray-200 px-2 py-1 font-mono text-sm dark:bg-gray-700">
            Tab
          </kbd>{' '}
          to move focus. You should not be able to tab outside of this modal.
        </p>
        <p className="mb-4">
          Press{' '}
          <kbd className="rounded bg-gray-200 px-2 py-1 font-mono text-sm dark:bg-gray-700">
            Shift+Tab
          </kbd>{' '}
          to move focus backwards.
        </p>
        <p>
          Press{' '}
          <kbd className="rounded bg-gray-200 px-2 py-1 font-mono text-sm dark:bg-gray-700">
            Escape
          </kbd>{' '}
          to close this modal, or click the "Close" button below.
        </p>
      </Modal>
    </div>
  );
}
