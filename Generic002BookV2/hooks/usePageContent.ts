import { useState, useEffect } from 'react';
import { fetchPageContent, editorJSToHTML } from '../services/pageApi';
import {
  generateCoverPageHTML,
  generateTOCHTML,
  generateStructurePageHTML,
  generateContentPageHTML,
  generateErrorPageHTML,
} from '../services/templates/webviewTemplates';
import {
  TransformedBookData,
  FlatPageItem,
  PageType,
  TOCNavigationItem,
  WebViewContentData,
  PageApiPayload,
} from '../types/book.types';
import { getPageByNumber } from '../services/transformTOC';

interface UsePageContentProps {
  bookId: string;
  currentPage: number;
  bookData: TransformedBookData | null;
  tocItems: TOCNavigationItem[];
}

interface UsePageContentReturn {
  webViewContent: WebViewContentData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to generate WebView content based on current page
 * Handles different page types and content fetching
 */
export const usePageContent = ({
  bookId,
  currentPage,
  bookData,
  tocItems,
}: UsePageContentProps): UsePageContentReturn => {
  const [webViewContent, setWebViewContent] = useState<WebViewContentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!bookData) {
      setWebViewContent(null);
      return;
    }

    const generateContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const pageData = getPageByNumber(bookData, currentPage);
        if (!pageData) {
          throw new Error(`Page ${currentPage} not found`);
        }

        let htmlContent: string;

        switch (pageData.pageType) {
          case PageType.CoverPage:
            // Generate cover page from book metadata
            htmlContent = generateCoverPageHTML(pageData, bookData.bookMetadata);
            break;

          case PageType.TOC:
            // Generate TOC from navigation items
            htmlContent = generateTOCHTML(tocItems);
            break;

          case PageType.BookSection:
          case PageType.Sthanam:
          case PageType.Chapter:
            // Generate structure page from description
            htmlContent = generateStructurePageHTML(pageData);
            break;

          case PageType.Section:
            // Fetch content from API and generate content page
            if (pageData.pageId) {
              const payload: PageApiPayload = {
                page: pageData.page,
                pageType: pageData.pageType,
                input: {
                  bookid: bookId,
                  sthanamNumber: pageData.sthanamNumber,
                  sthanamId: pageData.sthanamId,
                  chapterId: pageData.chapterId,
                  sectionNumber: pageData.sectionNumber,
                  sectionId: pageData.sectionId,
                },
              };

              const editorJSContent = await fetchPageContent(bookId, payload);
              const editorJSHTML = editorJSToHTML(editorJSContent);
              htmlContent = generateContentPageHTML(pageData, editorJSHTML);
            } else {
              // Fallback to structure page if no pageId
              htmlContent = generateStructurePageHTML(pageData);
            }
            break;

          default:
            throw new Error(`Unknown page type: ${pageData.pageType}`);
        }

        setWebViewContent({
          pageType: pageData.pageType,
          content: htmlContent,
          pageNumber: currentPage,
          totalPages: bookData.totalPages,
        });

      } catch (err) {
        console.error('Error generating page content:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(err instanceof Error ? err : new Error(errorMessage));
        
        // Generate error page HTML
        const errorHTML = generateErrorPageHTML(errorMessage);
        setWebViewContent({
          pageType: PageType.CoverPage, // Default type for error
          content: errorHTML,
          pageNumber: currentPage,
          totalPages: bookData?.totalPages || 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateContent();
  }, [bookId, currentPage, bookData, tocItems]);

  return {
    webViewContent,
    isLoading,
    error,
  };
};