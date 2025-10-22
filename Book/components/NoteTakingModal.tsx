import {CustomText} from '@/components/CustomText';
import THEME from '@/theme/theme';
import React from 'react';
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '@/components/Button/Button';

type NoteTakingModalProps = {
  isVisible: boolean;
  onClose: () => void;
  shlokaFrom: number;
  shlokaTo: number | null;
  initialNote?: string;
  onSave: (note: string, shlokaFrom: number, shlokaTo: number | null) => void;
};

export const NoteTakingModal: React.FC<NoteTakingModalProps> = ({
  isVisible,
  onClose,
  shlokaFrom,
  shlokaTo,
  initialNote = '',
  onSave,
}) => {
  const [note, setNote] = React.useState(initialNote);
  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = React.useCallback(() => {
    onSave(note, shlokaFrom, shlokaTo);
    onClose();
  }, [note, onSave, onClose]);

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Icon
                      name="book-outline"
                      size={24}
                      color={THEME.colors.primary}
                    />
                    <CustomText style={styles.modalTitle}>
                      Notes for Shloka {shlokaFrom}
                      {shlokaTo ? `-${shlokaTo}` : ''}
                    </CustomText>
                  </View>
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => handleClose()}>
                    <Icon
                      name="close"
                      size={24}
                      color={THEME.colors.text.secondary}
                    />
                  </Pressable>
                </View>

                <View style={styles.noteInputContainer}>
                  <TextInput
                    style={styles.noteInput}
                    multiline
                    placeholder="Write your notes here..."
                    placeholderTextColor={THEME.colors.text.secondary}
                    value={note}
                    onChangeText={setNote}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    style={styles.button}
                    onPress={handleSave}
                    title="Save Note"
                    variant="primary"
                    size="small"
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  keyboardAvoidingView: {
    width: '100%',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.large,
    overflow: 'hidden',
    ...THEME.shadows.large,
    maxHeight: '100%',
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: THEME.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.small,
  },
  modalTitle: {
    fontSize: THEME.typography.fontSize.large,
    fontFamily: THEME.typography.fontFamily.bold,
    color: THEME.colors.text.primary,
  },
  closeButton: {
    padding: THEME.spacing.tiny,
    borderRadius: THEME.borderRadius.circle,
  },
  noteInputContainer: {
    padding: THEME.spacing.small,
  },
  noteInput: {
    height: 180,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.medium,
    padding: THEME.spacing.small,
    color: THEME.colors.text.primary,
    fontFamily: THEME.typography.fontFamily.regular,
    fontSize: THEME.typography.fontSize.regular,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: THEME.spacing.medium,
    padding: THEME.spacing.small,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.medium,
    borderRadius: THEME.borderRadius.medium,
    gap: THEME.spacing.small,
  },
  cancelButton: {
    backgroundColor: THEME.colors.error + '20',
  },
  saveButton: {
    backgroundColor: THEME.colors.primary,
  },
  buttonText: {
    color: THEME.colors.text.primary,
    fontFamily: THEME.typography.fontFamily.medium,
    fontSize: THEME.typography.fontSize.regular,
  },
});
