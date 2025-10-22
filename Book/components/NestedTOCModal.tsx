import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBookReader } from '../../../context/BookReaderContext';
import THEME from '../../../theme/theme';
import { Input } from '../../../components/Input/Input';
import type { Bookmark, BookPage } from '../../../types/book';
import { CustomText } from '@/components/CustomText';
import { Dropdown } from 'react-native-element-dropdown';

interface NestedTOCModalProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  handlePageSelect: (page: number) => void;
  bookmarks: Bookmark[];
}

type TabType = 'toc' | 'bookmarks';

interface TOCRenderItem {
  page: BookPage;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  shouldShow: boolean;
}

export const NestedTOCModal: React.FC<NestedTOCModalProps> = ({
  searchQuery,
  onSearchChange,
  onClose,
  handlePageSelect,
  bookmarks,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('toc');
  const [filter, setFilter] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const {
    pages,
    currentPage,
    isLoadingToc,
    nestedStructure,
    tocType,
  } = useBookReader();

  // Helper functions - defined before they're used
  const getItemLevel = useCallback((pageType: string): number => {
    switch (pageType) {
      case 'CoverPage':
      case 'BookSection':
      case 'Sthanam':
        return 1;
      case 'Chapter':
        return 2;
      case 'Section':
        return 3;
      default:
        return 1;
    }
  }, []);

  const hasChildrenItems = useCallback((page: BookPage, index: number): boolean => {
    if (page.pageType === 'CoverPage' || page.pageType === 'BookSection') {
      return false;
    }

    if (page.pageType === 'Sthanam') {
      return index < pages.length - 1 && pages[index + 1].pageType === 'Chapter';
    }

    if (page.pageType === 'Chapter') {
      return index < pages.length - 1 && pages[index + 1].pageType === 'Section';
    }

    return false;
  }, [pages]);

  const isItemExpanded = useCallback((page: BookPage): boolean => {
    if (page.pageType === 'Sthanam') {
      return expandedSections.includes(page.input.sthanamId || '');
    }
    if (page.pageType === 'Chapter') {
      return expandedSections.includes(page.input.chapterId || '');
    }
    return false;
  }, [expandedSections]);

  const shouldShowItem = useCallback((page: BookPage, index: number): boolean => {
    // Top level items are always shown
    if (page.pageType === 'CoverPage' || page.pageType === 'BookSection' || page.pageType === 'Sthanam') {
      return true;
    }

    // For chapters, check if parent sthanam is expanded
    if (page.pageType === 'Chapter') {
      for (let i = index - 1; i >= 0; i--) {
        if (pages[i].pageType === 'Sthanam') {
          return expandedSections.includes(pages[i].input.sthanamId || '');
        }
      }
    }

    // For sections, check if BOTH parent chapter AND grandparent sthanam are expanded
    if (page.pageType === 'Section') {
      let parentChapterExpanded = false;
      let grandparentSthanamExpanded = false;
      
      // Find parent chapter and check if it's expanded
      for (let i = index - 1; i >= 0; i--) {
        if (pages[i].pageType === 'Chapter') {
          parentChapterExpanded = expandedSections.includes(pages[i].input.chapterId || '');
          
          // Now find the grandparent sthanam of this chapter
          for (let j = i - 1; j >= 0; j--) {
            if (pages[j].pageType === 'Sthanam') {
              grandparentSthanamExpanded = expandedSections.includes(pages[j].input.sthanamId || '');
              break;
            }
          }
          break;
        }
      }
      
      // Section is only visible if both parent chapter and grandparent sthanam are expanded
      return parentChapterExpanded && grandparentSthanamExpanded;
    }

    return true;
  }, [pages, expandedSections]);

  // Generate TOC items from nested structure or fall back to legacy pages
  const tocItems = useMemo(() => {
    if (!pages || pages.length === 0) return [];

    return pages.map((page, index) => {
      const level = getItemLevel(page.pageType);
      const hasChildren = hasChildrenItems(page, index);
      const isExpanded = isItemExpanded(page);
      const shouldShow = shouldShowItem(page, index);

      return {
        page,
        level,
        hasChildren,
        isExpanded,
        shouldShow,
      };
    });
  }, [pages, expandedSections, getItemLevel, hasChildrenItems, isItemExpanded, shouldShowItem]);

  // Filter TOC items based on search query
  const filteredTocItems = useMemo(() => {
    if (!searchQuery.trim()) return tocItems;

    const query = searchQuery.toLowerCase();
    const matchingItems = tocItems.filter(item =>
      item.page.tocHeader?.toLowerCase().includes(query) ||
      item.page.sthanam?.toLowerCase().includes(query) ||
      item.page.chapter?.toLowerCase().includes(query) ||
      item.page.shlokaRange?.toLowerCase().includes(query)
    );

    // Include parent items for context
    const itemsWithParents = new Set<number>();
    matchingItems.forEach(item => {
      itemsWithParents.add(item.page.page);
      // Add parent items for hierarchy context
      // This is a simplified version - you might want to enhance this logic
      for (let i = 0; i < tocItems.length; i++) {
        if (tocItems[i].page.page === item.page.page) {
          // Add preceding items with lower levels (parents)
          for (let j = i - 1; j >= 0; j--) {
            if (tocItems[j].level < item.level) {
              itemsWithParents.add(tocItems[j].page.page);
              break;
            }
          }
          break;
        }
      }
    });

    return tocItems.filter(item => itemsWithParents.has(item.page.page));
  }, [tocItems, searchQuery]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedSections(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  }, []);

  const handlePress = useCallback((page: BookPage) => {
    onClose();
    handlePageSelect(page.page);
  }, [onClose, handlePageSelect]);

  const handleToggle = useCallback((page: BookPage) => {
    if (page.pageType === 'Sthanam') {
      toggleExpanded(page.input.sthanamId || '');
    } else if (page.pageType === 'Chapter') {
      toggleExpanded(page.input.chapterId || '');
    }
  }, [toggleExpanded]);

  const renderTOCItem = ({ item }: { item: TOCRenderItem }) => {
    if (!item.shouldShow) return null;

    const { page, level, hasChildren, isExpanded } = item;
    const isSelected = currentPage === page.page;

    return (
      <TouchableOpacity
        onPress={() => handlePress(page)}
        style={[
          styles.tocItem,
          { paddingLeft: (level - 1) * 20 + 16 },
          isSelected && styles.selectedItem,
        ]}>
        <View style={styles.tocItemContent}>
          <TouchableOpacity
            onPress={() => handleToggle(page)}
            style={styles.expandButton}
            disabled={!hasChildren}>
            {hasChildren && (
              <Icon
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color={THEME.colors.text.primary}
              />
            )}
          </TouchableOpacity>
          <View style={styles.tocItemTextContainer}>
            <CustomText
              style={[
                styles.tocItemText,
                isSelected && styles.selectedText,
                level === 1 && styles.levelOneText,
                level === 2 && styles.levelTwoText,
                level === 3 && styles.levelThreeText,
              ]}
              numberOfLines={1}>
              {page.tocHeader}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredBookmarks = useMemo(() => {
    return filter === 'all'
      ? bookmarks
      : bookmarks.filter(bookmark => bookmark.type === filter);
  }, [bookmarks, filter]);

  const getColorForType = (type: string) => {
    switch (type) {
      case 'simple':
        return THEME.colors.success;
      case 'important':
        return THEME.colors.warning;
      case 'quickreference':
        return THEME.colors.info;
      default:
        return THEME.colors.text.secondary;
    }
  };

  // Auto-expand sections based on current page
  React.useEffect(() => {
    if (nestedStructure && currentPage) {
      const currentPageData = pages.find(p => p.page === currentPage);
      if (currentPageData) {
        const toExpand: string[] = [];
        
        if (currentPageData.pageType === 'Section') {
          // Expand parent chapter and sthanam
          if (currentPageData.input.chapterId) {
            toExpand.push(currentPageData.input.chapterId);
          }
          if (currentPageData.input.sthanamId) {
            toExpand.push(currentPageData.input.sthanamId);
          }
        } else if (currentPageData.pageType === 'Chapter') {
          // Expand parent sthanam
          if (currentPageData.input.sthanamId) {
            toExpand.push(currentPageData.input.sthanamId);
          }
        }
        
        setExpandedSections(prev => [...new Set([...prev, ...toExpand])]);
      }
    }
  }, [nestedStructure, currentPage, pages]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'toc' && styles.activeTab]}
            onPress={() => setActiveTab('toc')}>
            <Icon
              name="menu-outline"
              size={20}
              color={
                activeTab === 'toc'
                  ? THEME.colors.primary
                  : THEME.colors.text.secondary
              }
            />
            <CustomText
              style={[
                styles.tabText,
                activeTab === 'toc' && styles.activeTabText,
              ]}>
              Contents
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bookmarks' && styles.activeTab]}
            onPress={() => setActiveTab('bookmarks')}>
            <Icon
              name="bookmarks-outline"
              size={20}
              color={
                activeTab === 'bookmarks'
                  ? THEME.colors.primary
                  : THEME.colors.text.secondary
              }
            />
            <CustomText
              style={[
                styles.tabText,
                activeTab === 'bookmarks' && styles.activeTabText,
              ]}>
              Bookmarks
            </CustomText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={THEME.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {activeTab === 'toc' && (
        <View style={styles.searchContainer}>
          <Input
            label=""
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search..."
            style={styles.searchInput}
          />
        </View>
      )}

      {activeTab === 'bookmarks' && (
        <View style={styles.filterContainer}>
          <View style={styles.filterWrapper}>
            <Dropdown
              style={styles.dropdown}
              data={[
                { label: 'All', value: 'all' },
                { label: 'Simple', value: 'simple' },
                { label: 'Important', value: 'important' },
                { label: 'Quick Ref.', value: 'quickreference' },
              ]}
              labelField="label"
              valueField="value"
              placeholder="Select bookmark type"
              value={filter}
              onChange={item => setFilter(item.value)}
            />
          </View>
        </View>
      )}

      {isLoadingToc ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      ) : activeTab === 'toc' ? (
        <FlatList
          data={filteredTocItems}
          keyExtractor={item => item.page.page.toString()}
          renderItem={renderTOCItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filteredBookmarks}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookmarkItem}
              onPress={() => {
                handlePageSelect(item.pageNumber);
                onClose();
              }}>
              <View style={styles.bookmarkContent}>
                <View style={styles.bookmarkHeader}>
                  <CustomText style={styles.bookmarkPage}>
                    Page {item.pageNumber}
                  </CustomText>
                  <CustomText
                    style={[
                      styles.bookmarkType,
                      {
                        color: THEME.colors.text.light,
                        backgroundColor: getColorForType(item.type),
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 16,
                      },
                    ]}>
                    {item.type}
                  </CustomText>
                </View>
                <CustomText style={styles.bookmarkTitle}>
                  {item.notes}
                </CustomText>
                <CustomText style={styles.bookmarkDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </CustomText>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <CustomText style={styles.emptyText}>No bookmarks yet</CustomText>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  tabContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: THEME.spacing.small,
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.small,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: THEME.colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: THEME.colors.text.secondary,
    fontFamily: THEME.typography.fontFamily.medium,
  },
  activeTabText: {
    color: THEME.colors.primary,
  },
  closeButton: {
    padding: THEME.spacing.small,
    marginLeft: THEME.spacing.medium,
    marginRight: THEME.spacing.tiny,
  },
  searchContainer: {
    paddingHorizontal: THEME.spacing.medium,
  },
  searchInput: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 24,
    paddingHorizontal: THEME.spacing.medium,
    paddingVertical: THEME.spacing.small,
    fontSize: 16,
    color: THEME.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tocItem: {
    minHeight: 32,
    justifyContent: 'center',
    paddingRight: THEME.spacing.regular,
    paddingVertical: THEME.spacing.small,
  },
  selectedItem: {
    backgroundColor: THEME.colors.selected,
  },
  tocItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tocItemTextContainer: {
    flex: 1,
    paddingLeft: THEME.spacing.small,
  },
  tocItemText: {
    fontSize: 15,
    color: THEME.colors.text.primary,
  },
  selectedText: {
    color: THEME.colors.primary,
    fontWeight: '500',
  },
  levelOneText: {
    fontSize: 17,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  levelTwoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  levelThreeText: {
    fontSize: 15,
    color: THEME.colors.text.primary,
  },
  chapterNumber: {
    color: THEME.colors.text.secondary,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 12,
    color: THEME.colors.text.secondary,
    marginTop: 2,
  },
  pageNumber: {
    fontSize: 12,
    color: THEME.colors.text.secondary,
    marginTop: 2,
  },
  // Bookmark styles
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: THEME.spacing.medium,
    marginVertical: THEME.spacing.small,
  },
  filterWrapper: {
    width: '50%',
  },
  dropdown: {
    height: 30,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: THEME.colors.background,
  },
  bookmarkItem: {
    paddingHorizontal: THEME.spacing.medium,
    paddingVertical: THEME.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  bookmarkContent: {
    gap: THEME.spacing.small,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookmarkPage: {
    fontSize: 14,
    color: THEME.colors.primary,
    fontFamily: THEME.typography.fontFamily.medium,
  },
  bookmarkType: {
    fontSize: 12,
    color: THEME.colors.text.secondary,
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  bookmarkTitle: {
    fontSize: 16,
    color: THEME.colors.text.primary,
    fontFamily: THEME.typography.fontFamily.regular,
  },
  bookmarkDate: {
    fontSize: 12,
    color: THEME.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.large,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
}); 