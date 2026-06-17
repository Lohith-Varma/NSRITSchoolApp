import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, FilterTabs, SearchBar, SkeletonLoader} from '../../components';
import {USER_ROLES} from '../../config/constants';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing} from '../../theme';

const StudentManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const [offset] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');

  const studentsQuery = useQuery({
    queryKey: ['students', user?.branchId, user?.wing || 'ALL', offset],
    queryFn: () =>
      user?.role === USER_ROLES.COORDINATOR
        ? studentService.getStudentsByWing({branchId: user.branchId, wing: user.wing, offset}, scope)
        : studentService.getStudents({branchId: user.branchId, offset}, scope),
    enabled: Boolean(user?.branchId || user?.role === USER_ROLES.MAIN_ADMIN),
  });

  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);
  const filteredStudents = useMemo(
    () =>
      students.filter(item => {
        const matchesQuery = `${item.fullName} ${item.studentId} ${item.parent?.phoneNumber || ''}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const itemStatus = String(item.status || 'ACTIVE').toUpperCase();
        const matchesStatus = status === 'ALL' || itemStatus === status;
        return matchesQuery && matchesStatus;
      }),
    [query, status, students],
  );

  const renderHeader = () => (
    <View>
      <Animated.View entering={FadeInDown.duration(260).springify()} style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroOverline}>Management</Text>
        <Text style={styles.heroTitle}>Students</Text>
        <Text style={styles.heroSub}>Admissions, profiles, status, and section transfers</Text>
        <Pressable
          onPress={() => navigation.navigate('AddStudent')}
          style={styles.heroBtn}>
          <MaterialCommunityIcons name="account-plus-outline" size={14} color={colors.primary} />
          <Text style={styles.heroBtnText}>Add Student</Text>
        </Pressable>
      </Animated.View>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search students, admission no, parent mobile"
      />
      <FilterTabs
        tabs={[
          {label: 'All', value: 'ALL'},
          {label: 'Active', value: 'ACTIVE'},
          {label: 'Inactive', value: 'INACTIVE'},
        ]}
        value={status}
        onChange={setStatus}
      />
    </View>
  );

  return (
    <FlatList
      data={filteredStudents}
      keyExtractor={item => item.id}
      style={styles.root}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        studentsQuery.isLoading ? (
          <SkeletonLoader rows={4} />
        ) : (
          <EmptyState
            title="No students"
            message={studentsQuery.error?.message || 'Admissions will appear here.'}
          />
        )
      }
      renderItem={({item, index}) => (
        <Animated.View entering={FadeInRight.delay(index * 20).duration(200).springify()}>
          <Pressable
            onPress={() => navigation.navigate('StudentDetails', {studentId: item.id})}
            style={({pressed}) => [styles.studentRow, pressed && {opacity: 0.88}]}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>
                {(item.fullName || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.fullName}</Text>
              <Text style={styles.studentMeta}>
                {item.academicClass?.name || '—'}-{item.section?.name || '—'} · {item.studentId || '—'}
              </Text>
            </View>
            <View style={[styles.statusPill, {backgroundColor: String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? colors.successSoft : colors.dangerSoft}]}>
              <Text style={[styles.statusText, {color: String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? colors.success : colors.danger}]}>
                {String(item.status || 'ACTIVE').toUpperCase()}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      )}
      ListFooterComponent={
        <View style={styles.actions}>
          <Text style={styles.actionsLabel}>More Actions</Text>
          <Pressable onPress={() => navigation.navigate('StudentSearch')} style={({pressed}) => [styles.actionRow, pressed && {opacity: 0.88}]}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="account-search-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.actionLabel}>Advanced Search</Text>
              <Text style={styles.actionSub}>Find by class, section, status</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSoft} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('BulkStudentImport')} style={({pressed}) => [styles.actionRow, pressed && {opacity: 0.88}]}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="file-upload-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.actionLabel}>Bulk Import</Text>
              <Text style={styles.actionSub}>Upload students via CSV</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSoft} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('TransferStudent')} style={({pressed}) => [styles.actionRow, pressed && {opacity: 0.88}]}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="swap-horizontal" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.actionLabel}>Transfer Student</Text>
              <Text style={styles.actionSub}>Move between sections</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSoft} />
          </Pressable>
          <View style={{height: spacing.xxxl}} />
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingTop: 0},

  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130,
  },
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginBottom: spacing.md, marginTop: 4},
  heroBtn: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  heroBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'},

  studentRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.soft,
  },
  studentAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  studentAvatarText: {color: colors.primary, fontSize: 15, fontWeight: '800'},
  studentInfo: {flex: 1},
  studentName: {color: colors.text, fontSize: 14, fontWeight: '700'},
  studentMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  statusPill: {borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3},
  statusText: {fontSize: 9, fontWeight: '800'},

  actions: {marginTop: spacing.md},
  actionsLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: spacing.sm, textTransform: 'uppercase'},
  actionRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.soft,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  actionBody: {flex: 1},
  actionLabel: {color: colors.text, fontSize: 13, fontWeight: '700'},
  actionSub: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 1},
});

export default StudentManagementScreen;
