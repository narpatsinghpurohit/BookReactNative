import {StyleSheet} from 'react-native';
import THEME from '@/theme/theme';

export const styles = StyleSheet.create({
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
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
  },
  explanationContent: {
    marginTop: THEME.spacing.small,
    paddingHorizontal: THEME.spacing.regular,
  },
});
