import React from 'react';
import {Share, StyleSheet, View} from 'react-native';
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

const serialize = (rows, delimiter = ',') =>
  [columns, ...buildRows(rows)]
    .map(row =>
      row
        .map(value => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(delimiter),
    )
    .join('\n');

const GlobalReportsScreen = () => {
  const reportsQuery = useQuery({
    queryKey: ['globalReports'],
    queryFn: () => mainAdminService.getGlobalReports({forceRefresh: true}),
  });

  const shareReport = async type => {
    const rows = reportsQuery.data?.branchWise || [];
    const delimiter = type === 'excel' ? '\t' : ',';
    const message = serialize(rows, delimiter);
    await Share.share({
      title: type === 'excel' ? 'NSRIT Global Reports.xls' : 'NSRIT Global Reports.csv',
      message,
    });
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
        <Button icon="microsoft-excel" mode="outlined" onPress={() => shareReport('excel')}>
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
              <DataTable.Header>
                <DataTable.Title>Branch</DataTable.Title>
                <DataTable.Title numeric>Students</DataTable.Title>
                <DataTable.Title numeric>Pending</DataTable.Title>
                <DataTable.Title numeric>Concession</DataTable.Title>
              </DataTable.Header>
              {branchWise.map(row => (
                <DataTable.Row key={row.branchId}>
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
});

export default GlobalReportsScreen;
