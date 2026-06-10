import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Modal, Portal, Text} from 'react-native-paper';
import {CustomButton, SelectField} from '../../components';
import {STUDENT_STATUS} from '../../config/academic';
import {colors, spacing} from '../../theme';

const options = Object.values(STUDENT_STATUS).map(value => ({label: value, value}));

const UpdateStudentStatusModal = ({visible, student, onDismiss, onSubmit, loading}) => {
  const [status, setStatus] = useState(student?.status || STUDENT_STATUS.ACTIVE);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text style={styles.title}>Update Student Status</Text>
        <SelectField label="Status" value={status} options={options} onChange={setStatus} />
        <View style={styles.actions}>
          <CustomButton mode="outlined" onPress={onDismiss}>Cancel</CustomButton>
          <CustomButton loading={loading} disabled={loading} onPress={() => onSubmit(status)}>Save</CustomButton>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    margin: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
});

export default UpdateStudentStatusModal;
