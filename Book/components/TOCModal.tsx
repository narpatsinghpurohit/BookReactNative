import React, {useState} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useBookReader} from '../../../context/BookReaderContext';
import THEME from '../../../theme/theme';
import {Input} from '../../../components/Input/Input';
import type {TableOfContents, Bookmark} from '../../../types/book';
import {CustomText} from '@/components/CustomText';
import TOCItem from './TOCItem';
import {Dropdown} from 'react-native-element-dropdown';

interface TOCModalProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  handlePageSelect: (page: number) => void;
  bookmarks: Bookmark[];
}

type TabType = 'toc' | 'bookmarks';

export const TOCModal: React.FC<TOCModalProps> = ({
  searchQuery,
  onSearchChange,
  onClose,
  handlePageSelect,
  bookmarks,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('toc');
  const [filter, setFilter] = useState<string>('all');

  const {
    toc,
    pages,
    currentPage,
    expandedSections,
    toggleSection,
    isLoadingToc,
  } = useBookReader();

  const getVisibleItems = () => {
    if (!toc.length) return [];

    if (searchQuery) {
      const matchingItems = toc.filter(item => {
        // Search in header
        const headerMatch = item.header
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        // Search in title if it exists
        const titleMatch = item.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        // Return true if either header or title matches
        return headerMatch || titleMatch;
      });

      const itemsWithParents = new Set<number>();
      matchingItems.forEach(item => {
        itemsWithParents.add(item.page);

        let currentLevel = item.level;
        for (let i = toc.indexOf(item); i >= 0; i--) {
          if (toc[i].level < currentLevel) {
            itemsWithParents.add(toc[i].page);
            currentLevel = toc[i].level;
            if (currentLevel === 1) break;
          }
        }
      });

      return toc.filter(item => itemsWithParents.has(item.page));
    }

    return toc.filter((item, index) => {
      if (item.level === 1) return true;

      let parentIndex = -1;
      for (let i = index - 1; i >= 0; i--) {
        if (toc[i].level < item.level) {
          parentIndex = i;
          break;
        }
      }

      if (parentIndex === -1) return false;
      return expandedSections.includes(parentIndex);
    });
  };

  const findOriginalIndex = (item: TableOfContents) => {
    return toc.findIndex(i => i.page === item.page);
  };

  const hasChildren = (item: TableOfContents) => {
    const index = findOriginalIndex(item);
    if (index === -1 || index === toc.length - 1) return false;
    return toc[index + 1].level > item.level;
  };

  const handlePress = (item: TableOfContents) => {
    const pageData = pages.find(p => p.page === item.page);
    if (pageData) {
      onClose();
      handlePageSelect(item.page);
    }
  };

  const handleToggle = (item: TableOfContents) => {
    const originalIndex = findOriginalIndex(item);
    if (originalIndex !== -1) {
      toggleSection(originalIndex);
    }
  };

  const visibleItems = getVisibleItems();

  const filteredBookmarks =
    filter === 'all'
      ? bookmarks
      : bookmarks.filter(bookmark => bookmark.type === filter);

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
                {label: 'All', value: 'all'},
                {label: 'Simple', value: 'simple'},
                {label: 'Important', value: 'important'},
                {label: 'Quick Ref.', value: 'quickreference'},
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
          data={visibleItems}
          keyExtractor={item => item.page.toString()}
          renderItem={({item}) => {
            
            return(
            <TOCItem
              item={item}
              onPress={() => handlePress(item)}
              isExpanded={expandedSections.includes(findOriginalIndex(item))}
              onToggle={() => handleToggle(item)}
              isSelected={currentPage === item.page}
              hasChildren={hasChildren(item)}
            />
          )}}
        />
      ) : (
        <FlatList
          data={filteredBookmarks}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
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
  dropdown: {
    height: 30,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: THEME.colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: THEME.spacing.medium,
    marginVertical: THEME.spacing.small,
  },
  filterWrapper: {
    width: '50%',
  },
});
