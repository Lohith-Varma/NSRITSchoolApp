import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import XLSX from 'xlsx';
import {useQuery} from '@tanstack/react-query';
import {CustomButton, DashboardCard, EmptyState, FilterTabs, Header, SearchBar, SectionHeader} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const exportReport = async (records, format = 'csv') => {
  try {
    const headers = ['Student', 'Admission Number', 'Class', 'Section', 'Total Fee', 'Paid Amount', 'Pending Amount', 'Concession'];
    const rows = records.map(item => [
      item.studentName, item.admissionNumber, item.className, item.sectionName,
      item.totalFee, item.paidAmount, item.dueAmount, item.concessionAmount
    ]);
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    
    const bookType = format === 'csv' ? 'csv' : 'xlsx';
    const wbout = XLSX.write(wb, { type: 'base64', bookType });
    
    const ext = format === 'csv' ? 'csv' : 'xlsx';
    const mimeType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const filePath = `${RNFS.CachesDirectoryPath}/FeeReport.${ext}`;
    
    await RNFS.writeFile(filePath, wbout, 'base64');
    
    await Share.open({
      title: `Fee Report`,
      url: `file://${filePath}`,
      type: mimeType,
      failOnCancel: false,
    });
  } catch (err) {
    console.error("Export error:", err);
  }
};

const statusTabs = [
  {label: 'All', value: 'ALL'},
  {label: 'Paid', value: 'PAID'},
  {label: 'Partial', value: 'PARTIAL'},
  {label: 'Due', value: 'DUE'},
  {label: 'Concession', value: 'CONCESSION'},
  {label: 'Transport', value: 'TRANSPORT'},
  {label: 'Books', value: 'BOOKS'},
];

const FeeReportsScreen = ({navigation}) => {
  const access = useFeeAccess();
  const canViewReports = feeService.canViewReports(access.role);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const {data, error, isLoading} = useQuery({
    queryKey: ['feeReports', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId && canViewReports),
  });
  const filtered = useMemo(
    () => {
      const records = data?.records || [];
      return records.filter(item =>
        `${item.studentName} ${item.admissionNumber} ${item.className} ${item.sectionName}`.toLowerCase().includes(query.toLowerCase()) &&
        (
          status === 'ALL' ||
          item.status === status ||
          (status === 'CONCESSION' && Number(item.concessionAmount || 0) > 0) ||
          (status === 'TRANSPORT' && Number(item.transportFee || 0) > 0) ||
          (status === 'BOOKS' && Number(item.booksFee || 0) > 0)
        ),
      );
    },
    [query, status, data?.records],
  );

  return (
    <View style={styles.container}>
      {!canViewReports ? (
        <EmptyState title="Fee reports access denied" message="Only coordinators, accountants, principals, branch admins, and main admins can view fee reports." />
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
              <DashboardCard title="Concessions" value={formatCurrency(data?.summary?.concessionAmount || 0)} icon="sale-outline" />
            </View>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Filter reports" />
            <FilterTabs tabs={statusTabs} value={status} onChange={setStatus} />
            {!['TEACHER', 'CLASS_TEACHER'].includes(String(access.role).toUpperCase()) && (
              <>
                <CustomButton mode="outlined" onPress={() => exportReport(filtered, 'csv')}>Export CSV</CustomButton>
                <CustomButton mode="outlined" onPress={() => exportReport(filtered, 'xlsx')}>Export Excel</CustomButton>
              </>
            )}
            <SectionHeader title="Class-wise Report" />
            {(data?.classWise || []).map(item => (
              <DashboardCard
                key={item.className}
                title={item.className}
                value={formatCurrency(item.dueAmount)}
                description={`Assigned ${formatCurrency(item.totalFee)} | Collected ${formatCurrency(item.paidAmount)} | Students ${item.students}`}
                icon="file-chart-outline"
                onPress={() => navigation.navigate('ClassWiseFeeReport', { className: item.className })}
              />
            ))}
            <SectionHeader title="Student-wise Report" />
          </>
        }
        renderItem={({item}) => (
          <DashboardCard
            title={item.studentName}
            value={formatCurrency(item.dueAmount)}
            description={`${item.className}-${item.sectionName} | Paid ${formatCurrency(item.paidAmount)} | Concession ${formatCurrency(item.concessionAmount)}`}
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
});

export default FeeReportsScreen;
