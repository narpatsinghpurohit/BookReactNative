import React, {useState} from 'react';
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import THEME from '../../../theme/theme';
import {Button} from '@/components/Button/Button';
import {BookmarkPayload} from '@/types/book';
import {useBookReader} from '@/context/BookReaderContext';

enum BookmarkType {
  SIMPLE = 'simple',
  IMPORTANT = 'important',
  QUICK_REFERENCE = 'quickreference',
}

interface BookmarkModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (bookmark: BookmarkPayload) => void;
  bookId: string;
  pageNumber: number;
}

interface FormErrors {
  type?: string;
  notes?: string;
}

export const BookmarkModal: React.FC<BookmarkModalProps> = ({
  visible,
  onClose,
  onSave,
  bookId,
  pageNumber,
}) => {
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<BookmarkType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!type) {
      newErrors.type = 'Please select a bookmark type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const {currentPageDetails} = useBookReader();

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const bookmark: BookmarkPayload = {
        bookId,
        pageNumber,
        type: type!,
        notes: notes.trim(),
        bookPage: currentPageDetails!,
      };
      onSave(bookmark);
      setNotes('');
      setType(null);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error saving bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dropdownData = [
    {label: 'Simple', value: BookmarkType.SIMPLE, icon: 'bookmark-outline'},
    {
      label: 'Important',
      value: BookmarkType.IMPORTANT,
      icon: 'alert-circle-outline',
    },
    {
      label: 'Quick Reference',
      value: BookmarkType.QUICK_REFERENCE,
      icon: 'flash-outline',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Bookmark</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                disabled={isLoading}>
                <Icon
                  name="close"
                  size={24}
                  color={THEME.colors.text.primary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer}>
              <Text style={styles.sectionTitle}>Bookmark Type</Text>
              <View>
                <View style={styles.bookmarkTypesContainer}>
                  {dropdownData.map(item => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.bookmarkTypeButton,
                        type === item.value &&
                          styles.bookmarkTypeButtonSelected,
                        errors.type && !type && styles.bookmarkTypeButtonError,
                      ]}
                      onPress={() => {
                        setType(item.value);
                        if (errors.type) {
                          setErrors(prev => ({...prev, type: undefined}));
                        }
                      }}
                      disabled={isLoading}>
                      <Icon
                        name={item.icon}
                        size={24}
                        color={
                          type === item.value
                            ? THEME.colors.primary
                            : THEME.colors.text.secondary
                        }
                        style={styles.bookmarkTypeIcon}
                      />
                      <Text
                        style={[
                          styles.bookmarkTypeText,
                          type === item.value &&
                            styles.bookmarkTypeTextSelected,
                        ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.type && (
                  <Text style={styles.errorText}>{errors.type}</Text>
                )}
              </View>

              <Text
                style={[styles.sectionTitle, {marginTop: THEME.spacing.small}]}>
                Notes
              </Text>
              <View>
                <TextInput
                  style={[styles.input, errors.notes && styles.inputError]}
                  placeholder="Add notes about this bookmark..."
                  value={notes}
                  onChangeText={text => {
                    setNotes(text);
                    if (errors.notes) {
                      setErrors(prev => ({...prev, notes: undefined}));
                    }
                  }}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={THEME.colors.text.secondary}
                  editable={!isLoading}
                />
                {errors.notes && (
                  <Text style={styles.errorText}>{errors.notes}</Text>
                )}
              </View>
            </ScrollView>

            <Button
              title="Save Bookmark"
              onPress={handleSave}
              disabled={isLoading}
              variant="primary"
              size="medium"
              style={styles.saveButton}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: THEME.spacing.large,
    minHeight: Dimensions.get('window').height * 0.5,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.small,
  },
  title: {
    fontSize: THEME.typography.fontSize.xlarge,
    fontFamily: THEME.typography.fontFamily.bold,
    color: THEME.colors.text.primary,
  },
  closeButton: {
    padding: THEME.spacing.tiny,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.regular,
    fontFamily: THEME.typography.fontFamily.medium,
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.regular,
  },
  bookmarkTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.small,
  },
  bookmarkTypeButton: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.medium,
    paddingVertical: THEME.spacing.small,
    paddingHorizontal: THEME.spacing.small,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: THEME.spacing.tiny,
  },
  bookmarkTypeButtonSelected: {
    backgroundColor: THEME.colors.primary + '10',
    borderColor: THEME.colors.primary,
  },
  bookmarkTypeButtonError: {
    borderColor: THEME.colors.error,
    borderWidth: 1,
  },
  bookmarkTypeIcon: {
    marginBottom: THEME.spacing.tiny,
  },
  bookmarkTypeText: {
    fontSize: THEME.typography.fontSize.small,
    color: THEME.colors.text.secondary,
    fontFamily: THEME.typography.fontFamily.medium,
    textAlign: 'center',
  },
  bookmarkTypeTextSelected: {
    color: THEME.colors.primary,
  },
  input: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.medium,
    padding: THEME.spacing.regular,
    color: THEME.colors.text.primary,
    fontSize: THEME.typography.fontSize.regular,
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: THEME.spacing.small,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  saveButton: {
    marginTop: 0,
  },

  inputError: {
    borderColor: THEME.colors.error,
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: THEME.typography.fontSize.small,
    marginBottom: THEME.spacing.medium,
    fontFamily: THEME.typography.fontFamily.regular,
    textAlign: 'center',
  },
});
