import { MMKV } from 'react-native-mmkv';

// Create dedicated MMKV instance for page content
export const pageContentStorage = new MMKV({
  id: 'book-page-content',
  encryptionKey: 'your-encryption-key-here', // Optional: add encryption
});

/**
 * Cache key for page content
 */
const getPageCacheKey = (bookId: string, pageId: string): string => {
  return `page_${bookId}_${pageId}`;
};

/**
 * Save page content to cache
 */
export const cachePageContent = (
  bookId: string,
  pageId: string,
  content: any,
): void => {
  try {
    const key = getPageCacheKey(bookId, pageId);
    const data = {
      content,
      cachedAt: Date.now(),
    };
    pageContentStorage.set(key, JSON.stringify(data));
    console.log(`💾 Cached page content: ${pageId}`);
  } catch (error) {
    console.error('Error caching page content:', error);
  }
};

/**
 * Load page content from cache
 */
export const loadPageContent = (
  bookId: string,
  pageId: string,
): any | null => {
  try {
    const key = getPageCacheKey(bookId, pageId);
    const cached = pageContentStorage.getString(key);
    
    if (!cached) {
      return null;
    }
    
    const data = JSON.parse(cached);
    console.log(`📂 Loaded page content from cache: ${pageId}`);
    return data.content;
  } catch (error) {
    console.error('Error loading page content:', error);
    return null;
  }
};

/**
 * Check if page content is cached
 */
export const isPageCached = (bookId: string, pageId: string): boolean => {
  const key = getPageCacheKey(bookId, pageId);
  return pageContentStorage.contains(key);
};

/**
 * Remove page content from cache
 */
export const removePageContent = (bookId: string, pageId: string): void => {
  try {
    const key = getPageCacheKey(bookId, pageId);
    pageContentStorage.delete(key);
    console.log(`🗑️ Removed page content from cache: ${pageId}`);
  } catch (error) {
    console.error('Error removing page content:', error);
  }
};

/**
 * Clear all page content for a book
 */
export const clearBookPageContent = (bookId: string): void => {
  try {
    const allKeys = pageContentStorage.getAllKeys();
    const bookKeys = allKeys.filter(key => key.startsWith(`page_${bookId}_`));
    
    bookKeys.forEach(key => pageContentStorage.delete(key));
    console.log(`🗑️ Cleared all page content for book: ${bookId} (${bookKeys.length} pages)`);
  } catch (error) {
    console.error('Error clearing book page content:', error);
  }
};

/**
 * Get cache stats
 */
export const getPageCacheStats = (bookId: string) => {
  try {
    const allKeys = pageContentStorage.getAllKeys();
    const bookKeys = allKeys.filter(key => key.startsWith(`page_${bookId}_`));
    
    return {
      totalPages: bookKeys.length,
      cacheKeys: bookKeys,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalPages: 0, cacheKeys: [] };
  }
};

/**
 * Clear old cached pages (older than X days)
 */
export const clearOldPageCache = (daysOld: number = 7): void => {
  try {
    const allKeys = pageContentStorage.getAllKeys();
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;
    
    let removedCount = 0;
    
    allKeys.forEach(key => {
      const cached = pageContentStorage.getString(key);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (now - data.cachedAt > maxAge) {
            pageContentStorage.delete(key);
            removedCount++;
          }
        } catch (e) {
          // Invalid data, remove it
          pageContentStorage.delete(key);
          removedCount++;
        }
      }
    });
    
    console.log(`🗑️ Cleared ${removedCount} old cached pages`);
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
};
