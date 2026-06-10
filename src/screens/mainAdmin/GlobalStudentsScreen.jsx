import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {Button, Card, Chip, Text} from 'react-native-paper';
import {
  EmptyState,
  Header,
  LoadingScreen,
  ScreenContainer,
  SearchBar,
  StatusBadge,
} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, spacing, typography} from '../../theme';

const PAGE_SIZE = 25;

const GlobalStudentsScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchText(searchText), 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearchText]);

  const studentsQuery = useQuery({
    queryKey: ['globalStudents', filters, debouncedSearchText, page],
    queryFn: () =>
      mainAdminService.getGlobalStudents({
        filters,
        searchText: debouncedSearchText,
        page,
        pageSize: PAGE_SIZE,
      }),
  });

  const branchesQuery = useQuery({
    queryKey: ['globalStudentBranches'],
    queryFn: () => mainAdminService.getAllBranches(),
  });

  const classesQuery = useQuery({
    queryKey: ['globalStudentClasses'],
    queryFn: () => mainAdminService.getGlobalClasses(),
  });

  const result = studentsQuery.data;

  const branches = useMemo(
    () => (branchesQuery.data || []).map(branch => [branch.id, branch.name]),
    [branchesQuery.data],
  );

  const classOptions = useMemo(() => {
    const scoped = (classesQuery.data || []).filter(
      item => !filters.branchId || item.branchId === filters.branchId,
    );
    return [...new Map(scoped.map(item => [item.classId, item.className])).entries()];
  }, [classesQuery.data, filters.branchId]);

  const sectionOptions = useMemo(() => {
    const scoped = (classesQuery.data || []).filter(
      item =>
        (!filters.branchId || item.branchId === filters.branchId) &&
        (!filters.classId || item.classId === filters.classId),
    );
    return scoped.map(item => [item.id, `${item.className}-${item.section}`]);
  }, [classesQuery.data, filters.branchId, filters.classId]);

  if (studentsQuery.isLoading && !result) {
    return <LoadingScreen message="Loading students" />;
  }

  return (
    <ScreenContainer scroll={false}>
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
        <View style={styles.filters}>
          {classOptions.slice(0, 6).map(([classId, className]) => (
            <Chip
              key={classId}
              selected={filters.classId === classId}
              onPress={() =>
                setFilters(current => ({
                  ...current,
                  classId: current.classId === classId ? null : classId,
                  sectionId: null,
                }))
              }
              compact>
              {className}
            </Chip>
          ))}
        </View>
        <View style={styles.filters}>
          {sectionOptions.slice(0, 8).map(([sectionId, label]) => (
            <Chip
              key={sectionId}
              selected={filters.sectionId === sectionId}
              onPress={() =>
                setFilters(current => ({
                  ...current,
                  sectionId: current.sectionId === sectionId ? null : sectionId,
                }))
              }
              compact>
              {label}
            </Chip>
          ))}
        </View>
        {studentsQuery.error ? <Text style={styles.error}>{studentsQuery.error.message}</Text> : null}
      </View>
      <FlatList
        data={result?.items || []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={studentsQuery.isFetching} onRefresh={studentsQuery.refetch} />
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
            onPress={() => navigation.navigate('GlobalStudentProfile', {studentId: item.id})}>
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
              <View style={styles.cardActions}>
                <Button compact onPress={() => navigation.navigate('EditStudent', {studentId: item.id})}>
                  Edit
                </Button>
                <Button compact onPress={() => navigation.navigate('ViewAllAttendance', {studentId: item.id})}>
                  Attendance
                </Button>
                <Button compact onPress={() => navigation.navigate('StudentFeeProfile', {studentId: item.id})}>
                  Fees
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </ScreenContainer>
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
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
