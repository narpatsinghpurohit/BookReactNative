import React, {useEffect, useMemo, useState} from 'react';
import {View, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import THEME from '../../../theme/theme';
import type {
  BookmarkPayload,
  NewParagraph,
  PageContent as PageContentType,
  Shloka,
} from '../../../types/book';
import {CustomText} from '@/components/CustomText';
import {BookmarkModal} from './BookmarkModal';
import {useBookReader} from '@/context/BookReaderContext';
import {TextSizeType, TEXT_SIZES} from '@/constants/textSizes';
import {HtmlRenderer} from '@/components/HtmlRenderer/HtmlRenderer';
import {ShlokaTabView} from './ShlokaTabView';
import {PageContentSkeleton} from './PageContentSkeleton';
import {buildMdUrlWithLang, DEFAULT_LANGUAGE_MAP, hexToText} from '@/utils/toolkit';
import {PureContentRenderer} from './PureContentRenderer';
import { ContentLanguageSelectorFab } from './ContentLanguageSelectorFab';
import { useDispatch, useSelector } from 'react-redux';
import {
  setActiveLanguage,
} from '@/store/slices/bookReaderSlice';
interface PageContentProps {
  textSize: TextSizeType;
  isLoading?: boolean;
  bookId: string;
  onAddBookmark?: (bookmark: BookmarkPayload) => Promise<void>;
  isBookmarked?: boolean;
  onRemoveBookmark?: () => Promise<void>;
  onShlokaChange?: (
    info:
      | {
          number: string;
          total: number;
          onPrevious?: () => void;
          onNext?: () => void;
        }
      | undefined,
  ) => void;
}


const PageContent: React.FC<PageContentProps> = ({
  textSize = 'medium' as TextSizeType,
  isLoading,
  bookId,
  onAddBookmark,
  isBookmarked,
  onRemoveBookmark,
  onShlokaChange,
}) => {
  const [isBookmarkModalVisible, setIsBookmarkModalVisible] = useState(false);
  
  const {pageContent: selectedPage} = useBookReader();

  const dispatch = useDispatch();
  const storeActiveLanguage = useSelector(
    (s: any) => s.bookReader.activeLanguage 
  );
  const [selectedLanguage, setSelectedLanguage] = useState<'original' | string>('original');


  const pageLanguages = useMemo(() => {
    if (!selectedPage || !selectedPage.pages || selectedPage.pages.length === 0) return [];
    const arr = selectedPage.pages[0].availableTranslations || [];
    const codes = Array.isArray(arr) ? arr : String(arr).split(/\s+/);
    const unique = Array.from(new Set(codes.map((c: string) => c.trim().toLowerCase()).filter(Boolean)));
    return unique.filter((c) => !!DEFAULT_LANGUAGE_MAP[c]);
  }, [selectedPage]);

  const baseMdUrl = selectedPage?.pages?.[0]?.mdPageUrl || undefined;

  const effectiveMdUrl = useMemo(() => {
    if (!baseMdUrl) return undefined;
    if (selectedLanguage === 'original') return baseMdUrl;
    return buildMdUrlWithLang(baseMdUrl, selectedLanguage);
  }, [baseMdUrl, selectedLanguage]);

  useEffect(() => {
    // prefer the globally chosen language if this page supports it; otherwise show Original
    if (storeActiveLanguage && storeActiveLanguage !== 'base' && pageLanguages.includes(storeActiveLanguage)) {
      setSelectedLanguage(storeActiveLanguage);
    } else {
      setSelectedLanguage('original');
    }
    // re-run on bookId/page change or when the stored preference changes
  }, [bookId, selectedPage?.pages?.[0]?.pageId, pageLanguages.join('|'), storeActiveLanguage]);

  const handleLanguageChange = (code: 'original' | string) => {
    setSelectedLanguage(code);       // immediate UI update
    dispatch(setActiveLanguage(code)); // persist in store (redux-persist will make this survive restarts if enabled)
  };

  const {currentPageDetails, currentPage, showChat, tocType} = useBookReader();
  const handleBookmarkPress = () => {
    if (isBookmarked && onRemoveBookmark) {
      onRemoveBookmark();
    } else {
      setIsBookmarkModalVisible(true);
    }
  };

  const handleBookmark = async (bookmark: BookmarkPayload) => {
    if (onAddBookmark) {
      await onAddBookmark(bookmark);
    }
    setIsBookmarkModalVisible(false);
  };



  // Check if we should render pure content (URL-based)
  const shouldRenderPureContent = () => {
    return (
      selectedPage?.bookType === 'generic_002' &&
      selectedPage?.pages && 
      selectedPage.pages.length > 0 &&
      (selectedPage.pages[0].mdPageUrl || selectedPage.pages[0].htmlPageUrl)
    );
  };

  const renderBreadcrumb = () => {
    switch (currentPageDetails?.pageType) {
      case 'Sthanam':
        return (
          <CustomText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.breadcrumbText}>
            {currentPageDetails.tocHeader}
          </CustomText>
        );
      case 'Chapter':
        return (
          <CustomText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.breadcrumbText}>
            {currentPageDetails.sthanam}
            {' > '}
            {currentPageDetails.tocHeader}
          </CustomText>
        );
      case 'Section':
        return (
          <CustomText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.breadcrumbText}>
            {currentPageDetails.sthanam}
            {' > '}
            {currentPageDetails.chapter}
            {' > '}
            {currentPageDetails.tocHeader}
          </CustomText>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <PageContentSkeleton />;
  }

  if (!selectedPage) {
    return (
      <View style={styles.container}>
        <CustomText style={styles.noContent}>No content available</CustomText>
      </View>
    );
  }

  const renderShloka = (shloka: Shloka, index: number) => {
    return (
      <View key={index} style={styles.shlokaContainer}>
        <View style={styles.shlokaHeaderContainer}>
          <CustomText style={styles.shlokaNumber}>
            {shloka.numberFrom === shloka.numberTo
              ? `Verse ${shloka.numberFrom}`
              : `Verses ${shloka.numberFrom}-${shloka.numberTo}`}
          </CustomText>
          <View style={styles.shlokaNumberLine} />
        </View>

        <CustomText
          style={[
            styles.shlokaText,
            {fontSize: TEXT_SIZES[textSize].subtitle},
          ]}>
          {hexToText(shloka.excryptedText1)}
        </CustomText>

        <View style={styles.explanationContainer}>
          <View style={styles.explanationHeader}>
            <CustomText style={styles.explanationTitle}>Translation</CustomText>
            <Icon
              name="globe-outline"
              size={18}
              color={THEME.colors.text.primary}
            />
          </View>
          <View style={styles.explanationContent}>
            <CustomText
              style={[
                styles.explanationText,
                {fontSize: TEXT_SIZES[textSize].body},
              ]}>
              {hexToText(shloka.excryptedText2)}
            </CustomText>
          </View>
        </View>

        <View style={styles.explanationContainer}>
          <View style={styles.explanationHeader}>
            <CustomText style={styles.explanationTitle}>Explanation</CustomText>
            <Icon
              name="book-outline"
              size={18}
              color={THEME.colors.text.primary}
            />
          </View>
          <View style={styles.explanationContent}>
            <CustomText
              style={[
                styles.explanationText,
                {fontSize: TEXT_SIZES[textSize].body},
              ]}>
              {hexToText(shloka.excryptedText3)}
            </CustomText>
          </View>
        </View>

        <View style={styles.explanationContainer}>
          <View style={styles.explanationHeader}>
            <CustomText style={styles.explanationTitle}>
              Detailed Explanation
            </CustomText>
            <Icon
              name="information-circle-outline"
              size={18}
              color={THEME.colors.text.primary}
            />
          </View>
          <View style={styles.explanationContent}>
            <CustomText
              style={[
                styles.explanationText,
                {fontSize: TEXT_SIZES[textSize].body},
              ]}>
              {hexToText(shloka.excryptedText4 || '')}
            </CustomText>
          </View>
        </View>

        <View style={styles.explanationContainer}>
          <View style={styles.explanationHeader}>
            <CustomText style={styles.explanationTitle}>
              Modern Medical Perspective
            </CustomText>
            <Icon
              name="medkit-outline"
              size={18}
              color={THEME.colors.text.primary}
            />
          </View>
          <View style={styles.explanationContent}>
            <CustomText
              style={[
                styles.explanationText,
                {fontSize: TEXT_SIZES[textSize].body},
              ]}>
              {hexToText(shloka.excryptedText3)}
            </CustomText>
          </View>
        </View>

        {shloka.qna && shloka.qna.length > 0 && (
          <View style={styles.qnaSection}>
            <View style={styles.qnaTitleContainer}>
              <Icon
                name="help-circle-outline"
                size={20}
                color={THEME.colors.primary}
              />
              <CustomText style={styles.qnaTitle}>Q&A</CustomText>
            </View>

            {shloka.qna.map((qa, qIndex) => (
              <View key={qIndex} style={styles.qaContainer}>
                <View style={styles.qaButton}>
                  <CustomText style={styles.questionText}>
                    {hexToText(qa.question)}
                  </CustomText>
                </View>
                <View style={styles.answerContainer}>
                  <CustomText
                    style={[
                      styles.answerText,
                      {fontSize: TEXT_SIZES[textSize].body},
                    ]}>
                    {hexToText(qa.answer)}
                  </CustomText>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderParagraph = (paragraph: NewParagraph, index: number) => {
    return (
      <View key={`paragraph-${index}`} style={styles.paragraphContainer}>
        {paragraph.heading && (
          <CustomText
            style={[
              styles.paragraphHeader,
              {fontSize: TEXT_SIZES[textSize].subtitle},
            ]}>
            {paragraph.heading}
          </CustomText>
        )}
        <CustomText
          style={[
            styles.paragraphContent,
            {fontSize: TEXT_SIZES[textSize].body},
          ]}>
          {paragraph.content}
        </CustomText>
        {paragraph.footnotes && (
          <CustomText
            style={[
              styles.footnoteText,
              {fontSize: TEXT_SIZES[textSize].body},
            ]}>
            {paragraph.footnotes}
          </CustomText>
        )}
      </View>
    );
  };

  const renderContent = () => {
    return selectedPage?.content?.map((item, index) => {
      if (item.type === 'shloka') {
        return renderShloka(item as Shloka, index);
      } else if (item.type === 'paragraph') {
        return renderParagraph(item as NewParagraph, index);
      }
      return null;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.breadcrumb}>{renderBreadcrumb()}</View>
        {showChat && (
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleBookmarkPress}>
            <Icon
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={
                isBookmarked
                  ? THEME.colors.primary
                  : THEME.colors.text.secondary
              }
            />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* NEW: Pure content rendering for generic_002 pages with URLs */}
        {shouldRenderPureContent() ? (
          <>
          <ContentLanguageSelectorFab
              visible={Boolean(baseMdUrl && pageLanguages.length > 0)}
              languages={pageLanguages}
              value={selectedLanguage}
              onChange={handleLanguageChange}
              onPersistDefault={(code) => {
              }}
              bottomInset={16} // tweak if you have a bottom bar
              leftInset={16}
            />
            <PureContentRenderer
              bookId={bookId}
              pageId={selectedPage.pages![0].pageId}
              mdPageUrl={effectiveMdUrl}
              htmlPageUrl={selectedPage.pages![0].htmlPageUrl || undefined}
              textSize={textSize}
            />
          </>
        ) : (
          <>
            {/* EXISTING: Keep all current rendering logic unchanged */}
            {selectedPage.header && (
              <CustomText
                style={[styles.pageHeader, {fontSize: TEXT_SIZES[textSize].title}]}>
                {selectedPage.header}
              </CustomText>
            )}

            {selectedPage.description && (
              <View style={styles.descriptionContainer}>
                <HtmlRenderer html={selectedPage.description} textSize={textSize} renderAsSelectable={selectedPage.shlokas && selectedPage.shlokas.length === 0} />
              </View>
            )}


            {selectedPage.shlokas && selectedPage.shlokas.length > 0 && (
              <ShlokaTabView
                shlokas={selectedPage.shlokas}
                textSize={textSize}
                onShlokaChange={onShlokaChange}
              />
            )}
            {selectedPage?.content &&
              selectedPage?.content.length > 0 &&
              renderContent()}

            {selectedPage?.footnotes && (
              <CustomText
                style={[
                  styles.footnoteText,
                  {fontSize: TEXT_SIZES[textSize].body * 0.8},
                ]}>
                {selectedPage?.footnotes}
              </CustomText>
            )}
          </>
        )}
      </ScrollView>

      <BookmarkModal
        visible={isBookmarkModalVisible}
        onClose={() => setIsBookmarkModalVisible(false)}
        onSave={handleBookmark}
        bookId={bookId}
        pageNumber={currentPage ?? 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.tiny,
    paddingTop: 0,
    backgroundColor: THEME.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  pageHeader: {
    fontSize: THEME.typography.fontSize.huge,
    fontFamily: THEME.typography.fontFamily.bold,
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.medium,
    lineHeight: THEME.typography.lineHeight.xlarge,
    marginTop: THEME.spacing.regular,
  },
  descriptionContainer: {
    marginBottom: THEME.spacing.xlarge,
  },
  paragraph: {
    color: THEME.colors.text.secondary,
    lineHeight: THEME.typography.lineHeight.large,
    fontFamily: THEME.typography.fontFamily.regular,
    marginBottom: THEME.spacing.small,
  },
  topicsContainer: {
    marginBottom: THEME.spacing.xlarge,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.medium,
    padding: THEME.spacing.regular,
    ...THEME.shadows.small,
  },
  topicHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.regular,
  },
  topicsTitle: {
    fontSize: THEME.typography.fontSize.medium,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
    marginLeft: THEME.spacing.small,
  },
  topicText: {
    fontSize: THEME.typography.fontSize.regular,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.small,
  },
  shlokasContainer: {
    marginTop: THEME.spacing.large,
  },
  shlokaContainer: {
    marginBottom: THEME.spacing.xlarge,
    padding: THEME.spacing.regular,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.medium,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.small,
  },
  shlokaHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.regular,
  },
  shlokaNumber: {
    fontSize: THEME.typography.fontSize.small,
    color: THEME.colors.primary,
    fontFamily: THEME.typography.fontFamily.medium,
    paddingRight: THEME.spacing.small,
  },
  shlokaNumberLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  shlokaText: {
    fontSize: THEME.typography.fontSize.medium,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.regular,
    lineHeight: THEME.typography.lineHeight.large,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  explanationContainer: {
    marginTop: THEME.spacing.small,
    marginBottom: THEME.spacing.small,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: THEME.spacing.regular,
    backgroundColor: THEME.colors.secondary,
    borderRadius: THEME.borderRadius.small,
  },
  explanationHeaderActive: {
    backgroundColor: THEME.colors.primary + '20',
  },
  explanationTitle: {
    fontSize: THEME.typography.fontSize.regular,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
  },
  explanationContent: {
    marginTop: THEME.spacing.small,
    paddingHorizontal: THEME.spacing.regular,
  },
  explanationText: {
    color: THEME.colors.text.secondary,
    lineHeight: THEME.typography.lineHeight.regular,
    marginBottom: THEME.spacing.small,
  },
  link: {
    color: THEME.colors.primary,
    textDecorationLine: 'underline',
  },
  codeBlock: {
    backgroundColor: THEME.colors.secondary,
    padding: THEME.spacing.regular,
    borderRadius: THEME.borderRadius.medium,
    marginVertical: THEME.spacing.small,
  },
  codeText: {
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
  },
  inlineCode: {
    fontFamily: THEME.typography.fontFamily.medium,
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: THEME.spacing.tiny,
    borderRadius: THEME.borderRadius.small,
    color: THEME.colors.text.primary,
  },
  qnaSection: {
    marginTop: THEME.spacing.xlarge,
  },
  qnaTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.regular,
  },
  qnaTitle: {
    fontSize: THEME.typography.fontSize.medium,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
    marginLeft: THEME.spacing.small,
  },
  qaContainer: {
    marginBottom: THEME.spacing.regular,
  },
  qaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: THEME.spacing.regular,
    backgroundColor: THEME.colors.secondary,
    borderRadius: THEME.borderRadius.small,
  },
  qaButtonActive: {
    backgroundColor: THEME.colors.primary + '20',
  },
  questionText: {
    flex: 1,
    fontSize: THEME.typography.fontSize.regular,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
    marginRight: THEME.spacing.small,
  },
  answerContainer: {
    padding: THEME.spacing.regular,
    backgroundColor: THEME.colors.background,
  },
  answerText: {
    fontSize: THEME.typography.fontSize.regular,
    color: THEME.colors.text.secondary,
    lineHeight: THEME.typography.lineHeight.regular,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  breadcrumb: {
    flex: 1,
  },
  bookmarkButton: {
    marginLeft: THEME.spacing.medium,
    backgroundColor: 'transparent',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noContent: {
    fontSize: THEME.typography.fontSize.medium,
    color: THEME.colors.text.disabled,
    fontFamily: THEME.typography.fontFamily.medium,
    textAlign: 'center',
    padding: THEME.spacing.regular,
  },
  breadcrumbText: {
    fontSize: THEME.typography.fontSize.tiny,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
  },
  paragraphContainer: {
    marginBottom: THEME.spacing.large * 2,
    padding: THEME.spacing.small,
    backgroundColor: THEME.colors.background,
  },
  paragraphHeader: {
    fontSize: THEME.typography.fontSize.medium,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.small,
  },
  paragraphContent: {
    color: THEME.colors.text.secondary,
    lineHeight: THEME.typography.lineHeight.regular,
  },
  footnoteText: {
    color: THEME.colors.text.secondary,
    fontStyle: 'italic',
    marginTop: THEME.spacing.small,
    opacity: 0.7,
    textAlign: 'left',
  },
  description: {
    color: THEME.colors.text.secondary,
    lineHeight: THEME.typography.lineHeight.large,
    fontFamily: THEME.typography.fontFamily.regular,
  },
});



export default PageContent;
