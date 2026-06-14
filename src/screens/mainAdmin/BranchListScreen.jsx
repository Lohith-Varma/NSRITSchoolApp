import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {
  EmptyState,
  Header,
  LoadingScreen,
  ERPLayout,
  SearchBar,
  StatusBadge,
} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, spacing, typography} from '../../theme';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';

const formatDate = value => formatDateForDisplay(value) || 'Not set';

const BranchListScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const {data, loading, refreshing, error, refresh} = useAsyncResource(
    options => mainAdminService.getAllBranches(options),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const branches = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    if (!needle) {
      return data || [];
    }
    return (data || []).filter(branch =>
      [branch.name, branch.branchCode, branch.city, branch.phone, branch.email]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle)),
    );
  }, [data, searchText]);

  if (loading && !data) {
    return <LoadingScreen message="Loading branches" />;
  }

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Branches"
      title="Branch List"
      breadcrumbs={['Dashboard', 'Branch Management', 'Branches']}>
      <View style={styles.content}>
        <Header
          title="Branches"
          subtitle="All branches with live classes and student totals"
          actionLabel="Add"
          onAction={() => navigation.navigate('CreateBranch')}
        />
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search branch, code, phone"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <FlatList
        data={branches}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListEmptyComponent={
          <EmptyState title="No branches" message="Create a branch or adjust search filters." />
        }
        renderItem={({item}) => (
          <Card
            mode="outlined"
            style={styles.card}
            onPress={() => navigation.navigate('BranchDetails', {branchId: item.id})}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.titleBlock}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.subtitle}>
                    {item.branchCode} - {item.city || 'City not set'}
                  </Text>
                </View>
                <StatusBadge
                  status={item.isActive ? 'info' : 'holiday'}
                  label={item.isActive ? 'Active' : 'Inactive'}
                />
              </View>
              <View style={styles.metrics}>
                <Metric label="Students" value={item.totalStudents} />
                <Metric label="Teachers" value={item.totalTeachers} />
                <Metric label="Coordinators" value={item.totalCoordinators} />
              </View>
              <Text style={styles.detail}>
                Principal: {item.principal?.fullName || 'Unassigned'}
              </Text>
              <Text style={styles.detail}>Created: {formatDate(item.createdAt)}</Text>
              <Text style={styles.detail}>{item.address || 'Address not set'}</Text>
              <Text style={styles.detail}>{item.phone || item.email || 'Contact not set'}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </ERPLayout>
  );
};

const Metric = ({label, value}) => (
  <View style={styles.metric}>
    <Text style={styles.metricValue}>{value || 0}</Text>
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
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  metric: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    flex: 1,
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
  detail: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});

export default BranchListScreen;
