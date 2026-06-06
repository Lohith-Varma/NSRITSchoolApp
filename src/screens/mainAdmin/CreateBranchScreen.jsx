import React, {useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {
  CustomButton,
  CustomInput,
  Header,
  ERPLayout,
} from '../../components';
import {createBranch} from '../../store/slices/branchSlice';

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
    setForm(current => ({...current, [field]: value}));

  const handleSubmit = async () => {
    const action = await dispatch(createBranch(form));
    if (createBranch.fulfilled.match(action)) {
      navigation.goBack();
    }
  };

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Branches"
      title="Create Branch"
      breadcrumbs={['Dashboard', 'Branch Management', 'Create']}>
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
      />
      <HelperText type="error" visible={Boolean(error)}>
        {error}
      </HelperText>
      <CustomButton
        disabled={!form.name || !form.code || loading}
        loading={loading}
        onPress={handleSubmit}>
        Save Branch
      </CustomButton>
    </ERPLayout>
  );
};

export default CreateBranchScreen;
