import React from 'react';
import { useBookReader } from '../../../context/BookReaderContext';
import { TOCModal } from './TOCModal';
import { NestedTOCModal } from './NestedTOCModal';
import type { Bookmark } from '../../../types/book';

interface TOCModalWrapperProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  handlePageSelect: (page: number) => void;
  bookmarks: Bookmark[];
}

/**
 * Wrapper component that automatically chooses between legacy and nested TOC components
 * based on the book's structure type.
 */
export const TOCModalWrapper: React.FC<TOCModalWrapperProps> = (props) => {
  const { tocType } = useBookReader();

  // Use nested TOC for nested structure books, legacy TOC for others
  if (tocType === 'nested') {
    return <NestedTOCModal {...props} />;
  }

  return <TOCModal {...props} />;
}; 