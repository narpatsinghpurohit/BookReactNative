import React from 'react';
import {View, StyleSheet, Platform, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import THEME from '../../../theme/theme';
import {CustomText} from '@/components/CustomText';

interface BookAppBarProps {
  title: string;
  onMenuPress: () => void;
  onTextSizePress: () => void;
  onBackPress: () => void;
}

const BookAppBar: React.FC<BookAppBarProps> = ({
  title,
  onMenuPress,
  onTextSizePress,
  onBackPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMenuPress}
            activeOpacity={0.6}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <View style={styles.iconBackground}>
              <Icon
                name="menu-outline"
                size={24}
                color={THEME.colors.primary}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <CustomText style={styles.title} numberOfLines={1}>
              {title}
            </CustomText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onTextSizePress}
          activeOpacity={0.6}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <View style={styles.iconBackground}>
            <Icon name="text" size={22} color={THEME.colors.primary} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBackPress}
          activeOpacity={0.6}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <View style={styles.iconBackground}>
            <Icon
              name="exit-outline"
              size={24}
              color={THEME.colors.primary}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.background,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    borderBottomWidth: 1,
    borderBottomColor: `${THEME.colors.border}40`,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: THEME.colors.background,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
    letterSpacing: -0.4,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${THEME.colors.primary}15`,
    borderRadius: 10,
  },
});

export default BookAppBar;
