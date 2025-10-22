import { useApi } from "@/hooks/useApi";
import { FlatPageItem, PageApiPayload, PageType } from "../types/book.types";

/**
 * EditorJS content structure
 */
export interface EditorJSContent {
  time?: number;
  blocks: EditorJSBlock[];
  version?: string;
}

export interface EditorJSBlock {
  id?: string;
  type: string;
  data: any;
}

/**
 * Fetch page content using PageType API (API 2)
 */
export const fetchPageContentByType = async (
  bookId: string,
  payload: PageApiPayload
): Promise<EditorJSContent> => {
  try {
    const api = useApi();
    const response = await api.post(`/books/${bookId}/page`, {
      params: payload
    }); 

    if (!response.data) {
      throw new Error('No content received from server');
    }

    return response.data as EditorJSContent;
  } catch (error) {
    console.error('Error fetching page content by type:', error);
    throw error;
  }
};

/**
 * Fetch page content from direct URL (editorJsPageUrl)
 */
export const fetchPageContentFromURL = async (
  url: string,
): Promise<EditorJSContent> => {
  try {
    console.log('📥 Fetching page content from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Content fetched from URL');
    return data as EditorJSContent;
  } catch (error) {
    console.error('Error fetching page content from URL:', error);
    throw error;
  }
};

/**
 * Fetch page content - tries direct URL first, falls back to API 2
 */
export const fetchPageContent = async (
  bookId: string,
  page:FlatPageItem
): Promise<EditorJSContent> => {
  try {
    const payload = {
      page: page.page,
      pageType: page.pageType as PageType,
      input: {
        bookid: bookId,
        sthanamNumber: page.sthanamNumber,
        sthanamId: page.sthanamId,
        chapterId: page.chapterId,
        sectionNumber: page.sectionNumber
      }
    }

    try {
      return await fetchPageContentByType(bookId, payload);
    } catch (error) {
      console.warn('Failed to fetch from API 2');
      throw error;
    }

    throw new Error('No valid content URL or API parameters available');
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw error;
  }
};

/**
 * Validate EditorJS content structure
 */
export const validateEditorJSContent = (content: any): content is EditorJSContent => {
  if (!content) return false;
  if (!Array.isArray(content.blocks)) return false;
  return true;
};
