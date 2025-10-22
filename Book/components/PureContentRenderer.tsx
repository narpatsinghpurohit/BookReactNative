import React, { useState, useEffect } from 'react';
import { View,  StyleSheet, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import THEME from '../../../theme/theme';
import { TextSizeType } from '../../../constants/textSizes';
import { HtmlRenderer } from '../../../components/HtmlRenderer/HtmlRenderer';
import { CustomText } from '../../../components/CustomText';
import { PageContentSkeleton } from './PageContentSkeleton';
import { getStyledHTML } from '@/utils/toolkit';
import { useBookReader } from '@/context/BookReaderContext';
import { PageContent } from '@/types/book';
import { setContext } from '@/store/slices/chatSlice';
import { useDispatch } from 'react-redux';
interface PureContentRendererProps {
  bookId: string;
  pageId: string;
  mdPageUrl?: string;
  htmlPageUrl?: string;
  textSize: TextSizeType;
}

export const PureContentRenderer: React.FC<PureContentRendererProps> = ({
  bookId,
  pageId,
  mdPageUrl,
  htmlPageUrl,
  textSize
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const {pageContent, setPageContent, nestedStructure, currentPageDetails} = useBookReader();
  const requestSeqRef = React.useRef(0);
  const abortRef = React.useRef<AbortController | null>(null);
  const latestUrlRef = React.useRef<string | null>(null);
  const cacheRef = React.useRef<Map<string, string>>(new Map());

  const fetchContent = async () => {
  setLoading(true);
  setError(null);

  const url = mdPageUrl || htmlPageUrl;
  if (!url) {
    setError('No content URL provided');
    setLoading(false);
    return;
  }

  // Update the latest URL and bump request generation
  latestUrlRef.current = url;
  const mySeq = ++requestSeqRef.current;

  // Serve from cache immediately if present
  const cached = cacheRef.current.get(url);
  if (cached) {
    // Only commit if still latest
    if (mySeq === requestSeqRef.current && latestUrlRef.current === url) {
      setContent(cached);
      setLoading(false);
    }
    // Still proceed to fetch in background if you want to validate freshness (optional)
  }

  // Abort previous request and start a new one
  try {
    abortRef.current?.abort();
  } catch {}
  const controller = new AbortController();
  abortRef.current = controller;

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
    const txt = await res.text();

    // Only commit if this request is still the latest for the current URL
    if (mySeq === requestSeqRef.current && latestUrlRef.current === url) {
      cacheRef.current.set(url, txt);
      setContent(txt);
      setLoading(false);

      dispatch(setContext({
        bookId,
        pageContent: txt,
        bookName: nestedStructure?.title || bookId,
        teacherMode: 'Strict',
        sthanamName: currentPageDetails?.sthanam || '',
        chapterHeader: currentPageDetails?.chapter || '',
        sectionHeader: currentPageDetails?.tocHeader || '',
      }));

      setPageContent({ ...pageContent, currentPageContent: txt } as PageContent);
    } else {
      // Stale result: ignore silently
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return; // request was superseded
    if (mySeq === requestSeqRef.current && latestUrlRef.current === url) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
      setLoading(false);
    }
  }
};

useEffect(() => {
  // optional micro-debounce: collapse rapid changes into one fetch
  const id = setTimeout(() => fetchContent(), 0);
  return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [mdPageUrl, htmlPageUrl, bookId, pageId]);

  if (loading) {
    return <PageContentSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <CustomText style={styles.errorText}>
          Failed to load content: {error}
        </CustomText>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.errorContainer}>
        <CustomText style={styles.errorText}>
          No content available
        </CustomText>
      </View>
    );
  }

  return (
    <>
      {mdPageUrl ? (
        <SelectableMarkdownText 
          content={content}
          textSize={textSize}
        />
      ) : (
        <SelectableHtmlContent 
          html={content}
          textSize={textSize}
        />
      )}
    </>
  );
};

// Component for rendering markdown with selection
export const SelectableMarkdownText: React.FC<{
  content: string;
  textSize: TextSizeType;
}> = ({ content, textSize }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  
  // Calculate available height dynamically for all devices
  const getAvailableHeight = () => {
    // Base calculation: screen height minus safe areas
    const baseHeight = screenHeight - insets.top - insets.bottom;
    
    // Account for navigation elements (these are approximate and work across devices)
    const navigationElements = {
      // App bar/header (typically 56-60px plus any additional spacing)
      header: Platform.select({ ios: 60, android: 56 }) ?? 58,
      // Bottom navigation/pagination (varies by device)
      bottomNav: Platform.select({ ios: 70, android: 60 }) ?? 65,
      // Additional padding for comfortable reading
      padding: 42,
    };
    
    const totalNavigationHeight = 
      navigationElements.header + 
      navigationElements.bottomNav + 
      navigationElements.padding;
    
    // Use minimum 70% of screen for content, but prefer calculated available space
    const calculatedHeight = baseHeight - totalNavigationHeight;
    const minHeight = screenHeight * 0.7; // Ensure at least 70% of screen is used
    
    return Math.max(calculatedHeight, minHeight);
  };

  const availableHeight = getAvailableHeight();

  return (
      <WebView
        source={{ html: getStyledHTML(content, textSize) }}
        style={{...styles.webView, minHeight: "100%"}}
        containerStyle={{flex: 0, minHeight: availableHeight}}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true} 
        nestedScrollEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Enable text selection
        allowsFullscreenVideo={false}
        bounces={false}
        // iOS specific props for text selection
        dataDetectorTypes="none"
        allowsBackForwardNavigationGestures={false}
        // Enable zoom
        pinchGestureEnabled={true}
        // Set initial and maximum scale
        injectedJavaScript={`
          document.addEventListener('DOMContentLoaded', function() {
            // Enable text selection
            document.body.style.webkitUserSelect = 'text';
            document.body.style.webkitTouchCallout = 'default';
            
            // Prevent zoom reset on orientation change
            document.querySelector('meta[name="viewport"]').setAttribute('content', 
              'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes'
            );
          });
          true;
        `}
        // Handle any navigation attempts (like clicking links)
        onShouldStartLoadWithRequest={(request) => {
          // Only allow the initial load, prevent navigation to external links
          return request.url.startsWith('data:') || request.url === 'about:blank';
        }}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
      />
  );
};

// Component for rendering HTML with selection
const SelectableHtmlContent: React.FC<{
  html: string;
  textSize: TextSizeType;
}> = ({ html, textSize }) => {
  return (
    <View style={styles.htmlContainer}>
      <HtmlRenderer 
        html={html} 
        textSize={textSize}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  htmlContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.large,
  },
  loadingText: {
    marginTop: THEME.spacing.medium,
    color: THEME.colors.text.secondary,
    fontSize: THEME.typography.fontSize.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.large,
  },
  errorText: {
    color: THEME.colors.text.secondary,
    fontSize: THEME.typography.fontSize.regular,
    textAlign: 'center',
  },
  webView: {
    flex:0,
    backgroundColor: 'transparent',
    width: '100%',
  },
});
