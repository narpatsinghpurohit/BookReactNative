import { FlatPageItem, TOCNavigationItem } from '../../types/book.types';

/**
 * Base CSS styles for all WebView content
 */
const BASE_STYLES = `
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    padding: 20px;
    background: #ffffff;
  }
  
  .page-container {
    max-width: 100%;
    margin: 0 auto;
  }
  
  .page-title {
    font-size: 24px;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e0e0e0;
  }
  
  .page-content {
    margin-top: 20px;
  }
  
  /* Cover Page Styles */
  .cover-page {
    text-align: center;
    padding: 40px 20px;
  }
  
  .cover-title {
    font-size: 28px;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 16px;
  }
  
  .cover-author {
    font-size: 18px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .cover-publisher {
    font-size: 16px;
    color: #888;
    margin-bottom: 20px;
  }
  
  .cover-description {
    font-size: 16px;
    color: #555;
    line-height: 1.5;
    text-align: left;
    margin-top: 20px;
  }
  
  /* TOC Styles */
  .toc-container {
    padding: 20px 0;
  }
  
  .toc-item {
    padding: 8px 0;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .toc-item:hover {
    background-color: #f8f8f8;
  }
  
  .toc-level-1 {
    font-weight: bold;
    font-size: 18px;
    color: #1a1a1a;
    padding-left: 0;
  }
  
  .toc-level-2 {
    font-weight: 600;
    font-size: 16px;
    color: #333;
    padding-left: 20px;
  }
  
  .toc-level-3 {
    font-size: 15px;
    color: #555;
    padding-left: 40px;
  }
  
  .toc-page-number {
    float: right;
    color: #888;
    font-size: 14px;
  }
  
  /* Structure Page Styles */
  .structure-page {
    padding: 20px 0;
  }
  
  .structure-description {
    font-size: 16px;
    line-height: 1.6;
    color: #333;
  }
  
  /* Content Page Styles (EditorJS) */
  .content-page {
    padding: 20px 0;
  }
  
  .editor-paragraph {
    margin-bottom: 16px;
    line-height: 1.6;
  }
  
  .editor-header {
    font-weight: bold;
    margin: 20px 0 12px 0;
    color: #1a1a1a;
  }
  
  .editor-header-1 { font-size: 24px; }
  .editor-header-2 { font-size: 20px; }
  .editor-header-3 { font-size: 18px; }
  .editor-header-4 { font-size: 16px; }
  
  .editor-list {
    margin: 16px 0;
    padding-left: 20px;
  }
  
  .editor-list li {
    margin-bottom: 8px;
  }
  
  .editor-quote {
    margin: 20px 0;
    padding: 16px 20px;
    background: #f8f9fa;
    border-left: 4px solid #007bff;
    font-style: italic;
  }
  
  .editor-quote cite {
    display: block;
    margin-top: 8px;
    font-size: 14px;
    color: #666;
  }
  
  .editor-code {
    margin: 16px 0;
    padding: 16px;
    background: #f4f4f4;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    overflow-x: auto;
  }
  
  .editor-delimiter {
    text-align: center;
    margin: 30px 0;
    font-size: 18px;
    color: #888;
  }
  
  .editor-table {
    width: 100%;
    margin: 16px 0;
    border-collapse: collapse;
  }
  
  .editor-table td {
    padding: 8px 12px;
    border: 1px solid #ddd;
    vertical-align: top;
  }
  
  .editor-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  .empty-content {
    text-align: center;
    padding: 40px 20px;
    color: #888;
    font-style: italic;
  }
  
  .editor-unknown {
    padding: 16px;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    margin: 16px 0;
    color: #856404;
  }
</style>
`;

/**
 * Generate cover page HTML
 */
export const generateCoverPageHTML = (pageData: FlatPageItem, bookMetadata: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${bookMetadata.title}</title>
      ${BASE_STYLES}
    </head>
    <body>
      <div class="page-container">
        <div class="cover-page">
          <h1 class="cover-title">${bookMetadata.title}</h1>
          <div class="cover-author">by ${bookMetadata.author}</div>
          <div class="cover-publisher">${bookMetadata.publisher}</div>
          ${pageData.description ? `<div class="cover-description">${pageData.description}</div>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate table of contents HTML
 */
export const generateTOCHTML = (tocItems: TOCNavigationItem[]): string => {
  const tocItemsHTML = tocItems.map(item => {
    const levelClass = `toc-level-${item.level}`;
    return `
      <div class="toc-item ${levelClass}" onclick="navigateToPage(${item.page})">
        <span class="toc-header">${item.header}</span>
        <span class="toc-page-number">Page ${item.page}</span>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Table of Contents</title>
      ${BASE_STYLES}
    </head>
    <body>
      <div class="page-container">
        <h1 class="page-title">Table of Contents</h1>
        <div class="toc-container">
          ${tocItemsHTML}
        </div>
      </div>
      <script>
        function navigateToPage(pageNumber) {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'NAVIGATE_TO_PAGE',
            pageNumber: pageNumber
          }));
        }
      </script>
    </body>
    </html>
  `;
};

/**
 * Generate structure page HTML (for Sthanam, Chapter, BookSection)
 */
export const generateStructurePageHTML = (pageData: FlatPageItem): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${pageData.tocHeader}</title>
      ${BASE_STYLES}
    </head>
    <body>
      <div class="page-container">
        <div class="structure-page">
          <h1 class="page-title">${pageData.tocHeader}</h1>
          <div class="page-content">
            ${pageData.description ? `<div class="structure-description">${pageData.description}</div>` : '<div class="empty-content">No description available</div>'}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate content page HTML (for Section content with EditorJS blocks)
 */
export const generateContentPageHTML = (pageData: FlatPageItem, editorJSHTML: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${pageData.tocHeader}</title>
      ${BASE_STYLES}
    </head>
    <body>
      <div class="page-container">
        <div class="content-page">
          <h1 class="page-title">${pageData.tocHeader}</h1>
          <div class="page-content">
            ${editorJSHTML}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate error page HTML
 */
export const generateErrorPageHTML = (error: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error</title>
      ${BASE_STYLES}
    </head>
    <body>
      <div class="page-container">
        <div class="error-page" style="text-align: center; padding: 40px 20px;">
          <h1 style="color: #e74c3c; margin-bottom: 20px;">Error Loading Page</h1>
          <p style="color: #666; margin-bottom: 20px;">${error}</p>
          <button onclick="window.ReactNativeWebView?.postMessage(JSON.stringify({type: 'RETRY'}))" 
                  style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Retry
          </button>
        </div>
      </div>
    </body>
    </html>
  `;
};