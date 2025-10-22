import { useApi } from '@/hooks/useApi';
import { NestedGeneric002Structure } from '../types/book.types';

// Direct fetch function (async)
export const fetchBookTOC = async (bookId: string): Promise<NestedGeneric002Structure> => {
  try {
    const api = useApi();
    const response = await api.get(`/books/${bookId}/generate-pages`); // Changed to GET

    if (!response.data) {
      throw new Error('No TOC data received from server');
    }

    return response.data as NestedGeneric002Structure;
  } catch (error) {
    console.error('Error fetching book TOC:', error);
    throw error;
  }
};
