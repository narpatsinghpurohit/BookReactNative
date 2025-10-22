import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useBookTOC } from './hooks/useBookTOC';
import { usePageContent } from './hooks/usePageContent';
import { useBookNavigation } from './hooks/useBookNavigation';
import BookWebView from './components/BookWebView';
import Navigation from './components/Navigation';
import THEME from '@/theme/theme';
import { CustomText } from '@/components/CustomText';
import Icon from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';

type BookReaderScreenProps = NativeStackScreenProps<RootStackParamList, 'BookReader'>;

const BookReaderScreen: React.FC<BookReaderScreenProps> = ({ route, navigation }) => {
  const { bookId } = route.params;

  // Fetch TOC and build page sequence
  const { 
    bookData, 
    flatPageSequence, 
    isLoadingTOC, 
    tocError, 
    refetchTOC 
  } = useBookTOC(bookId);

  // Navigation state management
  const {
    currentPage,
    totalPages,
    progress,
    canGoNext,
    canGoPrevious,
    goToPage,
    nextPage,
    previousPage,
    handleTOCSelection,
  } = useBookNavigation({
    totalPages: flatPageSequence?.length || 0,
    initialPage: 1,
    flatPageSequence: flatPageSequence || [],
  });

  // Page content loading
  const {
    pageContent,
    isLoadingPage,
    pageError,
    retryPageLoad,
  } = usePageContent({
    bookId,
    currentPage,
    flatPageSequence: flatPageSequence || [],
    bookData,
  });

  // Loading state for initial TOC
  if (isLoadingTOC) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <CustomText style={styles.loadingText}>Loading book...</CustomText>
      </SafeAreaView>
    );
  }

  // Error state for TOC loading
  if (tocError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
        <Icon name="alert-circle-outline" size={64} color={THEME.colors.error} />
        <CustomText style={styles.errorText}>Error loading book</CustomText>
        <CustomText style={styles.errorDetail}>{tocError.message}</CustomText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            refetchTOC?.();
          }}
        >
          <CustomText style={styles.retryButtonText}>Retry</CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: THEME.colors.secondary }]}
          onPress={() => navigation.goBack()}
        >
          <CustomText style={[styles.retryButtonText, { color: THEME.colors.text.primary }]}>
            Go Back
          </CustomText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // No data state
  if (!bookData || !flatPageSequence) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
        <CustomText style={styles.errorText}>No book data available</CustomText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <CustomText style={styles.retryButtonText}>Go Back</CustomText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Handle page content errors
  const handlePageError = () => {
    Alert.alert(
      'Content Error',
      pageError?.message || 'Failed to load page content',
      [
        { text: 'Retry', onPress: retryPageLoad },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      
      {/* Main WebView Content Area */}
      <View style={styles.webViewContainer}>
        <BookWebView
          bookId={bookId}
          pageContent={pageContent}
          isLoading={isLoadingPage}
          onError={handlePageError}
          currentPage={currentPage}
          totalPages={totalPages}
          bookMetadata={bookData.bookMetadata}
          flatPageSequence={flatPageSequence}
          onTOCSelection={handleTOCSelection}
        />
      </View>

      {/* Bottom Navigation */}
      <Navigation
        currentPage={currentPage}
        totalPages={totalPages}
        progress={progress}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        onNext={nextPage}
        onPrevious={previousPage}
        onGoToPage={goToPage}
        isLoading={isLoadingPage}
      />
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
    padding: THEME.spacing.large,
    backgroundColor: THEME.colors.background,
  },
  webViewContainer: {
    flex: 1,
  },
  loadingText: {
    marginTop: THEME.spacing.regular,
    fontSize: THEME.typography.fontSize.regular,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
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
    textAlign: 'center',
  },
});

export default BookReaderScreen;