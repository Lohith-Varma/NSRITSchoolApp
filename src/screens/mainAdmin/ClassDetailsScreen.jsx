import React, {useMemo, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {Card, List, SegmentedButtons, Text} from 'react-native-paper';
import {
  EmptyState,
  Header,
  LoadingScreen,
  ERPLayout,
} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const ClassDetailsScreen = ({navigation, route}) => {
  const {sectionId} = route.params || {};
  const [tab, setTab] = useState('students');
  const {data, loading, refreshing, error, refresh} = useAsyncResource(
    options => mainAdminService.getClassDetails(sectionId, options),
    [sectionId],
  );

  const classTeacher = useMemo(
    () => data?.teacherAssignments?.find(item => item.isClassTeacher)?.teacher,
    [data],
  );

  if (loading && !data) {
    return <LoadingScreen message="Loading class details" />;
  }

  if (!data?.section) {
    return (
      <ERPLayout
        navigation={navigation}
        activeRoute="Dashboard"
        title="Class Details"
        breadcrumbs={['Dashboard', 'Academics', 'Details']}>
        <EmptyState title="Class unavailable" message={error || 'Unable to load class details.'} />
      </ERPLayout>
    );
  }

  const classInfo = data.classInfo;

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Dashboard"
      title="Class Details"
      breadcrumbs={['Dashboard', 'Academics', 'Details']}>
      <View style={styles.content}>
        <Header
          title={`${classInfo?.className || 'Class'} ${classInfo?.section || ''}`}
          subtitle={classInfo?.branchName}
        />
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Class Information</Text>
            <Info label="Branch" value={classInfo?.branchName} />
            <Info label="Class" value={classInfo?.className} />
            <Info label="Section" value={classInfo?.section} />
            <Info label="Class Teacher" value={classTeacher?.fullName || 'Unassigned'} />
            <Info label="Students" value={data.students?.length || 0} />
          </Card.Content>
        </Card>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            {value: 'students', label: 'Students'},
            {value: 'attendance', label: 'Attendance'},
            {value: 'fees', label: 'Fees'},
          ]}
        />
      </View>
      <FlatList
        data={tab === 'students' ? data.students : tab === 'attendance' ? data.attendances : data.studentFees}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListEmptyComponent={<EmptyState title="No records" message="Records will appear after entry." />}
        renderItem={({item}) => {
          if (tab === 'students') {
            return (
              <List.Item
                title={item.fullName}
                description={`${item.studentId} - Roll ${item.rollNumber || '-'}`}
                left={props => <List.Icon {...props} icon="account-school" />}
                onPress={() => navigation.navigate('StudentProfile', {studentId: item.id})}
              />
            );
          }

          if (tab === 'attendance') {
            return (
              <List.Item
                title={item.attendanceDate}
                description={item.remarks || item.status}
                left={props => <List.Icon {...props} icon="calendar-check" />}
                right={() => <Text style={styles.status}>{item.status}</Text>}
              />
            );
          }

          return (
            <List.Item
              title={formatCurrency(item.totalFee)}
              description={`${formatCurrency(item.paidAmount)} paid - ${formatCurrency(item.remainingAmount)} pending`}
              left={props => <List.Icon {...props} icon="cash-multiple" />}
              right={() => <Text style={styles.status}>{item.status}</Text>}
            />
          );
        }}
      />
    </ERPLayout>
  );
};

const Info = ({label, value}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'Not set'}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: 0,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    color: colors.textMuted,
  },
  infoValue: {
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  status: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default ClassDetailsScreen;
