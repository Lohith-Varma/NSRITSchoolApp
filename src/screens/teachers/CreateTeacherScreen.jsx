import React, {useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {CustomButton, CustomInput, DatePickerField, ScreenContainer, SectionHeader, SelectField} from '../../components';
import {STAFF_TYPE_LABELS, STAFF_TYPES} from '../../config/constants';
import teacherService from '../../services/teachers/teacherService';
import {getAccessScope} from '../../services/rbacScope';
import {toISODate} from '../../utils/helpers/dateHelpers';

const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));
const staffTypeOptions = [
  {label: STAFF_TYPE_LABELS[STAFF_TYPES.TEACHING], value: STAFF_TYPES.TEACHING},
  {label: STAFF_TYPE_LABELS[STAFF_TYPES.SUPPORTING], value: STAFF_TYPES.SUPPORTING},
];

const initialForm = {
  fullName: '',
  phoneNumber: '',
  alternateMobileNumber: '',
  email: '',
  gender: '',
  joiningDate: toISODate(new Date()),
  designation: '',
  staffType: STAFF_TYPES.TEACHING,
  dateOfBirth: '',
  qualification: '',
  experience: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  emergencyContact: '',
  bloodGroup: '',
  countryCode: '+91',
};

const CreateTeacherScreen = ({navigation}) => {
  const queryClient = useQueryClient();
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  const mutation = useMutation({
    mutationFn: payload => teacherService.createTeacher(payload, scope),
    onSuccess: teacher => {
      queryClient.invalidateQueries({queryKey: ['teachers', user?.branchId]});
      navigation.replace('TeacherDetails', {teacherId: teacher.id});
    },
    onError: err => setError(err.message),
  });

  return (
    <ScreenContainer>
      <SectionHeader title="Create Teacher" subtitle="Branch is inherited automatically" />
      <CustomInput label="Full Name *" value={form.fullName} onChangeText={value => updateField('fullName', value)} />
      <CustomInput label="Mobile Number *" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={value => updateField('phoneNumber', value)} />
      <SelectField label="Gender *" value={form.gender} options={genderOptions} onChange={value => updateField('gender', value)} />
      <DatePickerField label="Joining Date" value={form.joiningDate} maximumDate={toISODate(new Date())} required onChange={value => updateField('joiningDate', value)} />
      <CustomInput label="Designation *" value={form.designation} onChangeText={value => updateField('designation', value)} />
      <SelectField label="Staff Type *" value={form.staffType} options={staffTypeOptions} onChange={value => updateField('staffType', value)} />
      <SectionHeader title="Optional Information" />
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
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={() => mutation.mutate(form)}>
        Create Teacher
      </CustomButton>
    </ScreenContainer>
  );
};

export default CreateTeacherScreen;
