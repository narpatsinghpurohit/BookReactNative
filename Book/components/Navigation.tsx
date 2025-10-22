import React, { useMemo } from 'react';
import {View, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import THEME from '../../../theme/theme';
import {CustomText} from '@/components/CustomText';
import {useBookReader} from '@/context/BookReaderContext';
import { BookPage } from '@/types/book';

interface NavigationProps {
  onPreviousPage: (pageData: BookPage) => void;
  onNextPage: (pageData: BookPage) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  onPreviousPage,
  onNextPage
}) => {
  const {currentPage, pageContent, toc, getPageByNumber, getTocIndex} = useBookReader();
  

  // 🆕 Memoize navigation data to avoid recalculation
  const navigationData = useMemo(() => {
    if (!currentPage) return { currentIndex: -1, prevPage: null, nextPage: null };
    const currentIndex = getTocIndex(currentPage); // 🆕 O(1) lookup
    
    const prevPage = currentIndex > 0 ? toc[currentIndex - 1] : null;
    let nextPageTocItem = currentIndex < toc.length - 1 ? toc[currentIndex + 1] : null;
    if(nextPageTocItem){
      if(nextPageTocItem?.isActive === false){
          nextPageTocItem = null;
      }
    }
    const nextPage = nextPageTocItem;
    
    return { currentIndex, prevPage, nextPage };
  }, [currentPage, toc, getTocIndex]);

  const { currentIndex, prevPage, nextPage } = navigationData;

  // 🆕 Optimized navigation handlers
  const handlePreviousPage = () => {
    if (pageContent?.bookType !== 'generic') {
      if (prevPage) {
        const pageData = getPageByNumber(prevPage.page); // 🆕 O(1) lookup
        if (pageData) {
          onPreviousPage(pageData);
        }
      }
    } else {
      const pageData = getPageByNumber(toc[currentIndex].page - 1); // 🆕 O(1) lookup
      if (pageData) {
        onPreviousPage(pageData);
      }
    }
  };

  const handleNextPage = () => {
    if (pageContent?.bookType !== 'generic') {
      if (nextPage) {
        const pageData = getPageByNumber(nextPage.page); // 🆕 O(1) lookup
        if (pageData) {
          onNextPage(pageData);
        }
      }
    } else {
      const pageData = getPageByNumber(toc[currentIndex].page + 1); // 🆕 O(1) lookup
      if (pageData) {
        onNextPage(pageData);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationPill}>
        {/* Page Navigation */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePreviousPage}
          disabled={!prevPage}
          activeOpacity={0.7}>
          <Icon
            name="chevron-back-outline"
            size={20}
            color={!prevPage ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.8)'}
          />
        </TouchableOpacity>

        <View style={styles.navigationInfo}>
          <CustomText style={styles.pageText}>
            Page {String(currentIndex + 1)}
            <CustomText style={styles.totalText}>/{toc.length}</CustomText>
          </CustomText>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNextPage}
          disabled={!nextPage}
          activeOpacity={0.7}>
          <Icon
            name="chevron-forward-outline"
            size={20}
            color={!nextPage ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.8)'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  navigationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: THEME.spacing.medium,
    gap: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: THEME.colors.secondary,
  },
  navigationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pageText: {
    fontSize: 15,
    color: THEME.colors.text.primary,
    fontFamily: THEME.typography.fontFamily.regular,
    textAlign: 'center',
    minWidth: 80,
  },
  totalText: {
    color: THEME.colors.text.secondary,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: THEME.colors.secondary,
    marginHorizontal: 4,
  },
  shlokaNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  shlokaNavButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: THEME.colors.secondary,
  },
  shlokaText: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.8)',
    fontFamily: THEME.typography.fontFamily.regular,
    minWidth: 60,
    textAlign: 'center',
  },
});
