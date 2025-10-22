import React, {useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {CustomText} from '@/components/CustomText';
import {MarkdownPreview} from '@/components/MarkdownPreview';
import THEME from '@/theme/theme';
import {hexToText} from '@/utils/toolkit';
import type {Shloka} from '@/types/book';
import {styles} from './styles';
import { TextSizeType, TEXT_SIZES } from '@/constants/textSizes';

interface ShlokaTikaExplanationProps {
  shloka: Shloka;
  textSize: TextSizeType;
  onToggle?: () => void;
}


export const ShlokaTikaExplanation: React.FC<ShlokaTikaExplanationProps> = ({
  shloka,
  textSize,
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setTimeout(() => {
      onToggle?.();
    }, 0);
  };

  if (!shloka.excryptedText5) return null;

  const explanation = hexToText(shloka.excryptedText5) || '';

  return (
    <View style={styles.explanationContainer}>
      <TouchableOpacity
        style={[
          styles.explanationHeader,
          isOpen && styles.explanationHeaderActive,
        ]}
        onPress={handleToggle}>
        <CustomText
          style={[
            styles.explanationTitle,
            {fontSize: TEXT_SIZES[textSize].subtitle},
          ]}>
          Tika
        </CustomText>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={THEME.colors.primary}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.explanationContent}>
          <MarkdownPreview content={explanation} textSize={textSize} />
        </View>
      )}
    </View>
  );
};
