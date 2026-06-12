import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, List, Text} from 'react-native-paper';
import {
  EmptyState,
  Header,
  LoadingScreen,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import AssignBranchAdminModal from './components/AssignBranchAdminModal';
import AssignPrincipalModal from './components/AssignPrincipalModal';

const renderClassIcon = props => <List.Icon {...props} icon="google-classroom" />;

const BranchDetailsScreen = ({navigation, route}) => {
  const {branchId} = route.params || {};
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showPrincipalModal, setShowPrincipalModal] = useState(false);
  const {data, loading, refreshing, error, refresh} = useAsyncResource(
    options => mainAdminService.getBranchDetails(branchId, options),
    [branchId],
  );

  const classes = useMemo(() => data?.sections || [], [data]);

  if (loading && !data) {
    return <LoadingScreen message="Loading branch details" />;
  }

  if (!data?.branch) {
    return (
      <ScreenContainer>
        <EmptyState title="Branch unavailable" message={error || 'Unable to load this branch.'} />
      </ScreenContainer>
    );
  }

  const {branch, summary} = data;

  return (
    <ScreenContainer>
      <Header
        title={branch.name}
        subtitle={`${branch.branchCode} - ${branch.city || 'City not set'}`}
        actionLabel="Edit"
        onAction={() => navigation.navigate('EditBranch', {branch})}
      />

      <View style={styles.actions}>
        <Button
          icon="view-dashboard-outline"
          mode="contained"
          onPress={() => navigation.navigate('BranchOperationsDashboard', {branchId: branch.id})}>
          Enter Operations
        </Button>
        <Button
          icon="account-tie"
          mode="outlined"
          onPress={() => setShowAdminModal(true)}>
          Create Admin
        </Button>
        <Button icon="school" mode="outlined" onPress={() => setShowPrincipalModal(true)}>
          Create Principal
        </Button>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {refreshing ? <Text style={styles.refreshing}>Refreshing...</Text> : null}

      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Branch Information</Text>
            <StatusBadge
              status={branch.isActive ? 'info' : 'holiday'}
              label={branch.isActive ? 'Active' : 'Inactive'}
            />
          </View>
          <Info label="Address" value={branch.address} />
          <Info label="City" value={branch.city} />
          <Info label="State" value={branch.state} />
          <Info label="Pincode" value={branch.pincode} />
          <Info label="Phone" value={branch.phone} />
          <Info label="Email" value={branch.email} />
        </Card.Content>
      </Card>

      <View style={styles.metricGrid}>
        <Metric label="Classes" value={summary.totalClasses} />
        <Metric label="Students" value={summary.totalStudents} />
        <Metric label="Teachers" value={summary.totalTeachers} />
        <Metric label="Coordinators" value={summary.totalCoordinators} />
        <Metric label="Accountants" value={summary.totalAccountants} />
        <Metric label="Attendance" value={`${summary.attendancePercent}%`} />
      </View>

      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Leadership</Text>
          <Info label="Principal" value={branch.principal?.fullName || 'Unassigned'} />
          <Info label="Branch Admin" value={branch.branchAdmin?.fullName || 'Unassigned'} />
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Fee Collection Summary</Text>
          <Info label="Total Fees" value={formatCurrency(summary.totalFees)} />
          <Info label="Collected" value={formatCurrency(summary.paidFees)} />
          <Info label="Pending" value={formatCurrency(summary.pendingFees)} />
          <Info label="Collection" value={`${summary.feeCollectionPercent}%`} />
        </Card.Content>
      </Card>

      <SectionHeader title="Classes in Branch" subtitle="Class sections under this branch" />
      {classes.length ? (
        classes.map(section => (
          <List.Item
            key={section.id}
            title={`${section.academicClass?.name || 'Class'} ${section.name}`}
            description={section.isActive ? 'Active' : 'Inactive'}
            left={renderClassIcon}
            onPress={() => navigation.navigate('ClassDetails', {sectionId: section.id})}
          />
        ))
      ) : (
        <EmptyState title="No classes" message="Classes for this branch will appear here." />
      )}

      <Button mode="text" icon="refresh" onPress={refresh} style={styles.refreshButton}>
        Refresh
      </Button>

      <AssignBranchAdminModal
        branchId={branch.id}
        visible={showAdminModal}
        onDismiss={() => setShowAdminModal(false)}
        onAssigned={refresh}
      />
      <AssignPrincipalModal
        branchId={branch.id}
        visible={showPrincipalModal}
        onDismiss={() => setShowPrincipalModal(false)}
        onAssigned={refresh}
      />
    </ScreenContainer>
  );
};

const Info = ({label, value}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'Not set'}</Text>
  </View>
);

const Metric = ({label, value}) => (
  <Card mode="outlined" style={styles.metricCard}>
    <Card.Content>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    color: colors.textMuted,
    flex: 1,
  },
  infoValue: {
    color: colors.text,
    flex: 1.4,
    textAlign: 'right',
  },
  metricGrid: {
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
    ...typography.title,
    color: colors.primary,
  },
  metricLabel: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  refreshing: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  refreshButton: {
    marginTop: spacing.sm,
  },
});

export default BranchDetailsScreen;
