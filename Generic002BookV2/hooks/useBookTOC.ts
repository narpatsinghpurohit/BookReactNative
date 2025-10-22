import { useState, useEffect } from 'react';
import { fetchBookTOC, validateTOCResponse } from '../services/bookApi';
import { transformTOCToFlat } from '../services/transformTOC';
import { TransformedBookData, TOCNavigationItem, PageType } from '../types/book.types';

interface UseBookTOCReturn {
  bookData: TransformedBookData | null;
  tocItems: TOCNavigationItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and transform book TOC data
 * Called once on screen mount to build the complete page structure
 */
export const useBookTOC = (bookId: string): UseBookTOCReturn => {
  const [bookData, setBookData] = useState<TransformedBookData | null>(null);
  const [tocItems, setTocItems] = useState<TOCNavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch TOC from API
      const tocResponse = await fetchBookTOC(bookId);

      // Validate response
      if (!validateTOCResponse(tocResponse)) {
        throw new Error('Invalid TOC response structure');
      }

      // Transform nested structure to flat page sequence
      const transformedData = transformTOCToFlat(tocResponse, bookId);
      setBookData(transformedData);

      // Generate TOC navigation items
      const navigationItems = generateTOCNavigationItems(transformedData);
      setTocItems(navigationItems);

    } catch (err) {
      console.error('Error fetching book TOC:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setBookData(null);
      setTocItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchData();
    }
  }, [bookId]);

  const refetch = () => {
    if (bookId) {
      fetchData();
    }
  };

  return {
    bookData,
    tocItems,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Generate TOC navigation items for the WebView TOC page
 * Filters out Cover and TOC pages, shows hierarchical structure
 */
const generateTOCNavigationItems = (bookData: TransformedBookData): TOCNavigationItem[] => {
  const items: TOCNavigationItem[] = [];

  bookData.pageSequence.forEach((page) => {
    // Skip Cover and TOC pages in the navigation
    if (page.pageType === PageType.CoverPage || page.pageType === PageType.TOC) {
      return;
    }

    let level = 1;
    let hasChildren = false;
    let parentId: string | undefined;

    switch (page.pageType) {
      case PageType.BookSection:
        level = 1;
        hasChildren = true;
        break;
      
      case PageType.Sthanam:
        level = 1;
        hasChildren = true;
        break;
      
      case PageType.Chapter:
        level = 2;
        hasChildren = true;
        parentId = page.sthanamId;
        break;
      
      case PageType.Section:
        level = 3;
        hasChildren = false;
        parentId = page.chapterId;
        break;
    }

    items.push({
      page: page.page,
      pageType: page.pageType,
      header: page.tocHeader,
      level,
      hasChildren,
      parentId,
    });
  });

  return items;
};