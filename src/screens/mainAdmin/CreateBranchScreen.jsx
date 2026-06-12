import React, {useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {
  CustomButton,
  CustomInput,
  Header,
  ScreenContainer,
  SelectField,
} from '../../components';
import {createBranch} from '../../store/slices/branchSlice';

const statusOptions = [
  {label: 'Active', value: 'ACTIVE'},
  {label: 'Inactive', value: 'INACTIVE'},
];

const CreateBranchScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {loading, error} = useSelector(state => state.branches);
  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    status: 'ACTIVE',
  });

  const updateField = (field, value) =>
    setForm(current => ({
      ...current,
      [field]: field === 'code' ? String(value || '').toUpperCase().slice(0, 2) : value,
    }));

  const handleSubmit = async () => {
    const action = await dispatch(createBranch(form));
    if (createBranch.fulfilled.match(action)) {
      navigation.replace('BranchDetails', {branchId: action.payload.id});
    }
  };

  const isComplete = [
    form.name,
    form.code,
    form.address,
    form.city,
    form.state,
    form.pincode,
    form.phone,
    form.email,
    form.status,
  ].every(value => String(value || '').trim());

  return (
    <ScreenContainer>
      <Header
        title="Create Branch"
        subtitle="Add a campus and make it available for branch admins"
      />
      <CustomInput
        label="Branch name"
        value={form.name}
        onChangeText={value => updateField('name', value)}
      />
      <CustomInput
        label="Branch code"
        value={form.code}
        onChangeText={value => updateField('code', value)}
        autoCapitalize="characters"
      />
      <CustomInput
        label="City"
        value={form.city}
        onChangeText={value => updateField('city', value)}
      />
      <CustomInput
        label="Address"
        value={form.address}
        onChangeText={value => updateField('address', value)}
        multiline
      />
      <CustomInput
        label="State"
        value={form.state}
        onChangeText={value => updateField('state', value)}
      />
      <CustomInput
        label="Pincode"
        value={form.pincode}
        onChangeText={value => updateField('pincode', value)}
        keyboardType="number-pad"
      />
      <CustomInput
        label="Contact number"
        value={form.phone}
        onChangeText={value => updateField('phone', value)}
        keyboardType="phone-pad"
      />
      <CustomInput
        label="Email"
        value={form.email}
        onChangeText={value => updateField('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <SelectField
        label="Status"
        value={form.status}
        options={statusOptions}
        onChange={value => updateField('status', value)}
      />
      <HelperText type="error" visible={Boolean(error)}>
        {error}
      </HelperText>
      <CustomButton
        disabled={!isComplete || loading}
        loading={loading}
        onPress={handleSubmit}>
        Save Branch
      </CustomButton>
    </ScreenContainer>
  );
};

export default CreateBranchScreen;
