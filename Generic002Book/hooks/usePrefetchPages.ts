import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { pageContentQueryKey } from './usePageContent';
import { fetchPageContent } from '../services/pageApi';
import { cachePageContent, isPageCached } from '../storage/pageCache';
import { PageType, TransformedBookCache } from '../types/book.types';

interface UsePrefetchPagesProps {
  bookId: string;
  bookData: TransformedBookCache | null;
  currentPage: number;
  prefetchCount?: number; // How many pages ahead to prefetch
}

/**
 * Hook to prefetch next pages in background
 */
export const usePrefetchPages = ({
  bookId,
  bookData,
  currentPage,
  prefetchCount = 2,
}: UsePrefetchPagesProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!bookData || !bookData.totalPages) {
      console.log('⚠️ Skipping prefetch - book data not loaded yet');
      return;
    }

    // Get next pages to prefetch
    const pagesToPrefetch = [];
    
    for (let i = 1; i <= prefetchCount; i++) {
      const nextPageNumber = currentPage + i;
      if (nextPageNumber <= bookData.totalPages) {
        const nextPage = bookData.lookupMaps.pageByNumber[nextPageNumber];
        
        // Only prefetch content pages (not intro pages)
        if (nextPage && nextPage.pageType === PageType.Section && nextPage.pageId) {
          pagesToPrefetch.push(nextPage);
        }
      }
    }

    // Prefetch each page
    pagesToPrefetch.forEach(async (page) => {
      if (!page.pageId) return;

      // Check if already in MMKV cache
      if (isPageCached(bookId, page.pageId)) {
        return;
      }

      // Check if already in React Query cache
      const queryKey = pageContentQueryKey(bookId, page.pageId);
      const cachedData = queryClient.getQueryData(queryKey);
      
      if (cachedData) {
        return;
      }


      // Prefetch with React Query
      queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          try {
            const content = await fetchPageContent(
              bookId,
              page
            );

            // Save to MMKV cache
            cachePageContent(bookId, page.pageId!, content);

            return content;
          } catch (error) {
            throw error;
          }
        },
        staleTime: 1000 * 60 * 60, // 1 hour
      });
    });
  }, [currentPage, bookId, bookData, prefetchCount, queryClient]);
};

/**
 * Hook to prefetch a specific page range (for TOC jumps)
 */
export const usePrefetchPageRange = (
  bookId: string,
  bookData: TransformedBookCache,
) => {
  const queryClient = useQueryClient();

  const prefetchRange = async (startPage: number, endPage: number) => {

    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      const page = bookData.lookupMaps.pageByNumber[pageNum];
      
      if (page && page.pageType === PageType.Section && page.pageId) {
        // Skip if already cached
        if (isPageCached(bookId, page.pageId)) {
          continue;
        }

        const queryKey = pageContentQueryKey(bookId, page.pageId);
        
        await queryClient.prefetchQuery({
          queryKey,
          queryFn: async () => {
            const content = await fetchPageContent(
              bookId,
              page
            );
            cachePageContent(bookId, page.pageId!, content);
            return content;
          },
          staleTime: 1000 * 60 * 60,
        });
      }
    }

  };

  return { prefetchRange };
};
