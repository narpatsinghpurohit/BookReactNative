import React from 'react';
import {
  View,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  BackHandler,
} from 'react-native';
import {Drawer} from 'react-native-drawer-layout';
import THEME from '../../theme/theme';
import {TOCModalWrapper as TOCModal} from './components/TOCModalWrapper';
import PageContent from './components/PageContent';
import {PageContentSkeleton} from './components/PageContentSkeleton';
import {Navigation} from './components/Navigation';
import {ModeButton} from '@/types/chat';
import {useBookAndPages} from './useBookAndPages';
import {BookReaderProvider, useBookReader} from '@/context/BookReaderContext';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {RootState} from '@/store/store';
import {useRoute, useNavigation} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '@/types/navigation';
import BookAppBar from './components/BookAppBar';
import {ExitDialog} from './components/ExitDialog';
import {CombinedChat} from '@/components/GlobalChat';
import FontSizeModal from '@/components/FontSizeModal/FontSizeModal';
import {
  setDrawerOpen,
  setShowChat,
  setShowExitDialog,
  setTextSize,
  toggleSizeControls,
} from '@/store/slices/bookReaderSlice';
import { ChatSessionProvider, useChatSession } from '@/context/ChatSessionContext';
import { BookPage, PageType } from '@/types/book';

const {width} = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.85;

const AVAILABLE_MODES: ModeButton[] = [
  {
    mode: 'discuss',
    label: 'Discuss & Learn',
    icon: 'chat-bubble-outline',
  },
];

const TableOfContentsPageContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    textSize,
    showSizeControls,
    isDrawerOpen: open,
    showChat,
    showExitDialog,
  } = useAppSelector((state: RootState) => state.bookReader);
  const [currentShlokaInfo, setCurrentShlokaInfo] = React.useState<{
    number: string;
    total: number;
    onPrevious?: () => void;
    onNext?: () => void;
  }>();

  const route = useRoute<RouteProp<RootStackParamList, 'TableOfContents'>>();
  const navigation = useNavigation();


  const {
    isLoadingPage,
    searchQuery,
    setSearchQuery,
    handlePageSelect,
    handleAddBookmark,
    handleRemoveBookmark,
    isPageBookmarked,
    bookmarks,
  } = useBookAndPages(DRAWER_WIDTH);

  const {
    clearChat,
  } = useChatSession();
  
  const {bookId,pageContent, getPageByNumber, selectPage, currentPageDetails, tocType, currentPage} = useBookReader();

  
  React.useEffect(() => {
    const backAction = () => {
      if (showChat) {
        dispatch(setShowChat(false));
        return true;
      }
      
      selectPage({
        page:1,
        pageType:PageType.CoverPage,
        input:{
          bookid:bookId,
        },
        tocHeader:""
      });
      clearChat();
      
      if(currentPage !== 1){
        return true;
      }
      


      handleExitConfirm();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [showChat,currentPage, currentPageDetails, bookId]);

  const handleExitConfirm = () => {
    dispatch(setShowExitDialog(false));
    navigation.goBack();
  };

  const handleExitCancel = () => {
    dispatch(setShowExitDialog(false));
  };

  const renderDrawerContent = React.useCallback(() => {
    return (
      <TOCModal
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClose={() => dispatch(setDrawerOpen(false))}
        handlePageSelect={page => {
          const pageData = getPageByNumber(page);
          if(pageData){
            handlePageSelect(pageData);
          }
          dispatch(setDrawerOpen(false));
        }}
        bookmarks={bookmarks}
      />
    );
  }, [searchQuery, setSearchQuery, handlePageSelect, bookmarks]);

  return (
    <Drawer
      open={open}
      onOpen={() => dispatch(setDrawerOpen(true))}
      onClose={() => dispatch(setDrawerOpen(false))}
      renderDrawerContent={renderDrawerContent}
      drawerType="slide"
      drawerStyle={{
        backgroundColor: 'transparent',
        width: DRAWER_WIDTH,
      }}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={THEME.colors.background}
        />
        <BookAppBar
          title={route.params.title}
          onMenuPress={() => dispatch(setDrawerOpen(true))}
          onTextSizePress={() => dispatch(toggleSizeControls())}
          onBackPress={() => dispatch(setShowExitDialog(true))}
        />

        <FontSizeModal
          visible={showSizeControls}
          onClose={() => dispatch(toggleSizeControls())}
          currentTextSize={textSize}
          onSelectSize={size => dispatch(setTextSize(size))}
        />

        <View style={styles.contentContainer}>
          {isLoadingPage || !pageContent ? (
            <PageContentSkeleton />
          ) : (
            <PageContent
              textSize={textSize}
              isLoading={isLoadingPage}
              bookId={route.params.bookId}
              onAddBookmark={handleAddBookmark}
              onRemoveBookmark={handleRemoveBookmark}
              isBookmarked={isPageBookmarked}
              onShlokaChange={setCurrentShlokaInfo}
            />
          )}
        </View>

        {!isLoadingPage && pageContent &&
          <CombinedChat
            bookChatProps={{
              onClose: () => setShowChat(false),
              title: tocType === 'nested-generic-002' ? 'AI Mentor' : 'AI Assistant',
              availableModes: AVAILABLE_MODES,
              isOpen: showChat
            }}
            position={{ bottom: 76, right: 20 }}
            defaultChatType="book"
            enableBookChat={currentPageDetails?.pageType === 'Section'}
            enableGlobalChat={tocType === 'legacy'}
            enableSearch={tocType === 'nested-generic-002'}
            enableTestKnowledge={currentPageDetails?.pageType === 'Section' && tocType === 'nested-generic-002'}
          />
        }

        <Navigation
          onPreviousPage={(pageData: BookPage) => {
            selectPage(pageData);
            clearChat();
          }}
          onNextPage={(pageData: BookPage) => {
            selectPage(pageData);
            clearChat();
          }}
        />

        <ExitDialog
          visible={showExitDialog}
          onCancel={handleExitCancel}
          onConfirm={handleExitConfirm}
        />
      </SafeAreaView>
    </Drawer>
  );
};

export const TableOfContentsPage: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TableOfContents'>>();

  return (
    <BookReaderProvider bookId={route.params.bookId}>
      <ChatSessionProvider initialMode="test">
        <TableOfContentsPageContent />
      </ChatSessionProvider>
    </BookReaderProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  contentContainer: {
    flex: 1,
  },

  chatButton: {
    bottom: 76,
    right: 16,
  },
});
