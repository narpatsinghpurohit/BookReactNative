import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import THEME from '@/theme/theme';
import { CustomText } from '@/components/CustomText';
import { DEFAULT_LANGUAGE_MAP } from '@/utils/toolkit';


type Props = {
  visible: boolean;                   // render or hide entirely
  languages: string[];                // e.g., ['hi', 'mr']
  value: 'original' | string;         // current selected language
  onChange: (code: 'original' | string) => void;
  onPersistDefault?: (code: 'original' | string) => void; // optional long-press handler
  label?: string;                     // optional small label above chips
  bottomInset?: number;               // safe area inset if needed
  leftInset?: number;                 // safe area inset if needed
};

export const ContentLanguageSelectorFab: React.FC<Props> = ({
  visible,
  languages,
  value,
  onChange,
  onPersistDefault,
  label = 'Content language',
  bottomInset = 16,
  leftInset = 16,
}) => {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const unique = Array.from(new Set(languages.map((c) => c.trim().toLowerCase()).filter(Boolean)));
    return unique.filter((c) => !!DEFAULT_LANGUAGE_MAP[c]);
  }, [languages]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.root,
        { bottom: bottomInset, left: leftInset },
      ]}
    >
      {open && (
        <View style={styles.sheet}>
          {!!label && (
            <CustomText style={styles.title} numberOfLines={1}>
              {label}
            </CustomText>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {/* Original */}
            <TouchableOpacity
              onPress={() => { onChange('original'); setOpen(false); }}
              onLongPress={() => onPersistDefault?.('original')}
              accessibilityRole="button"
              accessibilityLabel="Switch content language to Original"
              accessibilityState={{ selected: value === 'original' }}
              style={[styles.chip, value === 'original' && styles.chipSelected]}
            >
              <CustomText style={[styles.chipText, value === 'original' && styles.chipTextSelected]}>
                Original
              </CustomText>
            </TouchableOpacity>

            {/* Translations */}
            {items.map((code) => {
              const label = DEFAULT_LANGUAGE_MAP[code]?.label || code.toUpperCase();
              const selected = value === code;
              return (
                <TouchableOpacity
                  key={code}
                  onPress={() => { onChange(code); setOpen(false); }}
                  onLongPress={() => onPersistDefault?.(code)}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch content language to ${label}`}
                  accessibilityState={{ selected }}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <CustomText style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {label}
                  </CustomText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

     <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Toggle content language selector"
        style={styles.fab}
        onPress={() => setOpen((s) => !s)}
        >
        <Icon
            name={open ? 'close' : 'language-outline'}
            size={20}               // try 22–24 if you prefer larger
            color={THEME.colors.text.light}
        />
    </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    zIndex: 50,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.medium,
  },
  sheet: {
    maxWidth: Platform.select({ ios: 320, android: 340 }),
    backgroundColor: THEME.colors.background,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.small,
  },
  title: {
    fontSize: THEME.typography.fontSize.tiny,
    color: THEME.colors.text.secondary,
    marginBottom: 6,
  },
  chipsContainer: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  chipSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.secondary,
  },
  chipText: {
    color: THEME.colors.text.primary,
    fontSize: THEME.typography.fontSize.regular,
  },
  chipTextSelected: {
    color: THEME.colors.primary,
  },
});
