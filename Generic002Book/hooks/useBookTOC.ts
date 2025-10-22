import { useQuery } from '@tanstack/react-query';
import { fetchBookTOC } from '../services/bookApi';
import { transformTOCToFlat } from '../services/transformTOC';
import { TransformedBookCache } from '../types/book.types';

/**
 * Query key factory for book TOC
 */
export const bookTOCQueryKey = (bookId: string) => ['books', bookId, 'toc'];

/**
 * Hook to fetch and transform book TOC
 * Uses React Query for caching, background refetch, etc.
 */
export const useBookTOC = (bookId: string) => {
  const query = useQuery({
    queryKey: bookTOCQueryKey(bookId),
    
    queryFn: async (): Promise<TransformedBookCache> => {
      
      // Step 1: Fetch raw TOC from API
      const rawTOC = await fetchBookTOC(bookId);
      
      
      // Step 2: Transform nested structure to flat
      const transformedData = transformTOCToFlat(rawTOC, bookId);
      
      
      return transformedData;
    },
    
    // Cache for 24 hours - TOC rarely changes
    staleTime: 0, // 24 hours
    
    // Keep in memory 
    gcTime: 1000 * 60, // 60 seconds
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: true,
    
    // Don't refetch on window focus (mobile doesn't have windows)
    refetchOnWindowFocus: false,
    
    // Refetch when coming back online
    refetchOnReconnect: true,
    
    // Retry failed requests 3 times
    retry: 3,
    
    // Exponential backoff for retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Enable query only if bookId exists
    enabled: !!bookId,
  });

  return {
    // Transformed book data
    bookData: query.data,
    
    // Loading state
    isLoading: query.isLoading,
    
    // Error state
    error: query.error,
    
    // Is fetching (including background refetch)
    isFetching: query.isFetching,
    
    // Success state
    isSuccess: query.isSuccess,
    
    // Manual refetch function (for pull-to-refresh)
    refetch: query.refetch,
    
    // Book metadata (quick access without full data)
    bookMetadata: query.data?.bookMetadata,
    
    // Total pages (quick access)
    totalPages: query.data?.totalPages || 0,
    
    // Page sequence (quick access)
    pageSequence: query.data?.pageSequence || [],
  };
};

/**
 * Helper hook to get specific page data
 */
export const usePageByNumber = (bookId: string, pageNumber: number) => {
  const { bookData } = useBookTOC(bookId);
  
  if (!bookData) return null;
  
  return bookData.lookupMaps.pageByNumber[pageNumber] || null;
};

/**
 * Helper hook to get page by pageId
 */
export const usePageByPageId = (bookId: string, pageId: string) => {
  const { bookData } = useBookTOC(bookId);
  
  if (!bookData) return null;
  
  const pageNumber = bookData.lookupMaps.pageIdToNumber[pageId];
  if (!pageNumber) return null;
  
  return bookData.lookupMaps.pageByNumber[pageNumber] || null;
};
