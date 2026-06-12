import React, {useEffect, useMemo, useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {CustomButton, CustomInput, ScreenContainer, SectionHeader, SelectField} from '../../components';
import {USER_ROLES} from '../../config/constants';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';

const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const EditStudentScreen = ({navigation, route}) => {
  const studentId = route.params?.studentId;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = new Date().getFullYear();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const effectiveBranchId = form?.branchId || user?.branchId;
  const effectiveScope = useMemo(
    () => ({...scope, branchId: effectiveBranchId || scope.branchId}),
    [effectiveBranchId, scope],
  );

  const detailsQuery = useQuery({
    queryKey: ['studentDetails', studentId],
    queryFn: () => studentService.getStudentDetails(studentId, scope),
    enabled: Boolean(studentId),
  });
  const classesQuery = useQuery({
    queryKey: ['academicClasses', effectiveBranchId],
    queryFn: () => academicRepository.getAcademicClasses(),
  });
  const sectionsQuery = useQuery({
    queryKey: ['sections', effectiveBranchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: effectiveBranchId, academicYear}, effectiveScope),
    enabled: Boolean(effectiveBranchId),
  });

  useEffect(() => {
    const student = detailsQuery.data?.student;
    if (!student) {
      return;
    }
    setForm({
      id: student.id,
      studentId: student.id,
      parentId: student.parentId,
      branchId: student.branchId,
      branchCode: student.branchCode || student.branch?.branchCode,
      admissionYear: student.admissionYear,
      academicClassId: student.academicClassId,
      wingId: student.academicClass?.wing?.id,
      wingCode: student.academicClass?.wing?.code,
      sectionId: student.sectionId,
      className: student.academicClass?.name,
      fullName: student.fullName || '',
      gender: student.gender || '',
      dateOfBirth: student.dateOfBirth || '',
      admissionDate: student.admissionDate || '',
      fatherName: student.parent?.fatherName || student.parent?.fullName || '',
      motherName: student.parent?.motherName || '',
      parentPhoneNumber: student.parent?.phoneNumber || student.phoneNumber || '',
      photoUrl: student.photoUrl || '',
      aadhaarNumber: student.aadhaarNumber || '',
      bloodGroup: student.bloodGroup || '',
      address: student.address || '',
      city: student.city || '',
      state: student.state || '',
      pincode: student.pincode || '',
      emergencyContact: student.emergencyContact || '',
      transportRequired: Boolean(student.transportRequired),
      countryCode: student.countryCode || '+91',
    });
  }, [detailsQuery.data?.student]);

  const classes = useMemo(() => {
    const items = (classesQuery.data || []).filter(item => item.branchId === effectiveBranchId);
    return user?.role === USER_ROLES.COORDINATOR
      ? items.filter(item => item.wing?.code === user.wing || item.wing === user.wing)
      : items;
  }, [classesQuery.data, effectiveBranchId, user?.role, user?.wing]);
  const sections = useMemo(
    () =>
      (sectionsQuery.data?.sections || []).filter(
        section => section.academicClassId === form?.academicClassId,
      ),
    [sectionsQuery.data?.sections, form?.academicClassId],
  );

  const mutation = useMutation({
    mutationFn: payload => studentService.updateStudent({...payload, branchId: payload.branchId || effectiveBranchId}, effectiveScope),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['studentDetails', studentId]});
      queryClient.invalidateQueries({queryKey: ['students', effectiveBranchId]});
      navigation.goBack();
    },
    onError: err => setError(err.message),
  });

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  if (!form) {
    return (
      <ScreenContainer>
        <SectionHeader title="Loading Student" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Edit Student" subtitle="Admission number cannot be changed" />
      <SelectField
        label="Class"
        value={form.academicClassId}
        options={classes.map(item => ({label: item.name, value: item.id, item}))}
        onChange={(value, option) =>
          setForm(current => ({
            ...current,
            academicClassId: value,
            className: option.item.name,
            wingId: option.item.wingId || option.item.wing?.id,
            wingCode: option.item.wing?.code,
            sectionId: '',
          }))
        }
      />
      <SelectField
        label="Section"
        value={form.sectionId}
        options={sections.map(item => ({label: item.name, value: item.id}))}
        onChange={value => updateField('sectionId', value)}
      />
      <CustomInput label="Full Name" value={form.fullName} onChangeText={value => updateField('fullName', value)} />
      <SelectField label="Gender" value={form.gender} options={genderOptions} onChange={value => updateField('gender', value)} />
      <CustomInput label="Date of Birth (YYYY-MM-DD)" value={form.dateOfBirth} onChangeText={value => updateField('dateOfBirth', value)} />
      <CustomInput label="Admission Date (YYYY-MM-DD)" value={form.admissionDate} onChangeText={value => updateField('admissionDate', value)} />
      <CustomInput label="Father Name" value={form.fatherName} onChangeText={value => updateField('fatherName', value)} />
      <CustomInput label="Mother Name" value={form.motherName} onChangeText={value => updateField('motherName', value)} />
      <CustomInput label="Parent Mobile Number" keyboardType="phone-pad" value={form.parentPhoneNumber} onChangeText={value => updateField('parentPhoneNumber', value)} />
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
      <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={() => mutation.mutate(form)}>
        Save Student
      </CustomButton>
    </ScreenContainer>
  );
};

export default EditStudentScreen;
