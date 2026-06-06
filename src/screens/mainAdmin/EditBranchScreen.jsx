import React, {useState} from 'react';
import {Alert, StyleSheet} from 'react-native';
import {HelperText, SegmentedButtons} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {CustomButton, CustomInput, Header, ERPLayout} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {spacing} from '../../theme';

const EditBranchScreen = ({navigation, route}) => {
  const branch = route.params?.branch || {};
  const [form, setForm] = useState({
    id: branch.id,
    name: branch.name || '',
    address: branch.address || '',
    city: branch.city || '',
    state: branch.state || '',
    pincode: branch.pincode || '',
    phone: branch.phone || '',
    email: branch.email || '',
    status: branch.status || (branch.isActive ? 'ACTIVE' : 'INACTIVE'),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const updateField = (field, value) =>
    setForm(current => ({...current, [field]: value}));

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      await mainAdminService.updateBranch(form);
      Toast.show({type: 'success', text1: 'Branch updated'});
      navigation.navigate('BranchDetails', {branchId: form.id});
    } catch (saveError) {
      setError(saveError.message || 'Unable to update branch');
    } finally {
      setSaving(false);
    }
  };

  const confirmSave = () => {
    Alert.alert('Update branch?', 'Changes will be saved to Firebase Data Connect.', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Update', onPress: save},
    ]);
  };

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Branches"
      title="Edit Branch"
      breadcrumbs={['Dashboard', 'Branch Management', 'Edit']}>
      <Header title="Edit Branch" subtitle="Update branch profile and active status" />
      <CustomInput
        label="Branch name"
        value={form.name}
        onChangeText={value => updateField('name', value)}
      />
      <CustomInput
        label="Address"
        value={form.address}
        onChangeText={value => updateField('address', value)}
        multiline
      />
      <CustomInput label="City" value={form.city} onChangeText={value => updateField('city', value)} />
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
      <SegmentedButtons
        value={form.status}
        onValueChange={value => updateField('status', value)}
        style={styles.status}
        buttons={[
          {value: 'ACTIVE', label: 'Active'},
          {value: 'INACTIVE', label: 'Inactive'},
        ]}
      />
      <HelperText type="error" visible={Boolean(error)}>
        {error}
      </HelperText>
      <CustomButton disabled={!form.name || saving} loading={saving} onPress={confirmSave}>
        Save Changes
      </CustomButton>
    </ERPLayout>
  );
};

const styles = StyleSheet.create({
  status: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
});

export default EditBranchScreen;
