import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, SearchBar, SummaryCard} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const FeePlanManagementScreen = ({navigation}) => {
  const access = useFeeAccess();
  const [query, setQuery] = useState('');
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const {data: records = [], isLoading, error} = useQuery({
    queryKey: ['feeRecords', access.branchId, access.wing],
    queryFn: () => feeService.getFeeRecords(access),
    enabled: Boolean(access.branchId),
  });
  const summary = feeService.getFeeSummary(records);
  const filtered = useMemo(
    () =>
      records.filter(item =>
        `${item.studentName} ${item.admissionNumber} ${item.className} ${item.sectionName}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, records],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header
          title="Fee Plans"
          subtitle="Assign and review student fee plans"
          actionLabel={canManagePlans ? 'Create' : undefined}
          onAction={canManagePlans ? () => navigation.navigate('CreateFeePlan') : undefined}
        />
        <SummaryCard
          title="Assigned Fees"
          value={formatCurrency(summary.totalFee)}
          subtitle={`${formatCurrency(summary.dueAmount)} pending`}
          progress={summary.collectionRate}
          tone={colors.primary}
        />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search student, admission no, class" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <DashboardCard
            title={item.studentName}
            value={formatCurrency(item.totalFee)}
            description={`${item.className}-${item.sectionName} | Paid ${formatCurrency(item.paidAmount)} | Pending ${formatCurrency(item.dueAmount)}`}
            icon="book-open-variant"
            onPress={() => navigation.navigate('StudentFeeProfile', {studentId: item.studentId})}
          />
        )}
        ListEmptyComponent={<EmptyState title={isLoading ? 'Loading fee plans' : 'No fee plans'} message={error?.message || 'Create fee plans for students.'} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: colors.background, flex: 1},
  header: {padding: spacing.lg, paddingBottom: 0},
  list: {padding: spacing.lg, paddingTop: spacing.sm},
});

export default FeePlanManagementScreen;
