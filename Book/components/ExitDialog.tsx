import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import THEME from '../../../theme/theme';
import {CustomText} from '@/components/CustomText';
import {Button} from '@/components/Button/Button';

interface ExitDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const {width} = Dimensions.get('window');

export const ExitDialog: React.FC<ExitDialogProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              <View style={styles.header}>
                <CustomText style={styles.title}>Exit Book</CustomText>
                <CustomText style={styles.description}>
                  Are you sure you want to exit the book?
                </CustomText>
              </View>

              <View style={styles.footer}>
                <Button
                  title="Cancel"
                  onPress={onCancel}
                  variant="outline"
                  size="small"
                  style={styles.button}
                />
                <Button
                  title="Exit"
                  onPress={onConfirm}
                  variant="primary"
                  size="small"
                  style={styles.button}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: width * 0.85,
    maxWidth: 425,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.large,
    padding: 24,
    elevation: 5,
    shadowColor: THEME.colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: THEME.typography.fontSize.large,
    fontFamily: THEME.typography.fontFamily.bold,
    color: THEME.colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: THEME.typography.fontSize.regular,
    color: THEME.colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
