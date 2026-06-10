import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {CustomButton, DashboardCard, EmptyState, Header, SearchBar, SectionHeader} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const toCsv = records => [
  'Student,Admission Number,Class,Section,Total Fee,Paid Amount,Pending Amount',
  ...records.map(item =>
    [item.studentName, item.admissionNumber, item.className, item.sectionName, item.totalFee, item.paidAmount, item.dueAmount]
      .map(value => `"${String(value ?? '').replace(/"/g, '""')}"`)
      .join(','),
  ),
].join('\n');

const FeeReportsScreen = () => {
  const access = useFeeAccess();
  const canViewReports = feeService.canRecordPayments(access.role);
  const [query, setQuery] = useState('');
  const [csvPreview, setCsvPreview] = useState('');
  const {data, error, isLoading} = useQuery({
    queryKey: ['feeReports', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId && canViewReports),
  });
  const filtered = useMemo(
    () => {
      const records = data?.records || [];
      return records.filter(item =>
        `${item.studentName} ${item.className} ${item.sectionName}`.toLowerCase().includes(query.toLowerCase()),
      );
    },
    [query, data?.records],
  );

  return (
    <View style={styles.container}>
      {!canViewReports ? (
        <EmptyState title="Fee reports access denied" message="Only accountants and principals can view fee reports." />
      ) : (
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Header title="Fee Reports" subtitle={isLoading ? 'Loading reports' : 'Branch fee analytics'} />
            <View style={styles.grid}>
              <DashboardCard title="Assigned" value={formatCurrency(data?.summary?.totalFee || 0)} icon="cash-multiple" />
              <DashboardCard title="Collected" value={formatCurrency(data?.summary?.paidAmount || 0)} icon="cash-check" />
              <DashboardCard title="Pending" value={formatCurrency(data?.summary?.dueAmount || 0)} icon="cash-clock" />
            </View>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Filter reports" />
            <CustomButton mode="outlined" onPress={() => setCsvPreview(toCsv(filtered))}>Generate CSV</CustomButton>
            {csvPreview ? <Text style={styles.csvPreview} numberOfLines={4}>{csvPreview}</Text> : null}
            <SectionHeader title="Class-wise Report" />
            {(data?.classWise || []).map(item => (
              <DashboardCard
                key={item.className}
                title={item.className}
                value={formatCurrency(item.dueAmount)}
                description={`Assigned ${formatCurrency(item.totalFee)} | Collected ${formatCurrency(item.paidAmount)} | Students ${item.students}`}
                icon="file-chart-outline"
              />
            ))}
            <SectionHeader title="Student-wise Report" />
          </>
        }
        renderItem={({item}) => (
          <DashboardCard
            title={item.studentName}
            value={formatCurrency(item.dueAmount)}
            description={`${item.className}-${item.sectionName} | Paid ${formatCurrency(item.paidAmount)}`}
            icon="account-school-outline"
          />
        )}
        ListEmptyComponent={<EmptyState title={error ? 'Unable to load reports' : 'No report records'} message={error?.message || 'Fee plans and payments will appear here.'} />}
      />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxxl},
  grid: {gap: spacing.sm},
  csvPreview: {color: colors.textMuted, marginVertical: spacing.md},
});

export default FeeReportsScreen;
