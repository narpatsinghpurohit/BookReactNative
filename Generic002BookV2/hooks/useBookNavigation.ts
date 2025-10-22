import { useState, useCallback } from 'react';
import { NavigationState } from '../types/book.types';

interface UseBookNavigationProps {
  totalPages: number;
  initialPage?: number;
}

interface UseBookNavigationReturn extends NavigationState {
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
}

/**
 * Hook to manage book navigation state
 * Handles both TOC navigation (jump to page) and sequential navigation (next/previous)
 */
export const useBookNavigation = ({
  totalPages,
  initialPage = 1,
}: UseBookNavigationProps): UseBookNavigationReturn => {
  const [currentPage, setCurrentPageState] = useState(initialPage);

  // Calculate derived state
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  // Page navigation functions
  const setCurrentPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPageState(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPageState(prev => prev + 1);
    }
  }, [canGoNext]);

  const previousPage = useCallback(() => {
    if (canGoPrevious) {
      setCurrentPageState(prev => prev - 1);
    }
  }, [canGoPrevious]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  const reset = useCallback(() => {
    setCurrentPageState(initialPage);
  }, [initialPage]);

  return {
    currentPage,
    totalPages,
    progress,
    canGoNext,
    canGoPrevious,
    setCurrentPage,
    nextPage,
    previousPage,
    goToPage,
    reset,
  };
};