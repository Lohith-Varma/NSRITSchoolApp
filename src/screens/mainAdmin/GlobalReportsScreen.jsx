import React from 'react';
import {StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import XLSX from 'xlsx';
import {useQuery} from '@tanstack/react-query';
import {Button, Card, DataTable, Text} from 'react-native-paper';
import {EmptyState, Header, LoadingScreen, ScreenContainer} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const columns = [
  'Branch',
  'Students',
  'Teachers',
  'Coordinators',
  'Accountants',
  'Attendance',
  'Collected',
  'Pending',
  'Concessions',
  'Admissions',
];

const buildRows = rows =>
  rows.map(row => [
    `${row.branchName} (${row.branchCode})`,
    row.students,
    row.teachers,
    row.coordinators,
    row.accountants,
    `${row.attendancePercent}%`,
    row.paidFees,
    row.pendingFees,
    row.concessionFees,
    row.admissions,
  ]);



const GlobalReportsScreen = () => {
  const reportsQuery = useQuery({
    queryKey: ['globalReports'],
    queryFn: () => mainAdminService.getGlobalReports({forceRefresh: true}),
  });

  const shareReport = async (format = 'csv') => {
    try {
      const rows = reportsQuery.data?.branchWise || [];
      const dataRows = buildRows(rows);
      
      const ws = XLSX.utils.aoa_to_sheet([columns, ...dataRows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Global Reports");
      
      const bookType = format === 'csv' ? 'csv' : 'xlsx';
      const wbout = XLSX.write(wb, { type: 'base64', bookType });
      
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      const mimeType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const filePath = `${RNFS.CachesDirectoryPath}/GlobalReports.${ext}`;
      
      await RNFS.writeFile(filePath, wbout, 'base64');
      
      await Share.open({
        title: `Global Reports`,
        url: `file://${filePath}`,
        type: mimeType,
        failOnCancel: false,
      });
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  if (reportsQuery.isLoading && !reportsQuery.data) {
    return <LoadingScreen message="Loading reports" />;
  }

  if (reportsQuery.error) {
    return (
      <ScreenContainer>
        <EmptyState title="Unable to load reports" message={reportsQuery.error.message} />
      </ScreenContainer>
    );
  }

  const {totals, branchWise} = reportsQuery.data || {totals: {}, branchWise: []};

  return (
    <ScreenContainer>
      <Header title="Global Reports" subtitle="All branch strength, attendance, and fee reports" />

      <View style={styles.actions}>
        <Button icon="file-delimited-outline" mode="outlined" onPress={() => shareReport('csv')}>
          CSV
        </Button>
        <Button icon="microsoft-excel" mode="outlined" onPress={() => shareReport('xlsx')}>
          Excel
        </Button>
      </View>

      <View style={styles.metrics}>
        <Metric label="Students" value={totals.students} />
        <Metric label="Teachers" value={totals.teachers} />
        <Metric label="Coordinators" value={totals.coordinators} />
        <Metric label="Accountants" value={totals.accountants} />
        <Metric label="Attendance" value={`${totals.attendancePercent || 0}%`} />
        <Metric label="Collected Fees" value={formatCurrency(totals.paidFees || 0)} />
        <Metric label="Pending Fees" value={formatCurrency(totals.pendingFees || 0)} />
        <Metric label="Concessions" value={formatCurrency(totals.concessionFees || 0)} />
      </View>

      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Branch Wise Reports</Text>
          {branchWise.length ? (
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title>Branch</DataTable.Title>
                <DataTable.Title numeric>Students</DataTable.Title>
                <DataTable.Title numeric>Pending</DataTable.Title>
                <DataTable.Title numeric>Concession</DataTable.Title>
              </DataTable.Header>
              {branchWise.map((row, index) => (
                <DataTable.Row
                  key={row.branchId}
                  style={index % 2 ? styles.tableRowAlt : styles.tableRow}>
                  <DataTable.Cell>{row.branchCode}</DataTable.Cell>
                  <DataTable.Cell numeric>{row.students}</DataTable.Cell>
                  <DataTable.Cell numeric>{formatCurrency(row.pendingFees)}</DataTable.Cell>
                  <DataTable.Cell numeric>{formatCurrency(row.concessionFees)}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          ) : (
            <EmptyState title="No report rows" message="Branch data will appear here." />
          )}
        </Card.Content>
      </Card>
    </ScreenContainer>
  );
};

const Metric = ({label, value}) => (
  <Card mode="outlined" style={styles.metricCard}>
    <Card.Content>
      <Text style={styles.metricValue}>{value ?? 0}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    flexBasis: '48%',
    flexGrow: 1,
  },
  metricValue: {
    ...typography.subtitle,
    color: colors.primary,
  },
  metricLabel: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tableHeader: {
    backgroundColor: colors.primaryFaint,
    borderBottomColor: colors.borderStrong,
    borderBottomWidth: 1,
  },
  tableRow: {
    backgroundColor: colors.surface,
  },
  tableRowAlt: {
    backgroundColor: colors.neutralSoft,
  },
});

export default GlobalReportsScreen;
