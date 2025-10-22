import { FlatPageItem, PageType, TransformedBookCache } from '../types/book.types';
import { EditorJSContent } from '../services/pageApi';
import { editorJsToHtml } from './editorJsToHtml';

/**
 * Renders Cover Page HTML
 */
const renderCoverPage = (page: FlatPageItem, bookMetadata: TransformedBookCache['bookMetadata']): string => {
  const { title, author, publisher, image } = bookMetadata;
  
  return `
    <div class="cover-page">
      ${image ? `<img src="${image}" alt="${title}" class="cover-image" />` : ''}
      <h1 class="cover-title">${escapeHtml(title)}</h1>
      <p class="cover-author">by ${escapeHtml(author)}</p>
      <p class="cover-publisher">${escapeHtml(publisher)}</p>
      <p class="cover-hint">Swipe to start reading →</p>
    </div>
  `;
};

/**
 * Renders Table of Contents HTML
 */
const renderTOC = (bookData: TransformedBookCache): string => {
  let tocHTML = '<div class="toc-container">';
  tocHTML += '<h1 class="toc-title">Table of Contents</h1>';

  // Group pages by structure
  const sthanams = bookData.lookupMaps.sthanamPageRanges;
  const chapters = bookData.lookupMaps.chapterPageRanges;

  // Render BookSections (if any)
  const bookSections = bookData.pageSequence.filter(p => p.pageType === PageType.BookSection);
  
  if (bookSections.length > 0) {
    bookSections.forEach(section => {
      tocHTML += `
        <div class="toc-section">
          <div class="toc-section-header">${escapeHtml(section.tocHeader)}</div>
        </div>
      `;
    });
  }

  // Render Sthanams
  Object.values(sthanams).forEach(sthanam => {
    tocHTML += `
      <div class="toc-section">
        <div class="toc-sthanam-header">
          ${escapeHtml(sthanam.header)}
          <span class="toc-page-number">(Pages ${sthanam.pageRange.start}-${sthanam.pageRange.end})</span>
        </div>
    `;

    // Render Chapters in this Sthanam
    sthanam.chapters.forEach(chapterId => {
      const chapter = chapters[chapterId];
      if (chapter) {
        tocHTML += `
          <div class="toc-chapter">
            <div class="toc-chapter-item" onclick="handleTOCClick(${chapter.introPage})">
              ${escapeHtml(chapter.header)}
              <span class="toc-page-number">Page ${chapter.introPage}</span>
            </div>
          </div>
        `;
      }
    });

    tocHTML += '</div>';
  });

  tocHTML += '</div>';
  return tocHTML;
};

/**
 * Renders Introduction Page (BookSection, Sthanam, Chapter, Section)
 */
const renderIntroPage = (page: FlatPageItem): string => {
  return `
    <div class="intro-page">
      <h1 class="intro-header">${escapeHtml(page.tocHeader)}</h1>
      ${page.displayTitle && page.displayTitle !== page.tocHeader 
        ? `<p class="intro-description">${escapeHtml(page.displayTitle)}</p>` 
        : ''
      }
      ${page.sectionTotalPages && page.sectionTotalPages > 1
        ? `<p class="intro-description">This section contains ${page.sectionTotalPages} pages</p>`
        : ''
      }
      <div class="intro-topics">
        <p class="intro-topics-title">📚 Overview</p>
        <p>Swipe right to continue reading through this ${page.pageType.toLowerCase()}.</p>
      </div>
    </div>
  `;
};


/**
 * Renders Content Page HTML with real EditorJS content
 */
const renderContentPage = (
  page: FlatPageItem,
  content?: EditorJSContent | null,
): string => {
  // Show loading state if content is not yet fetched
  if (!content) {
    return `
      <div class="content-page">
        <h1>${escapeHtml(page.tocHeader)}</h1>
        
        ${page.sectionTotalPages && page.sectionTotalPages > 1
          ? `<p style="color: #636e72; font-size: 14px; margin-bottom: 16px;">
               Page ${(page.sectionPageIndex || 0) + 1} of ${page.sectionTotalPages}
             </p>`
          : ''
        }
        
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading content...</p>
        </div>
      </div>
    `;
  }

  // Convert EditorJS to HTML
  const contentHtml = editorJsToHtml(content);

  return `
    <div class="content-page">
      ${page.sectionTotalPages && page.sectionTotalPages > 1
        ? `<p style="color: #636e72; font-size: 14px; margin-bottom: 16px; padding: 8px 12px; background-color: #fceae8; border-radius: 6px; display: inline-block;">
             📄 Page ${(page.sectionPageIndex || 0) + 1} of ${page.sectionTotalPages}
           </p>`
        : ''
      }
      
      <!-- EditorJS Content -->
      ${contentHtml}
      
      ${page.originalPageNumber 
        ? `<p style="font-size: 13px; color: #bdc3c7; margin-top: 32px; padding-top: 16px; border-top: 1px solid #E0E0E0;">
             📖 Original page number: ${page.originalPageNumber}
           </p>`
        : ''
      }
    </div>
  `;
};
/**
 * Renders Loading State
 */
const renderLoading = (): string => {
  return `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading page...</p>
    </div>
  `;
};

/**
 * Renders Error State
 */
const renderError = (message: string): string => {
  return `
    <div class="error-container">
      <h2 class="error-title">Unable to Load Page</h2>
      <p class="error-message">${escapeHtml(message)}</p>
    </div>
  `;
};


/**
 * Main function: Renders any page based on its type
 * Now accepts optional content parameter for ContentPages
 */
export const renderPage = (
  page: FlatPageItem,
  bookData: TransformedBookCache,
  content?: EditorJSContent | null,
): string => {
  try {

    switch (page.pageType) {
      case PageType.CoverPage:
        return renderCoverPage(page, bookData.bookMetadata);

      case 'TOC':
        return renderTOC(bookData);

      case PageType.BookSection:
      case PageType.Sthanam:
      case PageType.Chapter:
        return renderIntroPage(page);

      case PageType.Section:
        return renderContentPage(page, content);

      default:
        return renderError(`Unknown page type: ${page.pageType}`);
    }
  } catch (error) {
    console.error('Error rendering page:', error);
    return renderError('An error occurred while rendering this page');
  }
};



/**
 * Helper: Escape HTML to prevent XSS
 */
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Export helper functions for testing
 */
export {
  renderCoverPage,
  renderTOC,
  renderIntroPage,
  renderContentPage,
  renderLoading,
  renderError,
};
