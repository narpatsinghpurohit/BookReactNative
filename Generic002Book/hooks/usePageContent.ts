import { useQuery } from '@tanstack/react-query';
import { fetchPageContent, EditorJSContent } from '../services/pageApi';
import { cachePageContent, loadPageContent } from '../storage/pageCache';
import { FlatPageItem, PageType } from '../types/book.types';

/**
 * Query key factory for page content
 */
export const pageContentQueryKey = (bookId: string, pageId: string) => [
  'books',
  bookId,
  'pages',
  pageId,
  'content',
];

/**
 * Hook to fetch page content
 */
export const usePageContent = (bookId: string, page: FlatPageItem | null) => {
  const query = useQuery({
    queryKey: page ? pageContentQueryKey(bookId, page.pageId!) : ['no-page'],
    
    queryFn: async (): Promise<EditorJSContent> => {
      if (!page || !page.pageId) {
        throw new Error('Invalid page data');
      }

      // Step 1: Try to load from MMKV cache
      const cached = loadPageContent(bookId, page.pageId);
      if (cached) {
        return cached;
      }

      // Step 2: Fetch from API/URL
      const content = await fetchPageContent(
        bookId,
        page
      );

      // Step 3: Save to MMKV cache
      cachePageContent(bookId, page.pageId, content);

      return content;
    },

    // Only run if we have a valid page with pageId (content pages)
    enabled: !!page && !!page.pageId && page.pageType === PageType.Section,

    // Cache for 1 hour in React Query
    staleTime: 1000 * 60 * 60, // 1 hour

    // Keep in memory for 2 hours
    gcTime: 1000 * 60 * 60 * 2, // 2 hours

    // Don't refetch on mount if data is fresh
    refetchOnMount: false,

    // Don't refetch on window focus
    refetchOnWindowFocus: false,

    // Retry failed requests 2 times
    retry: 2,

    // Exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  return {
    content: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};

/**
 * Helper: Check if page needs content fetching
 */
export const needsContentFetch = (page: FlatPageItem | null): boolean => {
  if (!page) return false;
  if (page.pageType !== PageType.Section) return false;
  if (!page.pageId) return false;
  return true;
};
