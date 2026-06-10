import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {HelperText, Modal, Portal, Text} from 'react-native-paper';
import {CustomButton, SelectField} from '../../components';
import {colors, spacing} from '../../theme';

const BulkSectionAssignmentModal = ({visible, sections, selectedStudentIds, onDismiss, onSubmit, loading}) => {
  const [sectionId, setSectionId] = useState('');
  const [error, setError] = useState('');
  const options = sections.map(section => ({
    label: `${section.academicClass?.name || ''}-${section.name}`,
    value: section.id,
    item: section,
  }));

  const submit = () => {
    const section = sections.find(item => item.id === sectionId);
    if (!section || !selectedStudentIds.length) {
      setError('Select students and a target section.');
      return;
    }
    setError('');
    onSubmit({
      studentIds: selectedStudentIds,
      sectionId,
      academicClassId: section.academicClassId,
      className: section.academicClass?.name,
      targetWing: section.academicClass?.wing?.code,
    });
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text style={styles.title}>Bulk Section Assignment</Text>
        <SelectField label="Target Section" value={sectionId} options={options} onChange={setSectionId} />
        <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
        <View style={styles.actions}>
          <CustomButton mode="outlined" onPress={onDismiss}>Cancel</CustomButton>
          <CustomButton loading={loading} disabled={loading} onPress={submit}>Assign</CustomButton>
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

export default BulkSectionAssignmentModal;
