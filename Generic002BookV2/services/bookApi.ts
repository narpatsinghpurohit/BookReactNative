import { NestedGeneric002Structure } from '../types/book.types';

/**
 * Fetch book table of contents from generate-pages API
 * This API is called ONCE on screen mount to build the page sequence
 */
export const fetchBookTOC = async (bookId: string): Promise<NestedGeneric002Structure> => {
  try {
    // Using fetch directly for simplicity (no useApi hook dependency)
    const response = await fetch(`/api/books/${bookId}/generate-pages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data) {
      throw new Error('No TOC data received from server');
    }

    return data as NestedGeneric002Structure;
  } catch (error) {
    console.error('Error fetching book TOC:', error);
    throw error;
  }
};

/**
 * Validate TOC response structure
 */
export const validateTOCResponse = (data: any): data is NestedGeneric002Structure => {
  if (!data || typeof data !== 'object') return false;
  if (!data.title || !data.author || !data.publisher) return false;
  if (!Array.isArray(data.sthanams)) return false;
  if (data.tocType !== 'nested-generic-002') return false;
  return true;
};