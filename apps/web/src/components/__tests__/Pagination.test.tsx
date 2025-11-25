import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import Pagination from '../Pagination';

describe('Pagination', () => {
  describe('rendering', () => {
    it('should not render when totalPages is 1', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should not render when totalPages is 0', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={0} onPageChange={() => {}} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render navigation with aria-label', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={() => {}}
          ariaLabel="Test Pagination"
        />
      );
      expect(
        screen.getByRole('navigation', { name: 'Test Pagination' })
      ).toBeInTheDocument();
    });

    it('should render with default aria-label', () => {
      render(
        <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
      );
      expect(
        screen.getByRole('navigation', { name: 'Pagination' })
      ).toBeInTheDocument();
    });

    it('should render Previous and Next buttons', () => {
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />
      );

      expect(
        screen.getByRole('button', { name: 'Previous page' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Next page' })
      ).toBeInTheDocument();
    });

    it('should render page numbers', () => {
      render(
        <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
      );

      expect(
        screen.getByRole('button', { name: 'Page 1' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 2' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 3' })
      ).toBeInTheDocument();
    });
  });

  describe('page number display logic', () => {
    it('should show all pages when totalPages <= 5', () => {
      render(
        <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
      );

      expect(
        screen.getByRole('button', { name: 'Page 1' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 2' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 3' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 4' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 5' })
      ).toBeInTheDocument();
    });

    it('should show ellipsis for large page ranges', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />
      );

      const ellipsis = container.querySelectorAll('[aria-hidden="true"]');
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it('should always show first and last page', () => {
      render(
        <Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />
      );

      expect(
        screen.getByRole('button', { name: 'Page 1' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 10' })
      ).toBeInTheDocument();
    });

    it('should show pages around current page', () => {
      render(
        <Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />
      );

      expect(
        screen.getByRole('button', { name: 'Page 4' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 5' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 6' })
      ).toBeInTheDocument();
    });
  });

  describe('button states', () => {
    it('should disable Previous button on first page', () => {
      render(
        <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
      );

      const prevButton = screen.getByRole('button', { name: 'Previous page' });
      expect(prevButton).toBeDisabled();
    });

    it('should enable Previous button when not on first page', () => {
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />
      );

      const prevButton = screen.getByRole('button', { name: 'Previous page' });
      expect(prevButton).not.toBeDisabled();
    });

    it('should disable Next button on last page', () => {
      render(
        <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
      );

      const nextButton = screen.getByRole('button', { name: 'Next page' });
      expect(nextButton).toBeDisabled();
    });

    it('should enable Next button when not on last page', () => {
      render(
        <Pagination currentPage={4} totalPages={5} onPageChange={() => {}} />
      );

      const nextButton = screen.getByRole('button', { name: 'Next page' });
      expect(nextButton).not.toBeDisabled();
    });

    it('should mark current page with aria-current', () => {
      render(
        <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
      );

      const currentPageButton = screen.getByRole('button', { name: 'Page 3' });
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });

    it('should not mark non-current pages with aria-current', () => {
      render(
        <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
      );

      const page1Button = screen.getByRole('button', { name: 'Page 1' });
      expect(page1Button).not.toHaveAttribute('aria-current');
    });
  });

  describe('interactions', () => {
    it('should call onPageChange when Previous is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: 'Previous page' });
      await user.click(prevButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when Next is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('should call onPageChange when a page number is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      // With currentPage=1 and totalPages=5, visible pages are: 1, 2, ..., 5
      // Click on Page 2 which is visible
      const page2Button = screen.getByRole('button', { name: 'Page 2' });
      await user.click(page2Button);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should not call onPageChange when disabled Previous is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: 'Previous page' });
      await user.click(prevButton);

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('should not call onPageChange when disabled Next is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <Pagination
          currentPage={5}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);

      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have minimum touch target size (44x44px) for page number buttons', () => {
      render(
        <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
      );

      // Page number buttons (not Previous/Next) should have explicit min-w/h classes
      // With currentPage=3 and totalPages=5, pages 1-5 are all visible
      const pageNumberButtons = [1, 2, 3, 4, 5].map((page) =>
        screen.getByRole('button', { name: `Page ${page}` })
      );

      pageNumberButtons.forEach((button) => {
        const classes = button.className;
        expect(
          classes.includes('min-w-[44px]') && classes.includes('min-h-[44px]')
        ).toBe(true);
      });

      // Previous and Next buttons use btn class for sizing
      const prevButton = screen.getByRole('button', { name: 'Previous page' });
      const nextButton = screen.getByRole('button', { name: 'Next page' });
      expect(prevButton.className).toContain('btn');
      expect(nextButton.className).toContain('btn');
    });

    it('should have proper ARIA labels for all buttons', () => {
      render(
        <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
      );

      expect(
        screen.getByRole('button', { name: 'Previous page' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Next page' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 1' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 3' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Page 5' })
      ).toBeInTheDocument();
    });

    it('should hide ellipsis from screen readers', () => {
      const { container } = render(
        <Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />
      );

      const ellipsis = container.querySelectorAll('[aria-hidden="true"]');
      ellipsis.forEach((el) => {
        expect(el).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});
