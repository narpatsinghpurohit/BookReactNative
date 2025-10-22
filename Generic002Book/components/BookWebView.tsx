import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import { BASE_HTML_TEMPLATE } from '../webview/baseTemplate';
import { renderPage } from '../utils/pageRenderer';
import { TransformedBookCache, FlatPageItem } from '../types/book.types';
import { parseWebViewMessage, createMessageHandler } from '../webview/messageHandlers';
import { usePageContent, needsContentFetch } from '../hooks/usePageContent';

interface BookWebViewProps {
  bookId: string;
  bookData: TransformedBookCache;
  currentPage: number;
  onNavigateToPage: (pageNumber: number) => void;
  onPageLoaded?: () => void;
}

const BookWebView: React.FC<BookWebViewProps> = ({
  bookId,
  bookData,
  currentPage,
  onNavigateToPage,
  onPageLoaded,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Get current page data
  const pageData = bookData.lookupMaps.pageByNumber[currentPage];

  // Fetch content if this is a ContentPage
  const {
    content,
    isLoading: isContentLoading,
    error: contentError,
  } = usePageContent(bookId, pageData);

  // Determine if we should wait for content
  const needsContent = needsContentFetch(pageData);
  const isPageReady = !needsContent || (!isContentLoading && (content || contentError));

  // Create message handler
  const messageHandler = useCallback(
    createMessageHandler({
      onWebViewReady: () => {
        setIsWebViewReady(true);
        setIsLoading(false);
      },
      onPageLoaded: () => {
        setIsLoading(false);
        onPageLoaded?.();
      },
      onNavigateToPage: (pageNumber) => {
        onNavigateToPage(pageNumber);
      },
      onWebViewError: (error) => {
        setIsLoading(false);
      },
    }),
    [onNavigateToPage, onPageLoaded]
  );

  // Handle messages from WebView
  const handleMessage = useCallback(
    (event: any) => {
      const message = parseWebViewMessage(event);
      if (message) {
        messageHandler(message);
      }
    },
    [messageHandler]
  );

  // Update page content when currentPage changes or content loads
  useEffect(() => {
    if (isWebViewReady && pageData && isPageReady && webViewRef.current) {
      setIsLoading(true);

      // Generate HTML for this page (with content if available)
      const pageHTML = renderPage(pageData, bookData, content || null);

      // Inject into WebView
      const script = `
        updatePageContent(${JSON.stringify(pageHTML)});
        true;
      `;

      webViewRef.current.injectJavaScript(script);
    }
  }, [currentPage, pageData, bookData, isWebViewReady, isPageReady, content]);

  // Show loading if no page data
  if (!pageData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9F6A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: BASE_HTML_TEMPLATE }}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        bounces={true}
        scalesPageToFit={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        onLoadEnd={() => {
        }}
        onError={(syntheticEvent) => {
          // const { nativeEvent } = syntheticEvent;
        }}
      />

      {/* Loading overlay */}
      {(isLoading || (needsContent && isContentLoading)) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF9F6A" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default BookWebView;
