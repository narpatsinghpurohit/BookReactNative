import {
  NestedGeneric002Structure,
  TransformedBookCache,
  FlatPageItem,
  PageType,
  SectionPageRange,
  ChapterPageRange,
  SthanamPageRange,
} from '../types/book.types';

const CACHE_VERSION = '1.0';

/**
 * Main transformation function
 * Converts nested TOC structure into flat sequential page list
 */
export const transformTOCToFlat = (
  apiResponse: NestedGeneric002Structure,
  bookId: string,
): TransformedBookCache => {
  let pageCounter = 1;
  const pageSequence: FlatPageItem[] = [];
  
  // Lookup maps
  const pageByNumber: Record<number, FlatPageItem> = {};
  const pageIdToNumber: Record<string, number> = {};
  const sectionPageRanges: Record<string, SectionPageRange> = {};
  const chapterPageRanges: Record<string, ChapterPageRange> = {};
  const sthanamPageRanges: Record<string, SthanamPageRange> = {};

  // Get latest updatedAt from all pages
  const serverUpdatedAt = getLatestUpdatedAt(apiResponse);

  // ========================================
  // STEP 1: Add Cover Page (Page 1)
  // ========================================
  const coverPage: FlatPageItem = {
    page: pageCounter++,
    pageType: PageType.CoverPage,
    tocHeader: apiResponse.title,
    displayTitle: 'Cover',
  };
  pageSequence.push(coverPage);
  pageByNumber[coverPage.page] = coverPage;

  // ========================================
  // STEP 2: Add Table of Contents (Page 2)
  // ========================================
  const tocPage: FlatPageItem = {
    page: pageCounter++,
    pageType: 'TOC',
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
    if (!bookSection.isActive) return; // Skip inactive sections

    const bookSectionPage: FlatPageItem = {
      page: pageCounter++,
      pageType: PageType.BookSection,
      bookSectionId: bookSection.sectionId,
      tocHeader: bookSection.header,
      displayTitle: bookSection.header,
    };
    pageSequence.push(bookSectionPage);
    pageByNumber[bookSectionPage.page] = bookSectionPage;
  });

  // Process Sthanams
  apiResponse.sthanams?.forEach((sthanam) => {
    if (!sthanam.isActive) return;

    const sthanamStartPage = pageCounter;

    // Add Sthanam intro page
    const sthanamPage: FlatPageItem = {
      page: pageCounter++,
      pageType: PageType.Sthanam,
      sthanamId: sthanam.sthanamId,
      tocHeader: sthanam.header,
      displayTitle: sthanam.header,
    };
    pageSequence.push(sthanamPage);
    pageByNumber[sthanamPage.page] = sthanamPage;

    const chapterIds: string[] = [];

    // Process Chapters in Sthanam
    sthanam.chapters?.forEach((chapter) => {
      if (!chapter.isActive) return;

      const chapterStartPage = pageCounter;
      chapterIds.push(chapter.chapterId);

      // Add Chapter intro page
      const chapterPage: FlatPageItem = {
        page: pageCounter++,
        pageType: PageType.Chapter,
        chapterId: chapter.chapterId,
        sthanamId: sthanam.sthanamId,
        tocHeader: chapter.header,
        displayTitle: chapter.header,
        isFirstInChapter: true,
      };
      pageSequence.push(chapterPage);
      pageByNumber[chapterPage.page] = chapterPage;

      const sectionIds: string[] = [];

      // Process Sections in Chapter
      chapter.sections?.forEach((section, sectionIndex) => {
        if (!section.isActive) return;

        const sectionStartPage = pageCounter;
        sectionIds.push(section.sectionId);

        // Add Section intro page
        const sectionPage: FlatPageItem = {
          page: pageCounter++,
          pageType: PageType.Section,
          sectionId: section.sectionId,
          chapterId: chapter.chapterId,
          sthanamId: sthanam.sthanamId,
          tocHeader: section.header || `Section ${section.sectionNumber}`,
          displayTitle: section.header || `Section ${section.sectionNumber}`,
          isFirstInSection: true,
        };
        pageSequence.push(sectionPage);
        pageByNumber[sectionPage.page] = sectionPage;

        const contentPageIds: string[] = [];
        const firstContentPageNumber = pageCounter;

        // Process Content Pages in Section (CRITICAL: Handle multiple pages)
        section.pages?.forEach((contentPage, pageIndex) => {
          const isFirstPage = pageIndex === 0;
          const isLastPage = pageIndex === section.pages.length - 1;

          const flatContentPage: FlatPageItem = {
            page: pageCounter++,
            pageType: PageType.Section,
            pageId: contentPage.pageId,
            elementId: contentPage.elementId,
            sectionId: section.sectionId,
            sectionNumber: section.sectionNumber,
            chapterId: chapter.chapterId,
            sthanamId: sthanam.sthanamId,
            sthanamNumber: sthanam.sthanamNumber,
            tocHeader: section.header || `Section ${section.sectionNumber}`,
            displayTitle: `${section.header || 'Section'} - Page ${pageIndex + 1} of ${section.pages.length}`,
            originalPageNumber: contentPage.pageNumber,
            pageOrder: contentPage.pageOrder,
            availableTranslations: contentPage.availableTranslations,
            updatedAt: contentPage.updatedAt,
            sectionPageIndex: pageIndex,
            sectionTotalPages: section.pages.length,
            isFirstInSection: isFirstPage,
            isLastInSection: isLastPage,
          };

          pageSequence.push(flatContentPage);
          pageByNumber[flatContentPage.page] = flatContentPage;
          pageIdToNumber[contentPage.pageId] = flatContentPage.page;
          contentPageIds.push(contentPage.pageId);
        });

        // Build section page range
        sectionPageRanges[section.sectionId] = {
          sectionId: section.sectionId,
          introPage: sectionStartPage,
          firstContentPage: firstContentPageNumber,
          lastContentPage: pageCounter - 1,
          totalPages: pageCounter - sectionStartPage,
          pageIds: contentPageIds,
          header: section.header || `Section ${section.sectionNumber}`,
        };
      });

      // Build chapter page range
      chapterPageRanges[chapter.chapterId] = {
        chapterId: chapter.chapterId,
        introPage: chapterStartPage,
        sections: sectionIds,
        pageRange: { start: chapterStartPage, end: pageCounter - 1 },
        header: chapter.header,
      };
    });

    // Build sthanam page range
    sthanamPageRanges[sthanam.sthanamId] = {
      sthanamId: sthanam.sthanamId,
      introPage: sthanamStartPage,
      chapters: chapterIds,
      pageRange: { start: sthanamStartPage, end: pageCounter - 1 },
      header: sthanam.header,
    };
  });

  // ========================================
  // STEP 4: Build Transformed Cache Object
  // ========================================
  const transformedCache: TransformedBookCache = {
    cacheVersion: CACHE_VERSION,
    bookId,
    cachedAt: Date.now(),
    serverUpdatedAt,
    bookMetadata: {
      title: apiResponse.title,
      author: apiResponse.author,
      publisher: apiResponse.publisher,
      image: apiResponse.image,
      tocType: apiResponse.tocType,
      description: apiResponse.description,
    },
    pageSequence,
    totalPages: pageSequence.length,
    lookupMaps: {
      pageByNumber,
      pageIdToNumber,
      sectionPageRanges,
      chapterPageRanges,
      sthanamPageRanges,
    },
  };

  console.log('transformedCache', transformedCache);

  return transformedCache;
};

/**
 * Helper: Get latest updatedAt timestamp from all pages
 */
const getLatestUpdatedAt = (tocData: NestedGeneric002Structure): string | null => {
  let latest: string | null = null;

  tocData.sthanams?.forEach((sthanam) => {
    sthanam.chapters?.forEach((chapter) => {
      chapter.sections?.forEach((section) => {
        section.pages?.forEach((page) => {
          if (page.updatedAt && (!latest || page.updatedAt > latest)) {
            latest = page.updatedAt;
          }
        });
      });
    });
  });

  return latest;
};

/**
 * Helper: Find page by pageId
 */
export const findPageByPageId = (
  transformedCache: TransformedBookCache,
  pageId: string,
): FlatPageItem | null => {
  const pageNumber = transformedCache.lookupMaps.pageIdToNumber[pageId];
  if (!pageNumber) return null;
  return transformedCache.lookupMaps.pageByNumber[pageNumber] || null;
};

/**
 * Helper: Get next page
 */
export const getNextPage = (
  transformedCache: TransformedBookCache,
  currentPage: number,
): FlatPageItem | null => {
  const nextPageNumber = currentPage + 1;
  return transformedCache.lookupMaps.pageByNumber[nextPageNumber] || null;
};

/**
 * Helper: Get previous page
 */
export const getPreviousPage = (
  transformedCache: TransformedBookCache,
  currentPage: number,
): FlatPageItem | null => {
  const prevPageNumber = currentPage - 1;
  if (prevPageNumber < 1) return null;
  return transformedCache.lookupMaps.pageByNumber[prevPageNumber] || null;
};
