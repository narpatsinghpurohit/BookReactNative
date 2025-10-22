/**
 * Types of messages that can be received from WebView
 */
export enum WebViewMessageType {
  WEBVIEW_READY = 'WEBVIEW_READY',
  PAGE_LOADED = 'PAGE_LOADED',
  NAVIGATE_TO_PAGE = 'NAVIGATE_TO_PAGE',
  WEBVIEW_ERROR = 'WEBVIEW_ERROR',
  SCROLL_POSITION = 'SCROLL_POSITION',
}

/**
 * Message structure from WebView
 */
export interface WebViewMessage {
  type: WebViewMessageType;
  pageNumber?: number;
  timestamp?: number;
  error?: string;
  scrollPosition?: number;
}

/**
 * Handler function type
 */
export type MessageHandler = (message: WebViewMessage) => void;

/**
 * Parse message from WebView
 */
export const parseWebViewMessage = (event: any): WebViewMessage | null => {
  try {
    const data = event.nativeEvent.data;
    const parsed = JSON.parse(data);
    return parsed as WebViewMessage;
  } catch (error) {
    console.error('Failed to parse WebView message:', error);
    return null;
  }
};

/**
 * Create message handler
 */
export const createMessageHandler = (handlers: {
  onWebViewReady?: () => void;
  onPageLoaded?: () => void;
  onNavigateToPage?: (pageNumber: number) => void;
  onWebViewError?: (error: string) => void;
  onScrollPosition?: (position: number) => void;
}): MessageHandler => {
  return (message: WebViewMessage) => {

    switch (message.type) {
      case WebViewMessageType.WEBVIEW_READY:
        handlers.onWebViewReady?.();
        break;

      case WebViewMessageType.PAGE_LOADED:
        handlers.onPageLoaded?.();
        break;

      case WebViewMessageType.NAVIGATE_TO_PAGE:
        if (message.pageNumber) {
          handlers.onNavigateToPage?.(message.pageNumber);
        }
        break;

      case WebViewMessageType.WEBVIEW_ERROR:
        if (message.error) {
          handlers.onWebViewError?.(message.error);
        }
        break;

      case WebViewMessageType.SCROLL_POSITION:
        if (message.scrollPosition !== undefined) {
          handlers.onScrollPosition?.(message.scrollPosition);
        }
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  };
};
