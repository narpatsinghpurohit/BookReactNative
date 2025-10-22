import {
  NestedGeneric002Structure,
  TransformedBookData,
  FlatPageItem,
  PageType,
} from '../types/book.types';

/**
 * Transform nested TOC structure into flat sequential page list
 * This handles the critical flow where multiple sections can map to same page number
 */
export const transformTOCToFlat = (
  apiResponse: NestedGeneric002Structure,
  bookId: string,
): TransformedBookData => {
  let pageCounter = 1;
  const pageSequence: FlatPageItem[] = [];
  const pageByNumber: Record<number, FlatPageItem> = {};

  // ========================================
  // STEP 1: Add Cover Page (Page 1)
  // ========================================
  const coverPage: FlatPageItem = {
    page: pageCounter++,
    pageType: PageType.CoverPage,
    tocHeader: apiResponse.title,
    displayTitle: 'Cover',
    description: apiResponse.description,
  };
  pageSequence.push(coverPage);
  pageByNumber[coverPage.page] = coverPage;

  // ========================================
  // STEP 2: Add Table of Contents (Page 2)
  // ========================================
  const tocPage: FlatPageItem = {
    page: pageCounter++,
    pageType: PageType.TOC,
    tocHeader: 'Table of Contents',
    displayTitle: 'Table of Contents',
  };
  pageSequence.push(tocPage);
  pageByNumber[tocPage.page] = tocPage;

  // ========================================
  // STEP 3: Flatten Book Structure
  // ========================================

  // Process BookSections (if any)
  apiResponse.bookSections?.forEach((bookSection) => {
    if (!bookSection.isActive) return;

    const bookSectionPage: FlatPageItem = {
      page: pageCounter++,
      pageType: PageType.BookSection,
      bookSectionId: bookSection.sectionId,
      tocHeader: bookSection.header,
      displayTitle: bookSection.header,
      description: bookSection.description,
    };
    pageSequence.push(bookSectionPage);
    pageByNumber[bookSectionPage.page] = bookSectionPage;
  });

  // Process Sthanams
  apiResponse.sthanams?.forEach((sthanam) => {
    if (!sthanam.isActive) return;

    // Add Sthanam intro page
    const sthanamPage: FlatPageItem = {
      page: pageCounter++,
      pageType: PageType.Sthanam,
      sthanamId: sthanam.sthanamId,
      sthanamNumber: sthanam.sthanamNumber,
      tocHeader: sthanam.header,
      displayTitle: sthanam.header,
      description: sthanam.description,
    };
    pageSequence.push(sthanamPage);
    pageByNumber[sthanamPage.page] = sthanamPage;

    // Process Chapters in Sthanam
    sthanam.chapters?.forEach((chapter) => {
      if (!chapter.isActive) return;

      // Add Chapter intro page
      const chapterPage: FlatPageItem = {
        page: pageCounter++,
        pageType: PageType.Chapter,
        chapterId: chapter.chapterId,
        sthanamId: sthanam.sthanamId,
        sthanamNumber: sthanam.sthanamNumber,
        tocHeader: chapter.header,
        displayTitle: chapter.header,
        description: chapter.description,
      };
      pageSequence.push(chapterPage);
      pageByNumber[chapterPage.page] = chapterPage;

      // CRITICAL: Process Sections - Handle multiple sections mapping to same page number
      chapter.sections?.forEach((section) => {
        if (!section.isActive) return;

        // For sections, we need to handle the case where multiple sections
        // can reference the same page object from the API
        if (section.pages && section.pages.length > 0) {
          // Get the first page number for this section
          const firstPage = section.pages[0];
          const sectionPageNumber = firstPage.pageNumber || pageCounter;

          // Create section entry for TOC navigation
          const sectionPage: FlatPageItem = {
            page: sectionPageNumber,
            pageType: PageType.Section,
            sectionId: section.sectionId,
            sectionNumber: section.sectionNumber,
            chapterId: chapter.chapterId,
            sthanamId: sthanam.sthanamId,
            sthanamNumber: sthanam.sthanamNumber,
            tocHeader: section.header || `Section ${section.sectionNumber}`,
            displayTitle: section.header || `Section ${section.sectionNumber}`,
            description: section.description,
            pageId: firstPage.pageId,
            elementId: firstPage.elementId,
            originalPageNumber: firstPage.pageNumber,
            pageOrder: firstPage.pageOrder,
            availableTranslations: firstPage.availableTranslations,
            updatedAt: firstPage.updatedAt,
          };

          // Only add to sequence if this page number hasn't been added yet
          // This handles the case where multiple sections map to same page
          if (!pageByNumber[sectionPageNumber]) {
            pageSequence.push(sectionPage);
            pageByNumber[sectionPageNumber] = sectionPage;
            
            // Update pageCounter only if we're adding a new page
            if (sectionPageNumber >= pageCounter) {
              pageCounter = sectionPageNumber + 1;
            }
          }
        }
      });
    });
  });

  // Sort page sequence by page number to ensure correct order
  pageSequence.sort((a, b) => a.page - b.page);

  // ========================================
  // STEP 4: Build Transformed Data Object
  // ========================================
  const transformedData: TransformedBookData = {
    bookMetadata: {
      title: apiResponse.title,
      author: apiResponse.author,
      publisher: apiResponse.publisher,
      image: apiResponse.image,
      tocType: apiResponse.tocType,
      description: apiResponse.description,
    },
    pageSequence,
    totalPages: Math.max(...pageSequence.map(p => p.page)),
    pageByNumber,
  };

  return transformedData;
};

/**
 * Helper: Get page by page number
 */
export const getPageByNumber = (
  transformedData: TransformedBookData,
  pageNumber: number,
): FlatPageItem | null => {
  return transformedData.pageByNumber[pageNumber] || null;
};

/**
 * Helper: Get next page
 */
export const getNextPage = (
  transformedData: TransformedBookData,
  currentPage: number,
): FlatPageItem | null => {
  const nextPageNumber = currentPage + 1;
  return getPageByNumber(transformedData, nextPageNumber);
};

/**
 * Helper: Get previous page
 */
export const getPreviousPage = (
  transformedData: TransformedBookData,
  currentPage: number,
): FlatPageItem | null => {
  const prevPageNumber = currentPage - 1;
  if (prevPageNumber < 1) return null;
  return getPageByNumber(transformedData, prevPageNumber);
};