import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Text} from 'react-native-paper';
import {
  EmptyState,
  Header,
  LoadingScreen,
  ERPLayout,
  SearchBar,
  StatusBadge,
} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, spacing, typography} from '../../theme';

const PAGE_SIZE = 25;

const GlobalStudentsScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async ({forceRefresh = false, nextPage = page} = {}) => {
      try {
        forceRefresh ? setRefreshing(true) : setLoading(true);
        setError(null);
        const response = await mainAdminService.getGlobalStudents({
          filters,
          searchText,
          page: nextPage,
          pageSize: PAGE_SIZE,
          forceRefresh,
        });
        setResult(response);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load students');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters, page, searchText],
  );

  useEffect(() => {
    load();
  }, [load]);

  const onNext = () => {
    if (result?.hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      load({nextPage});
    }
  };

  const onPrevious = () => {
    if (page > 1) {
      const nextPage = page - 1;
      setPage(nextPage);
      load({nextPage});
    }
  };

  const refresh = () => load({forceRefresh: true});

  useEffect(() => {
    setPage(1);
  }, [filters, searchText]);

  const branches = useMemo(
    () => [...new Map((result?.items || []).map(item => [item.branchId, item.branchName])).entries()],
    [result],
  );

  if (loading && !result) {
    return <LoadingScreen message="Loading students" />;
  }

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Users"
      title="Global Students"
      breadcrumbs={['Dashboard', 'Users & Students', 'Global Students']}>
      <View style={styles.content}>
        <Header title="Global Students" subtitle="Students across every branch" />
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search name, admission no, parent phone"
        />
        <View style={styles.filters}>
          <Chip
            selected={!filters.status}
            onPress={() => setFilters(current => ({...current, status: null}))}
            compact>
            All
          </Chip>
          <Chip
            selected={filters.status === 'ACTIVE'}
            onPress={() => setFilters(current => ({...current, status: 'ACTIVE'}))}
            compact>
            Active
          </Chip>
          <Chip
            selected={filters.status === 'INACTIVE'}
            onPress={() => setFilters(current => ({...current, status: 'INACTIVE'}))}
            compact>
            Inactive
          </Chip>
          <Chip
            selected={filters.gender === 'Male'}
            onPress={() => setFilters(current => ({...current, gender: 'Male'}))}
            compact>
            Male
          </Chip>
          <Chip
            selected={filters.gender === 'Female'}
            onPress={() => setFilters(current => ({...current, gender: 'Female'}))}
            compact>
            Female
          </Chip>
        </View>
        <View style={styles.filters}>
          {branches.slice(0, 6).map(([branchId, branchName]) => (
            <Chip
              key={branchId}
              selected={filters.branchId === branchId}
              onPress={() =>
                setFilters(current => ({
                  ...current,
                  branchId: current.branchId === branchId ? null : branchId,
                }))
              }
              compact>
              {branchName}
            </Chip>
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <FlatList
        data={result?.items || []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load({forceRefresh: true, nextPage: 1})} />
        }
        ListEmptyComponent={<EmptyState title="No students" message="Adjust filters or search text." />}
        ListFooterComponent={
          <View style={styles.pagination}>
            <Button
              mode="outlined"
              disabled={!result?.hasPreviousPage}
              onPress={() => setPage(current => Math.max(1, current - 1))}>
              Previous
            </Button>
            <Text style={styles.pageText}>
              Page {result?.page || 1} - {result?.total || 0}
            </Text>
            <Button
              mode="outlined"
              disabled={!result?.hasNextPage}
              onPress={() => setPage(current => current + 1)}>
              Next
            </Button>
          </View>
        }
        renderItem={({item}) => (
          <Card
            mode="outlined"
            style={styles.card}
            onPress={() => navigation.navigate('StudentProfile', {studentId: item.id})}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.titleBlock}>
                  <Text style={styles.title}>{item.fullName}</Text>
                  <Text style={styles.subtitle}>
                    {item.studentId} - {item.branchName}
                  </Text>
                </View>
                <StatusBadge
                  status={item.feeStatus === 'PAID' ? 'PAID' : 'DUE'}
                  label={item.feeStatus === 'PAID' ? 'Paid' : 'Pending'}
                />
              </View>
              <Text style={styles.detail}>
                {item.className} {item.sectionName} - Attendance {item.attendancePercent}%
              </Text>
              <Text style={styles.detail}>Parent phone: {item.parentPhone || 'Not set'}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </ERPLayout>
  );
};

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
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
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
  detail: {
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  pageText: {
    color: colors.textMuted,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});

export default GlobalStudentsScreen;
