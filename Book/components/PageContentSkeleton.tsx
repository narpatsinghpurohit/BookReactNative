import React from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import THEME from '../../../theme/theme';

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

export const PageContentSkeleton = () => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder style={styles.header} />

      <View style={styles.descriptionContainer}>
        <SkeletonPlaceholder style={styles.paragraph} />
        <SkeletonPlaceholder style={styles.paragraph} />
        <SkeletonPlaceholder style={[styles.paragraph, {width: '70%'}]} />
      </View>

      {/* Topics Section */}
      {/* <View style={styles.topicsContainer}>
        <View style={styles.topicHeader}>
          <SkeletonPlaceholder style={styles.topicIcon} />
          <SkeletonPlaceholder style={styles.topicTitle} />
        </View>
        <SkeletonPlaceholder style={styles.topicItem} />
        <SkeletonPlaceholder style={styles.topicItem} />
        <SkeletonPlaceholder style={[styles.topicItem, { width: '60%' }]} />
      </View> */}

      <View style={styles.shlokaContainer}>
        <View style={styles.shlokaHeader}>
          <SkeletonPlaceholder style={styles.shlokaNumber} />
          <View style={styles.shlokaLine} />
        </View>
        <SkeletonPlaceholder style={styles.shlokaText} />

        <View style={styles.explanationContainer}>
          <SkeletonPlaceholder style={styles.explanationHeader} />
          <View style={styles.explanationContent}>
            <SkeletonPlaceholder style={styles.explanationParagraph} />
            <SkeletonPlaceholder style={styles.explanationParagraph} />
            <SkeletonPlaceholder
              style={[styles.explanationParagraph, {width: '80%'}]}
            />
          </View>
        </View>

        <View style={styles.qnaContainer}>
          <View style={styles.qnaHeader}>
            <SkeletonPlaceholder style={styles.qnaIcon} />
            <SkeletonPlaceholder style={styles.qnaTitle} />
          </View>
          <SkeletonPlaceholder style={styles.qaItem} />
          <SkeletonPlaceholder style={styles.qaItem} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.regular,
    backgroundColor: THEME.colors.background,
  },
  skeleton: {
    backgroundColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.small,
  },
  header: {
    height: 32,
    width: '80%',
    marginBottom: THEME.spacing.medium,
    marginTop: THEME.spacing.regular,
  },
  descriptionContainer: {
    marginBottom: THEME.spacing.xlarge,
  },
  paragraph: {
    height: 16,
    width: '100%',
    marginBottom: THEME.spacing.small,
  },
  topicsContainer: {
    marginBottom: THEME.spacing.xlarge,
    padding: THEME.spacing.regular,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.medium,
    ...THEME.shadows.small,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.regular,
  },
  topicIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: THEME.spacing.small,
  },
  topicTitle: {
    height: 20,
    width: 120,
  },
  topicItem: {
    height: 16,
    width: '100%',
    marginBottom: THEME.spacing.small,
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
  shlokaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.regular,
  },
  shlokaNumber: {
    height: 20,
    width: 80,
    marginRight: THEME.spacing.small,
  },
  shlokaLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  shlokaText: {
    height: 60,
    width: '100%',
    marginBottom: THEME.spacing.regular,
  },
  explanationContainer: {
    marginTop: THEME.spacing.regular,
    marginBottom: THEME.spacing.large,
  },
  explanationHeader: {
    height: 48,
    width: '100%',
    marginBottom: THEME.spacing.small,
  },
  explanationContent: {
    marginTop: THEME.spacing.small,
    paddingHorizontal: THEME.spacing.regular,
  },
  explanationParagraph: {
    height: 16,
    width: '100%',
    marginBottom: THEME.spacing.small,
  },
  qnaContainer: {
    marginTop: THEME.spacing.xlarge,
  },
  qnaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.regular,
  },
  qnaIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: THEME.spacing.small,
  },
  qnaTitle: {
    height: 20,
    width: 150,
  },
  qaItem: {
    height: 48,
    width: '100%',
    marginBottom: THEME.spacing.regular,
  },
});
