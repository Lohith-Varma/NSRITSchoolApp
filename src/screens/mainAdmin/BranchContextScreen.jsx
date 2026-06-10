import React, {useMemo, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {Button, Card, Text} from 'react-native-paper';
import {
  EmptyState,
  Header,
  LoadingScreen,
  ScreenContainer,
  SearchBar,
  StatusBadge,
} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {
  buildMainAdminBranchContext,
  saveMainAdminBranchContext,
} from '../../services/mainAdmin/mainAdminContextService';
import {enterMainAdminBranchContext} from '../../store/slices/authSlice';
import {colors, radius, spacing, typography} from '../../theme';

const BranchContextScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const branchesQuery = useQuery({
    queryKey: ['mainAdminBranches'],
    queryFn: () => mainAdminService.getAllBranches({forceRefresh: true}),
  });

  const branches = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    if (!needle) {
      return branchesQuery.data || [];
    }
    return (branchesQuery.data || []).filter(branch =>
      [branch.name, branch.branchCode, branch.city, branch.phone, branch.email]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle)),
    );
  }, [branchesQuery.data, searchText]);

  const enterBranch = branch => {
    const context = buildMainAdminBranchContext(branch);
    saveMainAdminBranchContext(context);
    dispatch(enterMainAdminBranchContext(context));
    navigation.navigate('BranchOperationsDashboard', {branchId: branch.id});
  };

  if (branchesQuery.isLoading && !branchesQuery.data) {
    return <LoadingScreen message="Loading branches" />;
  }

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.content}>
        <Header
          title="Branch Context"
          subtitle="Select a branch to operate with Main Admin super access"
        />
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search branch, code, city, phone"
        />
        {branchesQuery.error ? (
          <Text style={styles.error}>{branchesQuery.error.message}</Text>
        ) : null}
      </View>
      <FlatList
        data={branches}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={branchesQuery.isFetching}
            onRefresh={branchesQuery.refetch}
          />
        }
        ListEmptyComponent={
          <EmptyState title="No branches" message="Create a branch before entering context." />
        }
        renderItem={({item}) => (
          <Card mode="outlined" style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.titleBlock}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.subtitle}>Branch Code: {item.branchCode}</Text>
                </View>
                <StatusBadge
                  status={item.isActive ? 'info' : 'holiday'}
                  label={item.isActive ? 'Active' : 'Inactive'}
                />
              </View>
              <View style={styles.metrics}>
                <Metric label="Principal" value={item.principalAvailable ? 'Available' : 'Open'} />
                <Metric label="Students" value={item.totalStudents} />
                <Metric label="Teachers" value={item.totalTeachers} />
                <Metric label="Coordinators" value={item.totalCoordinators} />
              </View>
              <Button
                icon="login"
                mode="contained"
                onPress={() => enterBranch(item)}
                style={styles.action}>
                Enter Branch Context
              </Button>
            </Card.Content>
          </Card>
        )}
      />
    </ScreenContainer>
  );
};

const Metric = ({label, value}) => (
  <View style={styles.metric}>
    <Text style={styles.metricValue}>{value ?? 0}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  list: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metric: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    flexBasis: '48%',
    flexGrow: 1,
    padding: spacing.sm,
  },
  metricValue: {
    ...typography.subtitle,
    color: colors.primary,
  },
  metricLabel: {
    color: colors.textMuted,
    marginTop: 2,
  },
  action: {
    marginTop: spacing.md,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});

export default BranchContextScreen;
