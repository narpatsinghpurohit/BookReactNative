/**
 * Base HTML template for WebView
 * This HTML stays loaded in the WebView - we only update the content div
 * Matches the app's THEME for visual consistency
 */
export const BASE_HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="format-detection" content="telephone=no">
  <title>Book Reader</title>
  <style>
    /* ========================================
       RESET & BASE STYLES
       ======================================== */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      background-color: #FFFFFF;
      color: #2C3E50;
      font-size: 16px;
      line-height: 1.6;
    }

    /* ========================================
       CONTENT CONTAINER
       ======================================== */
    #book-container {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }

    #content-area {
      padding: 24px 16px;
      min-height: 100vh;
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    /* Fade transition effect */
    #content-area.fade-out {
      opacity: 0;
    }

    #content-area.fade-in {
      opacity: 1;
    }

    /* ========================================
       COVER PAGE STYLES
       ======================================== */
    .cover-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      text-align: center;
      padding: 32px 24px;
    }

    .cover-image {
      width: 200px;
      height: 280px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .cover-title {
      font-size: 28px;
      font-weight: bold;
      color: #2C3E50;
      margin-bottom: 12px;
      line-height: 1.3;
    }

    .cover-author {
      font-size: 18px;
      color: #636e72;
      margin-bottom: 8px;
    }

    .cover-publisher {
      font-size: 16px;
      color: #bdc3c7;
      margin-bottom: 24px;
    }

    .cover-hint {
      font-size: 14px;
      color: #FF9F6A;
      margin-top: 32px;
    }

    /* ========================================
       TABLE OF CONTENTS STYLES
       ======================================== */
    .toc-container {
      padding: 16px 0;
    }

    .toc-title {
      font-size: 24px;
      font-weight: bold;
      color: #2C3E50;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #FF9F6A;
    }

    .toc-section {
      margin-bottom: 16px;
    }

    .toc-section-header {
      font-size: 18px;
      font-weight: 600;
      color: #2C3E50;
      padding: 12px;
      background-color: #fceae8;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .toc-sthanam {
      margin-left: 12px;
      margin-bottom: 12px;
    }

    .toc-sthanam-header {
      font-size: 16px;
      font-weight: 600;
      color: #636e72;
      padding: 10px 12px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .toc-chapter {
      margin-left: 12px;
      margin-bottom: 8px;
    }

    .toc-chapter-item {
      font-size: 15px;
      color: #2C3E50;
      padding: 8px 12px;
      border-left: 3px solid #FF9F6A;
      background-color: #FFFFFF;
      border-radius: 4px;
      margin-bottom: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toc-chapter-item:active {
      background-color: #fceae8;
      transform: translateX(4px);
    }

    .toc-page-number {
      font-size: 13px;
      color: #636e72;
      margin-left: 8px;
    }

    /* ========================================
       INTRO PAGE STYLES (Chapter/Section)
       ======================================== */
    .intro-page {
      padding: 32px 16px;
    }

    .intro-header {
      font-size: 24px;
      font-weight: bold;
      color: #2C3E50;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #FF9F6A;
    }

    .intro-description {
      font-size: 16px;
      color: #636e72;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .intro-topics {
      background-color: #fceae8;
      padding: 16px;
      border-radius: 8px;
      margin-top: 24px;
    }

    .intro-topics-title {
      font-size: 16px;
      font-weight: 600;
      color: #2C3E50;
      margin-bottom: 12px;
    }

    .intro-topics-list {
      list-style: none;
      padding-left: 0;
    }

    .intro-topics-list li {
      font-size: 15px;
      color: #636e72;
      padding: 6px 0;
      padding-left: 20px;
      position: relative;
    }

    .intro-topics-list li:before {
      content: "•";
      color: #FF9F6A;
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    /* ========================================
       CONTENT PAGE STYLES
       ======================================== */
    .content-page {
      padding: 16px 0;
    }

    .content-page h1 {
      font-size: 24px;
      font-weight: bold;
      color: #2C3E50;
      margin-bottom: 16px;
      line-height: 1.3;
    }

    .content-page h2 {
      font-size: 20px;
      font-weight: 600;
      color: #2C3E50;
      margin-top: 24px;
      margin-bottom: 12px;
      line-height: 1.3;
    }

    .content-page h3 {
      font-size: 18px;
      font-weight: 600;
      color: #636e72;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    .content-page p {
      font-size: 16px;
      color: #2C3E50;
      line-height: 1.8;
      margin-bottom: 16px;
    }

    .content-page ul,
    .content-page ol {
      margin-bottom: 16px;
      padding-left: 24px;
    }

    .content-page li {
      font-size: 16px;
      color: #2C3E50;
      line-height: 1.8;
      margin-bottom: 8px;
    }

    .content-page img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 16px 0;
    }

    .content-page blockquote {
      border-left: 4px solid #FF9F6A;
      padding-left: 16px;
      margin: 16px 0;
      font-style: italic;
      color: #636e72;
    }

    /* ========================================
       LOADING STATE
       ======================================== */
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      flex-direction: column;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #fceae8;
      border-top-color: #FF9F6A;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      margin-top: 16px;
      font-size: 16px;
      color: #636e72;
    }

    /* ========================================
       ERROR STATE
       ======================================== */
    .error-container {
      padding: 32px 16px;
      text-align: center;
    }

    .error-title {
      font-size: 20px;
      font-weight: bold;
      color: #e74c3c;
      margin-bottom: 12px;
    }

    .error-message {
      font-size: 16px;
      color: #636e72;
      line-height: 1.6;
    }

    /* ========================================
       UTILITY CLASSES
       ======================================== */
    .text-center {
      text-align: center;
    }

    .mt-16 {
      margin-top: 16px;
    }

    .mb-16 {
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div id="book-container">
    <div id="content-area">
      <!-- Content will be injected here -->
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading book...</p>
      </div>
    </div>
  </div>

  <script>
    /* ========================================
       WEBVIEW COMMUNICATION
       ======================================== */
    
    // Function to update page content (called from React Native)
    function updatePageContent(htmlContent) {
      const contentArea = document.getElementById('content-area');
      
      // Fade out
      contentArea.classList.add('fade-out');
      
      // Update content after fade
      setTimeout(() => {
        contentArea.innerHTML = htmlContent;
        
        // Scroll to top
        const container = document.getElementById('book-container');
        container.scrollTop = 0;
        
        // Fade in
        contentArea.classList.remove('fade-out');
        contentArea.classList.add('fade-in');
        
        // Send message to React Native that page loaded
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAGE_LOADED',
            timestamp: Date.now()
          }));
        }
      }, 300);
    }

    // Handle TOC item clicks
    function handleTOCClick(pageNumber) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'NAVIGATE_TO_PAGE',
          pageNumber: pageNumber
        }));
      }
    }

    // Initial load complete
    window.addEventListener('load', () => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'WEBVIEW_READY'
        }));
      }
    });

    // Log errors to React Native
    window.addEventListener('error', (event) => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'WEBVIEW_ERROR',
          error: event.message
        }));
      }
    });
  </script>
</body>
</html>
`;
