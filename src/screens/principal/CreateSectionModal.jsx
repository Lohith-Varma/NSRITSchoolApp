import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {HelperText, Modal, Portal, Text} from 'react-native-paper';
import {CustomButton, CustomInput, SelectField} from '../../components';
import {SECTION_NAMES} from '../../config/academic';
import {colors, spacing} from '../../theme';

const sectionOptions = SECTION_NAMES.map(value => ({label: value, value}));

const CreateSectionModal = ({visible, classes, existingSections, onDismiss, onSubmit, loading}) => {
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    academicClassId: classes[0]?.id || '',
    name: SECTION_NAMES[0],
    academicYear: new Date().getFullYear(),
  });

  const classOptions = useMemo(
    () => classes.map(item => ({label: item.name, value: item.id, item})),
    [classes],
  );

  const selectedClass = classes.find(item => item.id === form.academicClassId);

  const submit = () => {
    const duplicate = existingSections.some(
      item =>
        item.academicClassId === form.academicClassId &&
        item.name === form.name &&
        Number(item.academicYear) === Number(form.academicYear),
    );

    if (duplicate) {
      setError('This section already exists for the selected class and academic year.');
      return;
    }

    setError('');
    onSubmit({
      ...form,
      className: selectedClass?.name,
      wing: selectedClass?.wing?.code,
      wingId: selectedClass?.wingId,
    });
  };

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text style={styles.title}>Create Section</Text>
        <SelectField label="Class" value={form.academicClassId} options={classOptions} onChange={value => updateField('academicClassId', value)} />
        <SelectField label="Section" value={form.name} options={sectionOptions} onChange={value => updateField('name', value)} />
        <CustomInput label="Academic Year" keyboardType="numeric" value={String(form.academicYear)} onChangeText={value => updateField('academicYear', value)} />
        <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
        <View style={styles.actions}>
          <CustomButton mode="outlined" onPress={onDismiss}>Cancel</CustomButton>
          <CustomButton loading={loading} disabled={loading} onPress={submit}>Create</CustomButton>
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

export default CreateSectionModal;
