// ==========================================
// API RESPONSE TYPES (from generate-pages API)
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
  description?: string;
  isActive?: boolean;
}

export interface NestedGeneric002Sthanam {
  sthanamId: string;
  sthanamNumber: number;
  header: string;
  description?: string;
  chapters: NestedGeneric002Chapter[];
  isActive?: boolean;
}

export interface NestedGeneric002Chapter {
  sthanamId: string;
  chapterId: string;
  chapterNumber: number;
  header: string;
  description?: string;
  sections: NestedGeneric002Section[];
  isActive?: boolean;
}

export interface NestedGeneric002Section {
  sectionId: string;
  chapterId: string;
  sectionNumber?: number;
  header?: string;
  description?: string;
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
  TOC = 'TOC',
  BookSection = 'BookSection',
  Sthanam = 'Sthanam',
  Chapter = 'Chapter',
  Section = 'Section',
}

// ==========================================
// FLATTENED PAGE TYPES
// ==========================================

export interface FlatPageItem {
  // Sequential position
  page: number; // 1, 2, 3, 4... continuous
  
  // Page type
  pageType: PageType;
  
  // Display info
  tocHeader: string;
  displayTitle?: string;
  
  // Content source
  description?: string; // For structure pages
  pageId?: string; // For content pages
  
  // Context identifiers (for API calls)
  elementId?: string;
  sectionId?: string;
  sectionNumber?: number;
  chapterId?: string;
  sthanamId?: string;
  sthanamNumber?: number;
  bookSectionId?: string;
  
  // Original page metadata
  originalPageNumber?: number | null;
  pageOrder?: number | null;
  availableTranslations?: string[];
  updatedAt?: string | null;
}

export interface TransformedBookData {
  // Book metadata
  bookMetadata: {
    title: string;
    author: string;
    publisher: string;
    image: string | null;
    tocType: string;
    description?: string;
  };
  
  // Flattened page sequence
  pageSequence: FlatPageItem[];
  
  // Total page count
  totalPages: number;
  
  // Lookup map for O(1) access
  pageByNumber: Record<number, FlatPageItem>;
}

// ==========================================
// PAGE API TYPES
// ==========================================

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

export interface EditorJSContent {
  time?: number;
  blocks: EditorJSBlock[];
  version?: string;
}

export interface EditorJSBlock {
  id?: string;
  type: string;
  data: any;
}

// ==========================================
// NAVIGATION TYPES
// ==========================================

export interface NavigationState {
  currentPage: number;
  totalPages: number;
  progress: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

// ==========================================
// WEBVIEW CONTENT TYPES
// ==========================================

export interface WebViewContentData {
  pageType: PageType;
  content: string; // HTML content for WebView
  pageNumber: number;
  totalPages: number;
}

export interface TOCNavigationItem {
  page: number;
  pageType: PageType;
  header: string;
  level: number; // 1=Sthanam, 2=Chapter, 3=Section
  hasChildren?: boolean;
  parentId?: string;
}