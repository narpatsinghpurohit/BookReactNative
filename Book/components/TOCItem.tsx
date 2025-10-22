import {CustomText} from '@/components/CustomText';
import THEME from '@/theme/theme';
import {TableOfContents} from '@/types/book';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const TOCItem = React.memo(
  ({
    item,
    onPress,
    isExpanded,
    onToggle,
    isSelected,
    hasChildren,
  }: {
    item: TableOfContents;
    onPress: () => void;
    isExpanded: boolean;
    onToggle: () => void;
    isSelected: boolean;
    hasChildren: boolean;
  }) => {
    // Only apply status logic if isActive is defined and for appropriate levels
    const hasIsActiveProperty = item.isActive !== undefined;
    const shouldApplyDisabledLogic = hasIsActiveProperty && item.level >= 2;
    const shouldApplyReviewLogic = hasIsActiveProperty && item.level >= 3;
    
    // Determine the state of the item
    const isDisabled = shouldApplyDisabledLogic ? !item.isActive : false;
    const isReview = shouldApplyReviewLogic ? (item.isActive && !item.verification) : false;
    const isCompleted = shouldApplyDisabledLogic ? (item.isActive && item.verification) : false;

    // Get status info for Coming Soon badge only
    const getStatusInfo = () => {
      // Coming Soon for level 2 and 3 when not active (and isActive property exists)
      if (shouldApplyDisabledLogic && !item.isActive) {
        return {
          text: 'Coming Soon',
          style: styles.comingSoonBadge,
          textStyle: styles.comingSoonText,
        };
      }
      
      return null;
    };

    const statusInfo = getStatusInfo();

    if(isDisabled){
      return null;
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.tocItem,
          {paddingLeft: (item.level - 1) * 20 + THEME.spacing.regular},
          isSelected && styles.selectedItem,
          isDisabled && styles.disabledItem,
        ]}>
        <View style={styles.tocItemContent}>
          {/* Expand/Collapse Button */}
          <TouchableOpacity
            onPress={onToggle}
            style={styles.expandButton}
            disabled={!hasChildren || isDisabled}>
            {hasChildren && item.level !== 1 && (
              <Icon
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={18}
                color={
                  isDisabled
                    ? THEME.colors.text.disabled
                    : THEME.colors.text.primary
                }
              />
            )}
          </TouchableOpacity>

          {/* Content Container */}
          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <CustomText
                style={[
                  styles.tocItemText,
                  isSelected && styles.selectedText,
                  isDisabled && styles.disabledText,
                  item.level === 1 && styles.levelOneText,
                  item.level === 2 && styles.levelTwoText,
                  item.level >= 3 && styles.levelThreeText,
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
                >
                {item.header} {item.title ? `${item.title}` : ''}
              </CustomText>

              {/* Coming Soon Badge */}
              {statusInfo && (
                <View style={[styles.statusBadge, statusInfo.style]}>
                  <CustomText style={[styles.statusText, statusInfo.textStyle]}>
                    {statusInfo.text}
                  </CustomText>
                </View>
              )}
            </View>

            {/* Page Number */}
            {item.page && (
              <CustomText
                style={[
                  styles.pageNumber,
                  isDisabled && styles.disabledText,
                ]}>
                {item.logicalPageNumber || item.page}
              </CustomText>
            )}
          </View>

          {/* Status Icons */}
          <View style={styles.iconContainer}>
            {/* Review Icon - Blue Clock */}
            {isReview && (
              <View style={styles.reviewIndicator}>
                <Icon
                  name="time-outline"
                  size={20}
                  color={THEME.colors.info}
                />
              </View>
            )}

            {/* Completion Indicator - Green Check */}
            {isCompleted && (
              <View style={styles.completionIndicator}>
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={THEME.colors.success}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  tocItem: {
    minHeight: 52,
    justifyContent: 'center',
    paddingRight: THEME.spacing.regular,
    paddingVertical: THEME.spacing.small,
    borderRadius: THEME.borderRadius.small,
    marginVertical: 2,
    marginHorizontal: THEME.spacing.small,
  },
  tocItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.small,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  tocItemText: {
    fontSize: THEME.typography.fontSize.regular,
    color: THEME.colors.text.primary,
    lineHeight: THEME.typography.lineHeight.small,
    marginBottom: 2,
  },
  levelOneText: {
    fontSize: THEME.typography.fontSize.medium,
    color: THEME.colors.primary,
    fontWeight: '600',
    lineHeight: THEME.typography.lineHeight.regular,
  },
  levelTwoText: {
    fontSize: THEME.typography.fontSize.regular,
    fontWeight: '500',
    lineHeight: THEME.typography.lineHeight.small,
  },
  levelThreeText: {
    fontSize: THEME.typography.fontSize.small,
    fontWeight: '400',
    color: THEME.colors.text.secondary,
  },
  selectedItem: {
    backgroundColor: THEME.colors.selected,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  selectedText: {
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  disabledItem: {
    opacity: 0.5,
  },
  disabledText: {
    color: THEME.colors.text.disabled,
  },
  pageNumber: {
    fontSize: THEME.typography.fontSize.small,
    color: THEME.colors.text.secondary,
    minWidth: 35,
    textAlign: 'right',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: THEME.spacing.small,
    paddingVertical: THEME.spacing.tiny,
    borderRadius: THEME.borderRadius.regular,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusText: {
    fontSize: THEME.typography.fontSize.tiny,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comingSoonBadge: {
    backgroundColor: THEME.colors.text.disabled + '20',
    borderWidth: 1,
    borderColor: THEME.colors.text.disabled,
  },
  comingSoonText: {
    color: THEME.colors.text.disabled,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: THEME.spacing.small,
  },
  reviewIndicator: {
    marginRight: THEME.spacing.tiny,
  },
  completionIndicator: {
    // No margin needed as it's the last item
  },
});

export default TOCItem;
