import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationState } from '../types/book.types';

interface NavigationProps extends NavigationState {
  onPreviousPage: () => void;
  onNextPage: () => void;
  onTOCPress?: () => void;
  showTOCButton?: boolean;
}

/**
 * Bottom navigation component for page navigation
 * Handles both sequential navigation (prev/next) and TOC access
 */
export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  totalPages,
  progress,
  canGoNext,
  canGoPrevious,
  onPreviousPage,
  onNextPage,
  onTOCPress,
  showTOCButton = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Navigation Controls */}
      <View style={styles.controlsContainer}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            !canGoPrevious && styles.navButtonDisabled,
          ]}
          onPress={onPreviousPage}
          disabled={!canGoPrevious}
        >
          <Icon
            name="chevron-back"
            size={24}
            color={canGoPrevious ? '#007bff' : '#ccc'}
          />
          <Text
            style={[
              styles.navButtonText,
              !canGoPrevious && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {/* Page Indicator and TOC Button */}
        <View style={styles.centerContainer}>
          <TouchableOpacity
            style={styles.pageIndicator}
            onPress={onTOCPress}
            disabled={!showTOCButton}
          >
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            {showTOCButton && (
              <Icon
                name="list-outline"
                size={16}
                color="#007bff"
                style={styles.tocIcon}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            !canGoNext && styles.navButtonDisabled,
          ]}
          onPress={onNextPage}
          disabled={!canGoNext}
        >
          <Text
            style={[
              styles.navButtonText,
              !canGoNext && styles.navButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <Icon
            name="chevron-forward"
            size={24}
            color={canGoNext ? '#007bff' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#f0f0f0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007bff',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    minWidth: 80,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  pageIndicator: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  pageText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tocIcon: {
    marginTop: 2,
  },
});