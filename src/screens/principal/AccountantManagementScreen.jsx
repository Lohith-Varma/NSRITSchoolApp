import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header} from '../../components';
import accountantService from '../../services/accountants/accountantService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, spacing} from '../../theme';

const AccountantManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const {data: accountants = [], error, isLoading} = useQuery({
    queryKey: ['accountants', user?.branchId],
    queryFn: () => accountantService.getAccountants(user.branchId, scope),
    enabled: Boolean(user?.branchId),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header
          title="Accountants"
          subtitle="Branch fee desk users"
          actionLabel="Add"
          onAction={() => navigation.navigate('CreateAccountant')}
        />
      </View>
      <FlatList
        data={accountants}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <DashboardCard
            title={item.fullName}
            value={item.employeeId}
            description={`${item.phoneNumber || ''} | ${item.isActive ? 'Active' : 'Inactive'}`}
            icon="cash-register"
            onPress={() => navigation.navigate('AccountantProfile', {accountantId: item.id})}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={isLoading ? 'Loading accountants' : 'No accountants'}
            message={error?.message || 'Created accountant profiles will appear here.'}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: colors.background, flex: 1},
  header: {padding: spacing.lg, paddingBottom: 0},
  list: {padding: spacing.lg, paddingTop: spacing.sm},
});

export default AccountantManagementScreen;
