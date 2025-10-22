import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import { Animated } from 'react-native';
import { useBookReader } from '../../context/BookReaderContext';
import { bookmarkService } from '@/services/bookmark.service';
import { Bookmark, BookmarkPayload, BookPage } from '@/types/book';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useChatSession } from '@/context/ChatSessionContext';

export const useBookAndPages = (modalWidth: number) => {
  const route = useRoute<RouteProp<RootStackParamList, 'TableOfContents'>>();
  const {
    toc: contextToc,
    pages,
    currentPage,
    expandedSections,
    toggleSection,
    initializeBook,
    selectPage,
    setShowChat,
    showChat,
    isLoadingPage,
    currentPageDetails,
  } = useBookReader();
  const {clearChat} = useChatSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-modalWidth)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [initialNoteText, setInitialNoteText] = useState('');

  // Add ref for debouncing last read position updates
  const lastReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: bookmarks = [],
    isLoading: bookmarksLoading,
    error: bookmarksError,
    refetch: refetchBookmarks,
  } = useQuery<Bookmark[]>({
    queryKey: ['bookmarks', route.params.bookId],
    queryFn: () =>
      route.params.bookId
        ? bookmarkService.getBookmarks(route.params.bookId)
        : [],
  });

  const addBookmarkMutation = useMutation({
    mutationFn: (bookmark: BookmarkPayload) =>
      bookmarkService.addBookmark(bookmark),
    onSuccess: () => {
      refetchBookmarks();
    },
    onError: (error: any) => {
      console.error('Error adding bookmark:', error);
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (bookmarkId: string) =>
      bookmarkService.removeBookmark(bookmarkId),
    onSuccess: () => {
      refetchBookmarks();
    },
    onError: (error: any) => {
      console.error('Error removing bookmark:', error);
    },
  });

  const handleAddBookmark = async (bookmark: BookmarkPayload) => {
    return addBookmarkMutation.mutateAsync(bookmark);
  };

  const handleRemoveBookmark = async () => {
    if (!currentPage || !route.params.bookId) return;

    const bookmark = bookmarks.find(
      b => b.pageNumber === currentPage && b.bookId === route.params.bookId,
    );

    if (bookmark) {
      return removeBookmarkMutation.mutateAsync(bookmark._id);
    }
  };

  const isPageBookmarked = useMemo(() => {
    if (!pages) return false;
    return bookmarks.some(bookmark => bookmark.pageNumber === currentPage);
  }, [currentPage, bookmarks]);


  useEffect(() => {
    if (route.params.bookId) {
      initializeBook(route.params.bookId, route.params.pageData);
    }
  }, [route.params.bookId]);

  useEffect(() => {
    if (contextToc.length > 0 && expandedSections.length === 0) {
      const level1Indices = contextToc.reduce(
        (indices: number[], item, index) => {
          if (item.level === 1) {
            indices.push(index);
          }
          return indices;
        },
        [],
      );
      level1Indices.forEach(index => toggleSection(index));
    }
  }, [contextToc, expandedSections, toggleSection]);

  const lastReadPositionMutation = useMutation({
    mutationFn: (params: {
      bookId: string;
      totalBookPages: number;
      pageData: any;
      subscriptionId: string;
    }) => bookmarkService.lastReadPosition(params),
    onSuccess: () => {
    },
  });

  const handlePageSelect = async (pageData: BookPage) => {
    if (pageData) {
      await selectPage(pageData);
      clearChat();
      trackLastReadPosition(pageData);
    }
  };

  const trackLastReadPosition = (pageData: BookPage) => {
    // Clear any existing timeout to prevent multiple API calls
    if (lastReadTimeoutRef.current) {
      clearTimeout(lastReadTimeoutRef.current);
    }

    // Debounce the last read position update to avoid excessive API calls
    lastReadTimeoutRef.current = setTimeout(() => {
      lastReadPositionMutation.mutate({
        bookId: route.params.bookId,
        totalBookPages: contextToc.length,
        pageData,
        subscriptionId: route.params.planId || '',
      });
    }, 1000);
  };

  const handleDrawerSlide = useCallback(
    (dx: number) => {
      const newPosition = Math.min(0, -modalWidth + dx);
      slideAnim.setValue(newPosition);
    },
    [modalWidth, slideAnim],
  );

  const toggleModal = useCallback(
    (visible: boolean, velocity = 0) => {
      if (isAnimating) return;

      if (visible) {
        setIsModalVisible(true);
      }

      setIsAnimating(true);
      Animated.spring(slideAnim, {
        toValue: visible ? 0 : -modalWidth,
        useNativeDriver: true,
        tension: 50,
        friction: 10,
        velocity: velocity,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }).start(({ finished }) => {
        setIsAnimating(false);
        if (finished && !visible) {
          setIsModalVisible(false);
        }
      });
    },
    [slideAnim, modalWidth, isAnimating],
  );

  const handleSaveNote = useCallback(
    (note: string, shlokaFrom: number, shlokaTo: number | null) => {
      try {
        bookmarkService.addNote({
          bookId: route.params.bookId,
          notes: note,
          category: 'note',
          pageData: currentPageDetails!,
          isShlokaSamuha: true,
          shlokaFrom: shlokaFrom,
          shlokaTo: shlokaTo,
        });

        setIsNoteModalVisible(false);
      } catch (error) {
        console.error('Error saving note:', error);
      }
    },
    [],
  );

  const handleCloseNoteModal = useCallback(() => {
    setIsNoteModalVisible(false);
    setInitialNoteText('');
  }, []);

  const handleOpenNoteModal = useCallback(() => {
    setIsNoteModalVisible(true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (lastReadTimeoutRef.current) {
        clearTimeout(lastReadTimeoutRef.current);
      }
    };
  }, []);

  return {
    isLoadingPage,
    searchQuery,
    isModalVisible,
    slideAnim,
    expandedSections,
    handlePageSelect,
    toggleModal,
    setSearchQuery,
    toggleSection,
    showChat,
    setShowChat,
    handleAddBookmark,
    handleRemoveBookmark,
    isPageBookmarked,
    handleDrawerSlide,
    bookmarks,
    isNoteModalVisible,
    handleSaveNote,
    handleCloseNoteModal,
    handleOpenNoteModal,
    initialNoteText,
  };
};
