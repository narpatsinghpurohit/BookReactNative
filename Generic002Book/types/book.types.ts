// ==========================================
// API RESPONSE TYPES (from your API 1)
// ==========================================

export interface NestedGeneric002Structure {
  title: string;
  author: string;
  publisher: string;
  image: string | null;
  description?: string;
  bookSections: NestedBookSection[];
  tocType: 'nested-generic-002';
  sthanams: NestedGeneric002Sthanam[];
}

export interface NestedBookSection {
  sectionId: string;
  sectionNumber: number;
  header: string;
  isActive?: boolean;
}

export interface NestedGeneric002Sthanam {
  sthanamId: string;
  sthanamNumber: number;
  header: string;
  chapters: NestedGeneric002Chapter[];
  isActive?: boolean;
}

export interface NestedGeneric002Chapter {
  sthanamId: string;
  chapterId: string;
  chapterNumber: number;
  header: string;
  sections: NestedGeneric002Section[];
  isActive?: boolean;
}

export interface NestedGeneric002Section {
  sectionId: string;
  chapterId: string;
  verification?: any;
  sectionNumber?: number;
  header?: string;
  pages: ContentPage[];
  isActive?: boolean;
}

export interface ContentPage {
  type: 'page';
  pageId: string;
  mdPage: string | null;
  htmlPage: string | null;
  editorJsPage: string | null;
  mdPageUrl?: string | null;
  htmlPageUrl?: string | null;
  editorJsPageUrl?: string | null;
  pageNumber: number | null;
  elementId: string;
  pageOrder?: number | null;
  availableTranslations?: string[];
  createdBy: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
}

// ==========================================
// PAGE TYPES ENUM
// ==========================================

export enum PageType {
  CoverPage = 'CoverPage',
  BookSection = 'BookSection',
  Sthanam = 'Sthanam',
  Chapter = 'Chapter',
  Section = 'Section',
}

// ==========================================
// TRANSFORMED/FLATTENED TYPES
// ==========================================

export interface FlatPageItem {
  // Sequential position
  page: number; // 1, 2, 3, 4... continuous
  
  // Page type
  pageType: PageType | 'TOC';
  
  // Stable identifiers (for dynamic content)
  pageId?: string; // For content pages
  elementId?: string; // Alternative ID
  sectionId?: string; // Parent section
  sectionNumber?: number; // For reference
  chapterId?: string; // Parent chapter
  sthanamId?: string; // Parent sthanam
  sthanamNumber?: number; // For reference
  bookSectionId?: string; // Parent book section
  
  // Display metadata
  tocHeader: string; // What to show in TOC
  displayTitle?: string; // Readable page title
  
  // Content references
  contentUrls?: {
    editorJs?: string | null;
    html?: string | null;
    markdown?: string | null;
  };
  
  // Original book metadata
  originalPageNumber?: number | null; // From API (might not be sequential)
  pageOrder?: number | null; // Order within section
  
  // Navigation context
  isFirstInSection?: boolean;
  isLastInSection?: boolean;
  isFirstInChapter?: boolean;
  isLastInChapter?: boolean;
  
  // Content metadata
  availableTranslations?: string[];
  updatedAt?: string | null;
  
  // For multi-page sections
  sectionPageIndex?: number; // Which page within section (0, 1, 2...)
  sectionTotalPages?: number; // Total pages in this section
}

export interface TransformedBookCache {
  // Metadata for cache management
  cacheVersion: string; // Schema version
  bookId: string;
  cachedAt: number; // Timestamp when cached
  serverUpdatedAt: string | null; // Latest updatedAt from API
  
  // Book metadata for cover page
  bookMetadata : {
    title: string;
    author: string;
    publisher: string;
    image: string | null;
    tocType: string;
    description?: string;
  };
  
  // Flattened page sequence - THE GOLDEN DATA
  pageSequence: FlatPageItem[];
  
  // Total page count
  totalPages: number;
  
  // Lookup maps for O(1) access
  lookupMaps: {
    pageByNumber: Record<number, FlatPageItem>;
    pageIdToNumber: Record<string, number>;
    sectionPageRanges: Record<string, SectionPageRange>;
    chapterPageRanges: Record<string, ChapterPageRange>;
    sthanamPageRanges: Record<string, SthanamPageRange>;
  };
}

export interface SectionPageRange {
  sectionId: string;
  introPage: number;
  firstContentPage: number;
  lastContentPage: number;
  totalPages: number; // Including intro
  pageIds: string[];
  header: string;
}

export interface ChapterPageRange {
  chapterId: string;
  introPage: number;
  sections: string[]; // sectionIds
  pageRange: { start: number; end: number };
  header: string;
}

export interface SthanamPageRange {
  sthanamId: string;
  introPage: number;
  chapters: string[]; // chapterIds
  pageRange: { start: number; end: number };
  header: string;
}



export interface PageApiPayload {
  page: number;
  pageType: PageType;
  input: {
    bookid: string;
    sthanamNumber?: number;
    sthanamId?: string;
    chapterId?: string;
    sectionNumber?: number;
    sectionId?: string;
  };
}