import React, { useState, useRef, useMemo, createRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, findNodeHandle, DimensionValue, ActivityIndicator, Animated, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { useBookAndPages } from '../useBookAndPages';
import PagerView from 'react-native-pager-view';
import { CustomText } from '@/components/CustomText';
import THEME from '@/theme/theme';
import type { Shloka } from '@/types/book';
import { TextSizeType, TEXT_SIZES } from '@/constants/textSizes';
import Icon from 'react-native-vector-icons/Ionicons';
import { ShlokaExplanation } from './ShlokaExplanation';
import { ShlokaTikaExplanation } from './ShlokaTikaExplanation';
import { QnASection } from './QnASection';
import { hexToText } from '@/utils/toolkit';
import { NoteTakingModal } from './NoteTakingModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

interface ShlokaTabViewProps {
  shlokas: Shloka[];
  textSize: TextSizeType;
  onShlokaChange?: (info: { number: string; total: number; onPrevious?: () => void; onNext?: () => void; } | undefined) => void;
}


const SkeletonLoader = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderSkeletonTabs = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.navButtonContainer}>
          <View style={[styles.navButton, styles.skeletonBase]} />
        </View>
        <View style={styles.currentShlokaContainer}>
          <Animated.View
            style={[
              styles.skeletonBase,
              { opacity, width: '60%', height: 24 }
            ]}
          />
        </View>
        <View style={styles.navButtonContainer}>
          <View style={[styles.navButton, styles.skeletonBase]} />
        </View>
      </View>
    );
  };

  const renderSkeletonContent = () => {
    return (
      <View style={styles.shlokaContainer}>
        {/* Shloka Number */}
        <View style={styles.shlokaHeaderContainer}>
          <Animated.View
            style={[
              styles.skeletonBase,
              { height: 24, width: '40%', opacity }
            ]}
          />
          <View style={styles.shlokaNumberLine} />
        </View>

        <Animated.View
          style={[
            styles.skeletonBase,
            styles.skeletonText,
            { height: 80, opacity }
          ]}
        />

        <View style={{ marginTop: 20 }}>
          <Animated.View
            style={[
              styles.skeletonBase,
              { height: 24, width: '60%', opacity }
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonBase,
              styles.skeletonText,
              { height: 100, marginTop: 10, opacity }
            ]}
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <Animated.View
            style={[
              styles.skeletonBase,
              { height: 24, width: '50%', opacity }
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonBase,
              styles.skeletonText,
              { height: 120, marginTop: 10, opacity }
            ]}
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <Animated.View
            style={[
              styles.skeletonBase,
              { height: 24, width: '70%', opacity }
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonBase,
              styles.skeletonText,
              { height: 60, marginTop: 10, opacity }
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        {renderSkeletonTabs()}
      </View>
      {renderSkeletonContent()}
    </View>
  );
};

export const ShlokaTabView: React.FC<ShlokaTabViewProps> = ({ shlokas, textSize, onShlokaChange }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pagerHeight, setPagerHeight] = useState<DimensionValue>('100%');
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 2 });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pageHeights, setPageHeights] = useState<{ [key: number]: number }>({});

  const pagerRef = useRef<PagerView>(null);
  const shlokaListRef = useRef<ScrollView>(null);
  const measurementTimeout = useRef<NodeJS.Timeout>();
  const initialLoadTimeout = useRef<NodeJS.Timeout>();

  const parentRefs = useMemo<React.RefObject<View>[]>(
    () => Array.from({ length: shlokas.length }).map(() => createRef()),
    [shlokas.length]
  );
  
  const childRefs = useMemo<React.RefObject<View>[]>(
    () => Array.from({ length: shlokas.length }).map(() => createRef()),
    [shlokas.length]
  );

  useEffect(() => {
    initialLoadTimeout.current = setTimeout(() => {
      setIsInitialLoad(false);
      setVisibleRange({ start: 0, end: 5 });
    }, 500);

    return () => {
      if (initialLoadTimeout.current) {
        clearTimeout(initialLoadTimeout.current);
      }
    };
  }, []);

  const measurePage = useCallback((pageIndex: number) => {
    if (!childRefs[pageIndex]?.current || !parentRefs[pageIndex]?.current) return;

    const nodeHandle = findNodeHandle(parentRefs[pageIndex].current);
    if (!nodeHandle) return;

    childRefs[pageIndex].current?.measureLayout(
      nodeHandle,
      (x, y, width, height) => {
        setPageHeights(prev => ({
          ...prev,
          [pageIndex]: height + 64
        }));
        
        if (pageIndex === currentPage) {
          setPagerHeight(height + 64);
        }
      },
      () => {
        console.log('measureLayout error');
      }
    );
  }, [childRefs, parentRefs, currentPage]);

  const measureVisiblePages = useCallback(() => {
    if (measurementTimeout.current) {
      clearTimeout(measurementTimeout.current);
    }

    measurementTimeout.current = setTimeout(() => {
      for (let i = visibleRange.start; i <= visibleRange.end; i++) {
        measurePage(i);
      }
    }, 100);
  }, [measurePage, visibleRange]);

  useEffect(() => {
    measureVisiblePages();
  }, [measureVisiblePages, visibleRange]);

  useEffect(() => {
    if (pageHeights[currentPage]) {
      setPagerHeight(pageHeights[currentPage]);
    }
  }, [currentPage, pageHeights]);

  const handlePageSelected = useCallback((e: any) => {
    const newPage = e.nativeEvent.position;
    setCurrentPage(newPage);
    
    const start = Math.max(0, newPage - 2);
    const end = Math.min(shlokas.length - 1, newPage + 2);
    setVisibleRange({ start, end });
  }, [shlokas.length]);

  const handleContentChange = useCallback((pageIndex: number) => {
    measurePage(pageIndex);
  }, [measurePage]);

  const { 
    isNoteModalVisible,
    handleSaveNote,
    handleCloseNoteModal: handleCloseModal,
    handleOpenNoteModal: handleOpenModal
  } = useBookAndPages(0); 

  const scrollToActiveShloka = useCallback(() => {
    if (shlokaListRef.current) {
      shlokaListRef.current.scrollTo({
        x: currentPage*64, 
        animated: true
      });
    }
  }, [currentPage]);

  useEffect(() => {
    scrollToActiveShloka();
  }, [currentPage, scrollToActiveShloka]);

  useEffect(() => {
    if (onShlokaChange) {
      const currentShloka = shlokas[currentPage];
      onShlokaChange({
        number: currentShloka.numberTo && currentShloka.numberTo !== currentShloka.numberFrom 
          ? `${currentShloka.numberFrom}-${currentShloka.numberTo}` 
          : String(currentShloka.numberFrom),
        total: shlokas.length,
        onPrevious: currentPage > 0 ? () => pagerRef.current?.setPage(currentPage - 1) : undefined,
        onNext: currentPage < shlokas.length - 1 ? () => pagerRef.current?.setPage(currentPage + 1) : undefined
      });
    }
  }, [currentPage, shlokas, onShlokaChange]);

  useEffect(() => {
    return () => {
      if (onShlokaChange) {
        onShlokaChange(undefined);
      }
    };
  }, [onShlokaChange]);

  const renderShlokaList = () => {
    return (
      <View style={styles.shlokaListContainer}>
        <ScrollView
          ref={shlokaListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shlokaListContent}
        >
          {shlokas.map((shloka, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.shlokaTab,
                currentPage === index && styles.activeShlokaTab
              ]}
              onPress={() => {
                pagerRef.current?.setPage(index);
              }}
            >
              <CustomText 
                style={[
                  styles.shlokaTabText,
                  currentPage === index && styles.activeShlokaTabText
                ]}
              >
                {shloka.numberTo && shloka.numberTo !== shloka.numberFrom 
                  ? `${shloka.numberFrom}-${shloka.numberTo}` 
                  : shloka.numberFrom}
              </CustomText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTabIndicator = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.navButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.navButton,
              { opacity: currentPage === 0 ? 0.3 : 1 }
            ]}
            onPress={() => pagerRef.current?.setPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <Icon name="chevron-back" size={24} color={THEME.colors.primary} />
          </TouchableOpacity>
        </View>

        <View 
          style={styles.currentShlokaContainer}
        >
          <CustomText style={styles.currentShlokaText}>
            Shloka {shlokas[currentPage].numberTo && shlokas[currentPage].numberTo !== shlokas[currentPage].numberFrom 
              ? `${shlokas[currentPage].numberFrom}-${shlokas[currentPage].numberTo}` 
              : shlokas[currentPage].numberFrom}
          </CustomText>
        </View>

        <View style={styles.navButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.navButton,
              { opacity: currentPage === shlokas.length - 1 ? 0.3 : 1 }
            ]}
            onPress={() => pagerRef.current?.setPage(currentPage + 1)}
            disabled={currentPage === shlokas.length - 1}
          >
            <Icon name="chevron-forward" size={24} color={THEME.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderShloka = useCallback((shloka: Shloka, index: number) => {
    if (index < visibleRange.start || index > visibleRange.end) {
      return <View key={index} style={styles.pageContainer} />;
    }

    if (isInitialLoad && index > 2) {
      return <View key={index} style={styles.pageContainer} />;
    }

    return (
      <View key={index} style={styles.pageContainer}>
        <View ref={parentRefs[index]}>
          <View ref={childRefs[index]}>
            <View style={styles.shlokaContainer}>
              <View style={styles.shlokaHeaderContainer}>
                <View style={styles.shlokaNumberContainer}>
                  <CustomText style={[styles.shlokaNumber, { fontSize: TEXT_SIZES[textSize].subtitle }]}>
                    Shloka {shloka.numberTo && shloka.numberTo !== shloka.numberFrom ? `${shloka.numberFrom}-${shloka.numberTo}` : shloka.numberFrom}
                  </CustomText>
                  {/* <TouchableOpacity 
                    style={styles.noteButton}
                    onPress={handleOpenModal}
                  >
                    <Icon name="document-text-outline" size={20} color={THEME.colors.primary} />
                  </TouchableOpacity> */}
                </View>
                <View style={styles.shlokaNumberLine} />
              </View>

              <CustomText style={[styles.shlokaText, { fontSize: TEXT_SIZES[textSize].body }]}>
                {hexToText(shloka.excryptedText1) || ''}
              </CustomText>

              <ShlokaTikaExplanation 
                shloka={shloka} 
                textSize={textSize} 
                onToggle={() => handleContentChange(index)}
              />
              <ShlokaExplanation 
                shloka={shloka} 
                textSize={textSize}
                onToggle={() => handleContentChange(index)}
              />
              
              {shloka.qna && shloka.qna.length > 0 && (
                <View style={styles.qnaSection}>
                  <View style={styles.qnaTitleContainer}>
                    <Icon name="help-circle" size={20} color={THEME.colors.primary} />
                    <CustomText style={[styles.qnaTitle, { fontSize: TEXT_SIZES[textSize].subtitle }]}>
                      Questions & Answers
                    </CustomText>
                  </View>
                  {shloka.qna.map((qa, qIndex) => (
                    <QnASection
                      key={`qa-${index}-${qIndex}`}
                      qa={qa}
                      textSize={textSize}
                      onToggle={() => handleContentChange(index)}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }, [visibleRange, textSize, handleContentChange, handleOpenModal, isInitialLoad]);

  if (isInitialLoad) {
    return <SkeletonLoader />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.header}>
        {renderTabIndicator()}
      </View>

      {renderShlokaList()}

      <NoteTakingModal
        isVisible={isNoteModalVisible}  
        onClose={handleCloseModal}
        shlokaFrom={shlokas[currentPage].numberFrom}
        shlokaTo={shlokas[currentPage].numberTo}
        onSave={handleSaveNote}
      />
      
      <PagerView
        ref={pagerRef}
        style={[styles.pagerView, { height: pagerHeight }]}
        initialPage={0}
        overScrollMode={'always'}
        onPageSelected={handlePageSelected}
        offscreenPageLimit={1}
      >
        {shlokas.map((shloka, index) => renderShloka(shloka, index))}
      </PagerView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: THEME.spacing.small,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.tiny,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  navButtonContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.background,
    ...THEME.shadows.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentShlokaContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: THEME.spacing.tiny,
  },
  currentShlokaText: {
    fontSize: THEME.typography.fontSize.large,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.primary,
  },
  pagerView: {
    minHeight: '100%',
  },
  pageContainer: {
    flex: 1,
  },
  shlokaContainer: {
    padding: THEME.spacing.regular,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.medium,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    margin: THEME.spacing.small,
    ...THEME.shadows.small,
  },
  shlokaHeaderContainer: {
    marginBottom: THEME.spacing.regular,
  },
  shlokaNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.tiny,
  },
  shlokaNumber: {
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
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.regular,
    lineHeight: THEME.typography.lineHeight.large,
    textAlign: 'center',
    fontStyle: 'italic',
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
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
    marginLeft: THEME.spacing.small,
  },
  noteButton: {
    padding: THEME.spacing.tiny,
    borderRadius: THEME.borderRadius.circle,
    backgroundColor: THEME.colors.secondary + '30',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: THEME.spacing.regular,
    color: THEME.colors.text.secondary,
    fontSize: THEME.typography.fontSize.regular,
  },
  skeletonBase: {
    backgroundColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.medium,
  },
  skeletonText: {
    width: '100%',
    borderRadius: THEME.borderRadius.medium,
  },
  dropdownIcon: {
    marginLeft: THEME.spacing.tiny,
  },
  shlokaListContainer: {
    backgroundColor: THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingVertical: THEME.spacing.small,
  },
  shlokaListContent: {
    paddingHorizontal: THEME.spacing.regular,
    gap: THEME.spacing.tiny,
  },
  shlokaTab: {
    paddingHorizontal: THEME.spacing.small,
    paddingVertical: THEME.spacing.small,
    borderRadius: THEME.borderRadius.medium,
    backgroundColor: THEME.colors.secondary + '20',
    marginHorizontal: THEME.spacing.tiny,
    textAlign: 'center',
    alignItems: 'center',
    // width: 64, 
  },
  activeShlokaTab: {
    backgroundColor: THEME.colors.primary,
  },
  shlokaTabText: {
    fontSize: THEME.typography.fontSize.regular,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
  },
  activeShlokaTabText: {
    color: THEME.colors.background,
  },
}); 