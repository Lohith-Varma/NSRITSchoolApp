import React, {useMemo, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {Card, Chip, Text} from 'react-native-paper';
import {
  EmptyState,
  Header,
  LoadingScreen,
  ERPLayout,
  SearchBar,
} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, spacing, typography} from '../../theme';

const GlobalClassesScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});
  const {data, loading, refreshing, error, refresh} = useAsyncResource(
    options => mainAdminService.getGlobalClasses({...options}),
    [],
  );

  const branches = useMemo(
    () => [...new Map((data || []).map(item => [item.branchId, item.branchName])).entries()],
    [data],
  );
  const grades = useMemo(() => [...new Set((data || []).map(item => item.className))], [data]);
  const sections = useMemo(() => [...new Set((data || []).map(item => item.section))], [data]);

  const classes = useMemo(() => {
    return (data || []).filter(item => {
      const matchesFilters =
        (!filters.branchId || item.branchId === filters.branchId) &&
        (!filters.grade || item.className === filters.grade) &&
        (!filters.section || item.section === filters.section);
      const needle = searchText.trim().toLowerCase();
      const matchesSearch =
        !needle ||
        [item.branchName, item.className, item.section, item.classTeacher]
          .some(value => String(value || '').toLowerCase().includes(needle));
      return matchesFilters && matchesSearch;
    });
  }, [data, filters, searchText]);

  if (loading && !data) {
    return <LoadingScreen message="Loading classes" />;
  }

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Dashboard"
      title="Global Classes"
      breadcrumbs={['Dashboard', 'Academics', 'Global Classes']}>
      <View style={styles.content}>
        <Header title="Global Classes" subtitle="Classes across all active branches" />
        <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search classes" />
        <FilterRow
          items={branches}
          selected={filters.branchId}
          onSelect={branchId => setFilters(current => ({...current, branchId}))}
        />
        <FilterRow
          items={grades.map(item => [item, item])}
          selected={filters.grade}
          onSelect={grade => setFilters(current => ({...current, grade}))}
        />
        <FilterRow
          items={sections.map(item => [item, item])}
          selected={filters.section}
          onSelect={section => setFilters(current => ({...current, section}))}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListEmptyComponent={<EmptyState title="No classes" message="Adjust filters or add classes." />}
        renderItem={({item}) => (
          <Card
            mode="outlined"
            style={styles.card}
            onPress={() => navigation.navigate('ClassDetails', {sectionId: item.id})}>
            <Card.Content>
              <Text style={styles.title}>
                {item.className} {item.section}
              </Text>
              <Text style={styles.subtitle}>{item.branchName}</Text>
              <View style={styles.metrics}>
                <Metric label="Teacher" value={item.classTeacher} />
                <Metric label="Students" value={item.totalStudents} />
                <Metric label="Attendance" value={`${item.attendancePercent}%`} />
                <Metric label="Fees" value={`${item.feeCollectionPercent}%`} />
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </ERPLayout>
  );
};

const FilterRow = ({items, selected, onSelect}) => (
  <View style={styles.filters}>
    <Chip selected={!selected} onPress={() => onSelect(null)} compact>
      All
    </Chip>
    {items.slice(0, 8).map(([value, label]) => (
      <Chip
        key={value}
        selected={selected === value}
        onPress={() => onSelect(selected === value ? null : value)}
        compact>
        {label}
      </Chip>
    ))}
  </View>
);

const Metric = ({label, value}) => (
  <View style={styles.metric}>
    <Text numberOfLines={1} style={styles.metricValue}>
      {value || 0}
    </Text>
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
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.sm,
  },
  metricValue: {
    color: colors.text,
    fontWeight: '700',
  },
  metricLabel: {
    color: colors.textMuted,
    marginTop: 2,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});

export default GlobalClassesScreen;
