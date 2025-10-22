import { useState, useCallback } from 'react';

interface UseBookNavigationProps {
  totalPages: number;
  initialPage?: number;
}

export const useBookNavigation = ({ 
  totalPages, 
  initialPage = 1 
}: UseBookNavigationProps) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Navigate to specific page
  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) {
      console.warn(`Invalid page number: ${pageNumber}. Must be between 1 and ${totalPages}`);
      return false;
    }
    
    console.log(`📖 Navigating to page ${pageNumber}`);
    setCurrentPage(pageNumber);
    return true;
  }, [totalPages]);

  // Go to next page
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const nextPageNum = currentPage + 1;
      console.log(`➡️ Next page: ${nextPageNum}`);
      setCurrentPage(nextPageNum);
      return true;
    }
    console.log('📕 Already at last page');
    return false;
  }, [currentPage, totalPages]);

  // Go to previous page
  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      const prevPageNum = currentPage - 1;
      console.log(`⬅️ Previous page: ${prevPageNum}`);
      setCurrentPage(prevPageNum);
      return true;
    }
    console.log('📕 Already at first page');
    return false;
  }, [currentPage]);

  // Check if can navigate
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  // Calculate progress
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
    progress,
  };
};
