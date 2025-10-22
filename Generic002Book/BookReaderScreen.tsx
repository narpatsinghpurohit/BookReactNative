import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useBookTOC } from './hooks/useBookTOC';
import { useBookNavigation } from './hooks/useBookNavigation';
import { usePrefetchPages } from './hooks/usePrefetchPages'; // ← ADD THIS
import BookWebView from './components/BookWebView';
import Icon from 'react-native-vector-icons/Ionicons';
import THEME from '@/theme/theme';

type BookReaderScreenProps = NativeStackScreenProps<RootStackParamList, 'BookReader'>;

const BookReaderScreen: React.FC<BookReaderScreenProps> = ({ route, navigation }) => {
  const { bookId } = route.params;

  // Fetch TOC data
  const { bookData, isLoading, error } = useBookTOC(bookId);

  // Navigation state
  const {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
    progress,
  } = useBookNavigation({
    totalPages: bookData?.totalPages || 0,
    initialPage: 1,
  });

  // ← ADD THIS: Prefetch next pages in background
  usePrefetchPages({
    bookId,
    bookData: bookData || null,
    currentPage,
    prefetchCount: 2, // Prefetch next 2 pages
  });

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading book...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Icon name="alert-circle-outline" size={64} color={THEME.colors.error} />
        <Text style={styles.errorText}>Error loading book</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // No data state
  if (!bookData) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Text style={styles.errorText}>No book data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* WebView displaying book content */}
      <View style={styles.webViewContainer}>
        <BookWebView
          bookId={bookId} // ← ADD THIS PROP
          bookData={bookData}
          currentPage={currentPage}
          onNavigateToPage={goToPage}
          onPageLoaded={() => {
            
          }}
        />
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {/* Navigation Controls */}
        <View style={styles.controlsContainer}>
          {/* Previous Button */}
          <TouchableOpacity
            style={[
              styles.navButton,
              !canGoPrevious && styles.navButtonDisabled,
            ]}
            onPress={previousPage}
            disabled={!canGoPrevious}
          >
            <Icon
              name="chevron-back"
              size={24}
              color={canGoPrevious ? THEME.colors.primary : THEME.colors.disabled}
            />
            <Text
              style={[
                styles.navButtonText,
                !canGoPrevious && styles.navButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {/* Page Indicator */}
          <View style={styles.pageIndicator}>
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.navButton,
              !canGoNext && styles.navButtonDisabled,
            ]}
            onPress={nextPage}
            disabled={!canGoNext}
          >
            <Text
              style={[
                styles.navButtonText,
                !canGoNext && styles.navButtonTextDisabled,
              ]}
            >
              Next
            </Text>
            <Icon
              name="chevron-forward"
              size={24}
              color={canGoNext ? THEME.colors.primary : THEME.colors.disabled}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.medium,
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: THEME.spacing.regular,
    fontSize: THEME.typography.fontSize.regular,
    color: THEME.colors.text.secondary,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.large,
    color: THEME.colors.error,
    fontWeight: 'bold',
    marginTop: THEME.spacing.regular,
    textAlign: 'center',
  },
  errorDetail: {
    marginTop: THEME.spacing.small,
    fontSize: THEME.typography.fontSize.small,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: THEME.spacing.large,
    paddingVertical: THEME.spacing.regular,
    paddingHorizontal: THEME.spacing.large,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.regular,
  },
  retryButtonText: {
    fontSize: THEME.typography.fontSize.regular,
    color: THEME.colors.text.light,
    fontWeight: '600',
  },
  webViewContainer: {
    flex: 1,
  },
  bottomBar: {
    backgroundColor: THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingBottom: THEME.spacing.small,
    ...THEME.shadows.medium,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: THEME.colors.secondary,
  },
  progressBar: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.regular,
    paddingVertical: THEME.spacing.regular,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.small,
    paddingHorizontal: THEME.spacing.regular,
    borderRadius: THEME.borderRadius.small,
    backgroundColor: THEME.colors.secondary,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: THEME.typography.fontSize.small,
    color: THEME.colors.primary,
    fontWeight: '600',
    marginHorizontal: THEME.spacing.tiny,
  },
  navButtonTextDisabled: {
    color: THEME.colors.disabled,
  },
  pageIndicator: {
    alignItems: 'center',
  },
  pageText: {
    fontSize: THEME.typography.fontSize.regular,
    color: THEME.colors.text.primary,
    fontWeight: '600',
  },
  progressText: {
    fontSize: THEME.typography.fontSize.small,
    color: THEME.colors.text.secondary,
    marginTop: THEME.spacing.tiny,
  },
});

export default BookReaderScreen;
