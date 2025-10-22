import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { WebViewContentData } from '../types/book.types';

interface BookWebViewProps {
  webViewContent: WebViewContentData | null;
  onNavigateToPage?: (pageNumber: number) => void;
  onRetry?: () => void;
  onPageLoaded?: () => void;
}

/**
 * WebView component for rendering all book content
 * Handles message communication from WebView to React Native
 */
export const BookWebView: React.FC<BookWebViewProps> = ({
  webViewContent,
  onNavigateToPage,
  onRetry,
  onPageLoaded,
}) => {
  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'NAVIGATE_TO_PAGE':
          if (onNavigateToPage && typeof message.pageNumber === 'number') {
            onNavigateToPage(message.pageNumber);
          }
          break;
        
        case 'RETRY':
          if (onRetry) {
            onRetry();
          }
          break;
        
        case 'PAGE_LOADED':
          if (onPageLoaded) {
            onPageLoaded();
          }
          break;
        
        default:
          console.warn('Unknown message type from WebView:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleLoadEnd = () => {
    // Optional: Add any load completion logic here
    if (onPageLoaded) {
      onPageLoaded();
    }
  };

  const handleError = (errorEvent: any) => {
    console.error('WebView error:', errorEvent.nativeEvent);
  };

  if (!webViewContent) {
    return (
      <View style={styles.emptyContainer}>
        {/* Loading or empty state will be handled by parent component */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: webViewContent.content }}
        style={styles.webView}
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Performance optimizations
        androidHardwareAccelerationDisabled={false}
        mixedContentMode="compatibility"
        // Prevent zooming
        scrollEnabled={true}
        bounces={false}
        // Handle viewport
        injectedJavaScript={`
          const meta = document.createElement('meta');
          meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          meta.setAttribute('name', 'viewport');
          document.getElementsByTagName('head')[0].appendChild(meta);
        `}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});