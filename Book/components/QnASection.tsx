import React, {useState} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {MarkdownPreview} from '@/components/MarkdownPreview';
import THEME from '@/theme/theme';
import {TextSizeType} from '@/constants/textSizes';

interface QnASectionProps {
  qa: {
    question: string;
    answer: string;
  };
  textSize: TextSizeType;
  onToggle?: () => void;
}

export const QnASection: React.FC<QnASectionProps> = ({
  qa,
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

  return (
    <View style={styles.qaContainer}>
      <TouchableOpacity
        style={[styles.qaButton, isOpen && styles.qaButtonActive]}
        onPress={handleToggle}>
        <View style={styles.questionContainer}>
          <MarkdownPreview content={qa.question} textSize={textSize} />
        </View>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={THEME.colors.primary}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.answerContainer}>
          <MarkdownPreview content={qa.answer} textSize={textSize} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  qaContainer: {
    marginBottom: THEME.spacing.regular,
  },
  qaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: THEME.spacing.regular,
    backgroundColor: THEME.colors.secondary,
    borderRadius: THEME.borderRadius.small,
  },
  qaButtonActive: {
    backgroundColor: THEME.colors.primary + '20',
  },
  questionContainer: {
    flex: 1,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
    textDecorationColor: THEME.colors.text.primary,
    marginRight: THEME.spacing.small,
  },
  questionText: {
    flex: 1,
  },
  answerContainer: {
    padding: THEME.spacing.regular,
    backgroundColor: THEME.colors.background,
  },
});
