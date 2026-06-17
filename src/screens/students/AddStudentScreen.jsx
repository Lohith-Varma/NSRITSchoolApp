import React, {useMemo, useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {CustomButton, CustomInput, DatePickerField, ScreenContainer, SectionHeader, SelectField} from '../../components';
import {USER_ROLES} from '../../config/constants';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {isBeforeDate, isFutureDate, toISODate} from '../../utils/helpers/dateHelpers';

const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const blankForm = {
  academicClassId: '',
  sectionId: '',
  className: '',
  wingId: '',
  wingCode: '',
  fullName: '',
  gender: '',
  dateOfBirth: '',
  admissionDate: toISODate(new Date()),
  fatherName: '',
  fatherMobile: '',
  motherName: '',
  motherMobile: '',
  guardianName: '',
  guardianMobile: '',
  parentPhoneNumber: '',
  photoUrl: '',
  aadhaarNumber: '',
  bloodGroup: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  emergencyContact: '',
  transportRequired: false,
  countryCode: '+91',
};

const AddStudentScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = new Date().getFullYear();
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState('');

  const classesQuery = useQuery({
    queryKey: ['activeAcademicClasses', user?.branchId],
    queryFn: () => academicRepository.getActiveAcademicClasses(),
    enabled: Boolean(user?.branchId),
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId),
  });

  const classes = useMemo(() => {
    const items = (classesQuery.data || []).filter(item => item.branchId === user?.branchId);
    return user?.role === USER_ROLES.COORDINATOR
      ? items.filter(item => item.wing?.code === user.wing || item.wing === user.wing)
      : items;
  }, [classesQuery.data, user?.branchId, user?.role, user?.wing]);

  const sections = useMemo(
    () =>
      (sectionsQuery.data?.sections || []).filter(
        section => section.academicClassId === form.academicClassId,
      ),
    [sectionsQuery.data?.sections, form.academicClassId],
  );

  const classOptions = classes.map(item => ({label: item.name, value: item.id, item}));
  const sectionOptions = sections.map(item => ({label: item.name, value: item.id, item}));

  const mutation = useMutation({
    mutationFn: payload => studentService.createStudent(payload, scope),
    onSuccess: student => {
      Toast.show({type: 'success', text1: 'Student created successfully.'});
      queryClient.invalidateQueries({queryKey: ['students', user?.branchId]});
      queryClient.invalidateQueries({queryKey: ['wingStudents', user?.branchId, user?.wing]});
      navigation.replace('StudentDetails', {studentId: student.id});
    },
    onError: err => {
      console.log('[StudentCreate] UI create failed:', err);
      setError(err.message || 'Student creation failed.');
    },
  });

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));
  const validateDates = () => {
    if (isFutureDate(form.dateOfBirth)) {
      return 'Date of birth cannot be a future date.';
    }
    if (isFutureDate(form.admissionDate)) {
      return 'Admission date cannot be a future date.';
    }
    if (form.dateOfBirth && form.admissionDate && isBeforeDate(form.admissionDate, form.dateOfBirth)) {
      return 'Admission date cannot be before date of birth.';
    }
    return '';
  };
  const submit = () => {
    setError('');
    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      return;
    }
    console.log('[StudentCreate] Submit pressed:', {
      selectedClass: {
        id: form.academicClassId,
        name: form.className,
        wingId: form.wingId,
        wingCode: form.wingCode,
      },
      selectedSection: form.sectionId,
      branchId: user?.branchId,
    });

    if (!user?.branchId) {
      setError('Your account is not assigned to a branch.');
      return;
    }

    mutation.mutate(form);
  };

  return (
    <ScreenContainer>
      <SectionHeader title="Add Student" subtitle="Branch and admission number are assigned automatically" />
      <HelperText type="error" visible={Boolean(classesQuery.error)}>
        {classesQuery.error?.message || 'Unable to load classes.'}
      </HelperText>
      <SelectField
        label="Class *"
        value={form.academicClassId}
        options={classOptions}
        disabled={classesQuery.isLoading || !user?.branchId}
        onChange={(value, option) =>
          setForm(current => ({
            ...current,
            academicClassId: value,
            className: option.item.name,
            wingId: option.item.wingId,
            wingCode: option.item.wing?.code,
            sectionId: '',
          }))
        }
      />
      <HelperText type="error" visible={!classesQuery.isLoading && !classesQuery.error && Boolean(user?.branchId) && !classOptions.length}>
        No active classes are available for your branch.
      </HelperText>
      <HelperText type="error" visible={Boolean(sectionsQuery.error)}>
        {sectionsQuery.error?.message || 'Unable to load sections.'}
      </HelperText>
      <SelectField
        label="Section *"
        value={form.sectionId}
        options={sectionOptions}
        disabled={!form.academicClassId || sectionsQuery.isLoading}
        onChange={value => updateField('sectionId', value)}
      />
      <HelperText type="error" visible={Boolean(form.academicClassId) && !sectionsQuery.isLoading && !sectionsQuery.error && !sectionOptions.length}>
        No active sections exist for this class. Ask the Principal to create a section first.
      </HelperText>
      <SectionHeader title="Student Information" />
      <CustomInput label="Full Name *" value={form.fullName} onChangeText={value => updateField('fullName', value)} />
      <SelectField label="Gender *" value={form.gender} options={genderOptions} onChange={value => updateField('gender', value)} />
      <DatePickerField label="Date of Birth" value={form.dateOfBirth} maximumDate={toISODate(new Date())} required onChange={value => updateField('dateOfBirth', value)} />
      <DatePickerField label="Admission Date" value={form.admissionDate} minimumDate={form.dateOfBirth} maximumDate={toISODate(new Date())} required onChange={value => updateField('admissionDate', value)} />
      <SectionHeader title="Parent Information" />
      <CustomInput label="Father Name" value={form.fatherName} onChangeText={value => updateField('fatherName', value)} />
      <CustomInput label="Father Mobile" keyboardType="phone-pad" value={form.fatherMobile} onChangeText={value => updateField('fatherMobile', value)} />
      <CustomInput label="Mother Name" value={form.motherName} onChangeText={value => updateField('motherName', value)} />
      <CustomInput label="Mother Mobile" keyboardType="phone-pad" value={form.motherMobile} onChangeText={value => updateField('motherMobile', value)} />
      <CustomInput label="Guardian Name" value={form.guardianName} onChangeText={value => updateField('guardianName', value)} />
      <CustomInput label="Guardian Mobile" keyboardType="phone-pad" value={form.guardianMobile} onChangeText={value => updateField('guardianMobile', value)} />
      <SectionHeader title="Optional Information" />
      <CustomInput label="Student Photo URL" value={form.photoUrl} onChangeText={value => updateField('photoUrl', value)} />
      <CustomInput label="Aadhaar Number" keyboardType="number-pad" value={form.aadhaarNumber} onChangeText={value => updateField('aadhaarNumber', value)} />
      <CustomInput label="Blood Group" value={form.bloodGroup} onChangeText={value => updateField('bloodGroup', value)} />
      <CustomInput label="Address" value={form.address} multiline onChangeText={value => updateField('address', value)} />
      <CustomInput label="City" value={form.city} onChangeText={value => updateField('city', value)} />
      <CustomInput label="State" value={form.state} onChangeText={value => updateField('state', value)} />
      <CustomInput label="Pincode" keyboardType="number-pad" value={form.pincode} onChangeText={value => updateField('pincode', value)} />
      <CustomInput label="Emergency Contact" keyboardType="phone-pad" value={form.emergencyContact} onChangeText={value => updateField('emergencyContact', value)} />
      <SelectField
        label="Transport Required"
        value={form.transportRequired ? 'YES' : 'NO'}
        options={[{label: 'No', value: 'NO'}, {label: 'Yes', value: 'YES'}]}
        onChange={value => updateField('transportRequired', value === 'YES')}
      />
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={submit}>
        Add Student
      </CustomButton>
    </ScreenContainer>
  );
};

export default AddStudentScreen;
