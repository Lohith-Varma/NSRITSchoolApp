import React, {useEffect, useState} from 'react';
import {HelperText, Switch, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {CustomButton, CustomInput, DatePickerField, ScreenContainer, SectionHeader, SelectField} from '../../components';
import teacherService from '../../services/teachers/teacherService';
import {getAccessScope} from '../../services/rbacScope';
import {spacing} from '../../theme';
import {toISODate} from '../../utils/helpers/dateHelpers';

const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const EditTeacherScreen = ({navigation, route}) => {
  const teacherId = route.params?.teacherId;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  const {data: teacher} = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: () => teacherService.getTeacherProfile(teacherId),
    enabled: Boolean(teacherId),
  });

  useEffect(() => {
    if (!teacher) {
      return;
    }
    setForm({
      teacherId: teacher.id,
      userId: teacher.userId,
      branchId: teacher.branchId,
      fullName: teacher.fullName || teacher.user?.fullName || '',
      countryCode: teacher.countryCode || '+91',
      phoneNumber: teacher.phoneNumber || teacher.user?.phoneNumber || '',
      alternateMobileNumber: teacher.alternateMobileNumber || '',
      email: teacher.email || '',
      dateOfBirth: teacher.dateOfBirth || '',
      gender: teacher.gender || '',
      joiningDate: teacher.joiningDate || '',
      designation: teacher.designation || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      address: teacher.address || '',
      city: teacher.city || '',
      state: teacher.state || '',
      pincode: teacher.pincode || '',
      emergencyContact: teacher.emergencyContact || '',
      bloodGroup: teacher.bloodGroup || '',
      isActive: teacher.isActive ?? true,
    });
  }, [teacher]);

  const mutation = useMutation({
    mutationFn: payload => teacherService.updateTeacher(payload, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['teachers', user?.branchId]});
      queryClient.invalidateQueries({queryKey: ['teacher', teacherId]});
      navigation.goBack();
    },
    onError: err => setError(err.message),
  });

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  if (!form) {
    return (
      <ScreenContainer>
        <SectionHeader title="Loading Teacher" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Edit Teacher" subtitle="Teachers are branch-level resources" />
      <CustomInput label="Full Name" value={form.fullName} onChangeText={value => updateField('fullName', value)} />
      <CustomInput label="Mobile Number" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={value => updateField('phoneNumber', value)} />
      <SelectField label="Gender" value={form.gender} options={genderOptions} onChange={value => updateField('gender', value)} />
      <DatePickerField label="Joining Date" value={form.joiningDate} maximumDate={toISODate(new Date())} onChange={value => updateField('joiningDate', value)} />
      <CustomInput label="Designation" value={form.designation} onChangeText={value => updateField('designation', value)} />
      <CustomInput label="Alternate Mobile Number" keyboardType="phone-pad" value={form.alternateMobileNumber} onChangeText={value => updateField('alternateMobileNumber', value)} />
      <CustomInput label="Email" keyboardType="email-address" value={form.email} onChangeText={value => updateField('email', value)} />
      <DatePickerField label="Date of Birth" value={form.dateOfBirth} maximumDate={toISODate(new Date())} onChange={value => updateField('dateOfBirth', value)} />
      <CustomInput label="Qualification" value={form.qualification} onChangeText={value => updateField('qualification', value)} />
      <CustomInput label="Experience" value={form.experience} onChangeText={value => updateField('experience', value)} />
      <CustomInput label="Address" value={form.address} multiline onChangeText={value => updateField('address', value)} />
      <CustomInput label="City" value={form.city} onChangeText={value => updateField('city', value)} />
      <CustomInput label="State" value={form.state} onChangeText={value => updateField('state', value)} />
      <CustomInput label="Pincode" keyboardType="number-pad" value={form.pincode} onChangeText={value => updateField('pincode', value)} />
      <CustomInput label="Emergency Contact" keyboardType="phone-pad" value={form.emergencyContact} onChangeText={value => updateField('emergencyContact', value)} />
      <CustomInput label="Blood Group" value={form.bloodGroup} onChangeText={value => updateField('bloodGroup', value)} />
      <View style={styles.row}>
        <Text>Active Teacher</Text>
        <Switch value={form.isActive} onValueChange={value => updateField('isActive', value)} />
      </View>
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={() => mutation.mutate(form)}>
        Save Teacher
      </CustomButton>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
});

export default EditTeacherScreen;
