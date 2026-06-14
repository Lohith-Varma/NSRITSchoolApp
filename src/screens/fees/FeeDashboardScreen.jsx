import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {
  EmptyState,
  FeeCard,
  FilterTabs,
  ScreenContainer,
  SearchBar,
  SectionHeader,
  SkeletonLoader,
  StatCard,
  SummaryCard,
} from '../../components';
import {FEE_STATUS} from '../../config/constants';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import {fetchFees, setSelectedStudentFee} from '../../store/slices/feeSlice';
import feeService from '../../services/fees/feeService';

const tabs = [
  {label: 'All', value: 'all'},
  {label: 'Paid', value: FEE_STATUS.PAID},
  {label: 'Partial', value: FEE_STATUS.PARTIAL},
  {label: 'Due', value: FEE_STATUS.DUE},
  {label: 'Overdue', value: FEE_STATUS.OVERDUE},
];

const FeeDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const access = useFeeAccess();
  const {records, summary, loading} = useSelector(state => state.fees);
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const canRecordPayments = feeService.canRecordPayments(access.role);
  const canViewReports = feeService.canViewReports(access.role);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    dispatch(fetchFees(access));
  }, [access, dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchFees(access));
    }, [access, dispatch]),
  );

  const filteredRecords = useMemo(
    () =>
      records.filter(item => {
        const matchesStatus = status === 'all' || item.status === status;
        const matchesQuery = item.studentName
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesStatus && matchesQuery;
      }),
    [query, records, status],
  );

  const openDetails = item => {
    dispatch(setSelectedStudentFee(item));
    navigation.navigate('StudentFeeDetails');
  };

  return (
    <ScreenContainer>
      <SectionHeader
        title="Fee Dashboard"
        subtitle="Collection, dues, and student ledger overview"
      />
      <SectionHeader title="Fee Summary" />
      <View style={styles.grid}>
        <StatCard
          title="Total Fee"
          value={formatCurrency(summary.totalFee)}
          icon="cash-multiple"
          tone={colors.primary}
        />
        <StatCard
          title="Paid Fee"
          value={formatCurrency(summary.paidAmount)}
          icon="cash-check"
          tone={colors.success}
        />
        <StatCard
          title="Due Fee"
          value={formatCurrency(summary.dueAmount)}
          icon="cash-clock"
          tone={colors.danger}
          onPress={() => navigation.navigate('DueStudents')}
        />
      </View>
      <SummaryCard
        title="Collection Rate"
        value={formatCurrency(summary.totalFee)}
        subtitle={`${summary.paidStudents} paid - ${summary.dueStudents} pending`}
        progress={summary.collectionRate}
        tone={colors.primary}
      />
      <SectionHeader title="Priority Actions" />
      <View style={styles.quickActions}>
        {canManagePlans ? (
          <StatCard
            title="Class Fees"
            value="Setup"
            icon="google-classroom"
            onPress={() => navigation.navigate('ClassFeeManagement')}
          />
        ) : null}
        {canManagePlans ? (
          <StatCard
            title="Fee Plans"
            value="Manage"
            icon="book-edit-outline"
            onPress={() => navigation.navigate('FeePlanManagement')}
          />
        ) : null}
        {canRecordPayments ? (
          <StatCard
            title="Collection"
            value="Record"
            icon="cash-plus"
            onPress={() => navigation.navigate('FeeCollection')}
          />
        ) : null}
        {canRecordPayments ? (
          <StatCard
            title="History"
            value="View"
            icon="history"
            onPress={() => navigation.navigate('PaymentHistory')}
          />
        ) : null}
        <StatCard
          title="Ledger"
          value="Open"
          icon="book-open-variant"
          onPress={() => navigation.navigate('FeeLedger')}
        />
        {canViewReports ? (
          <StatCard
            title="Reports"
            value="View"
            icon="file-chart-outline"
            onPress={() => navigation.navigate('FeeReports')}
          />
        ) : null}
      </View>
      <SectionHeader title="Student Ledgers" subtitle="Search first, filter second, then open a record" />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search student fees"
      />
      <FilterTabs tabs={tabs} value={status} onChange={setStatus} />
      <FlatList
        data={filteredRecords}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        refreshing={loading}
        renderItem={({item}) => (
          <FeeCard student={item} onPress={() => openDetails(item)} />
        )}
        ListEmptyComponent={
          loading ? (
            <SkeletonLoader rows={4} />
          ) : (
            <EmptyState
              title="No fee records"
              message="Try another filter or search term."
            />
          )
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
});

export default FeeDashboardScreen;
