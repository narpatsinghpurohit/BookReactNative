import React from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import THEME from '@/theme/theme';

const SkeletonPlaceholder = ({style}: {style: any}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return <Animated.View style={[styles.skeleton, style, {opacity}]} />;
};

const TOCItemSkeleton = () => (
  <View style={styles.tocItem}>
    <View style={styles.tocItemHeader}>
      <SkeletonPlaceholder style={styles.tocItemIcon} />
      <SkeletonPlaceholder style={styles.tocItemTitle} />
    </View>
    <View style={styles.subItems}>
      {[1, 2].map(index => (
        <View key={index} style={styles.subItem}>
          <SkeletonPlaceholder style={styles.subItemDot} />
          <SkeletonPlaceholder
            style={[styles.subItemText, {width: `${60 + Math.random() * 30}%`}]}
          />
        </View>
      ))}
    </View>
  </View>
);

export const TOCModalSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <SkeletonPlaceholder style={styles.searchInput} />
        </View>
        <SkeletonPlaceholder style={styles.closeButton} />
      </View>

      <View style={styles.content}>
        {[1, 2, 3, 4].map(index => (
          <TOCItemSkeleton key={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  skeleton: {
    backgroundColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.regular,
    gap: THEME.spacing.regular,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    height: 40,
    width: '100%',
    borderRadius: THEME.borderRadius.medium,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: THEME.spacing.regular,
  },
  tocItem: {
    marginBottom: THEME.spacing.large,
  },
  tocItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.small,
  },
  tocItemIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: THEME.spacing.small,
  },
  tocItemTitle: {
    height: 20,
    width: '70%',
  },
  subItems: {
    marginLeft: THEME.spacing.xlarge,
    gap: THEME.spacing.medium,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.small,
  },
  subItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subItemText: {
    height: 16,
  },
});

export default TOCModalSkeleton;
