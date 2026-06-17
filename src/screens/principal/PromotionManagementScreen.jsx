import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {EmptyState, SelectField} from '../../components';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {getNextClassName} from '../../config/academic';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const PromotionManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const academicYear = new Date().getFullYear();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({fromSectionId: '', toSectionId: ''});

  const classesQuery = useQuery({
    queryKey: ['academicClasses'],
    queryFn: () => academicRepository.getAcademicClasses(),
  });
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId),
  });
  const studentsQuery = useQuery({
    queryKey: ['studentsByBranch', user?.branchId],
    queryFn: () => studentService.getStudentsByBranch(user.branchId, {limit: 1000}),
    enabled: Boolean(user?.branchId),
  });

  const sections = useMemo(
    () => sectionsQuery.data?.sections || [],
    [sectionsQuery.data?.sections],
  );
  const classes = useMemo(() => classesQuery.data || [], [classesQuery.data]);
  const source = sections.find(item => item.id === form.fromSectionId);
  const target = sections.find(item => item.id === form.toSectionId);
  const nextClassName = getNextClassName(source?.academicClass?.name);
  const sourceStudents = (studentsQuery.data || []).filter(
    item => item.sectionId === source?.id,
  );

  const fromOptions = useMemo(
    () =>
      sections.map(item => ({
        label: `${item.academicClass?.name}-${item.name}`,
        value: item.id,
      })),
    [sections],
  );
  const toOptions = useMemo(
    () =>
      sections
        .filter(item => !nextClassName || item.academicClass?.name === nextClassName)
        .map(item => ({
          label: `${item.academicClass?.name}-${item.name}`,
          value: item.id,
        })),
    [nextClassName, sections],
  );

  const classExists = classes.some(item => item.name === nextClassName);

  const mutation = useMutation({
    mutationFn: () =>
      studentService.promoteStudents(
        {
          branchId: user.branchId,
          studentIds: sourceStudents.map(item => item.id),
          fromClassId: source.academicClassId,
          toClassId: target.academicClassId,
          fromSectionId: source.id,
          toSectionId: target.id,
        },
        scope,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['studentsByBranch', user?.branchId]});
      navigation.navigate('PromotionHistory');
    },
    onError: err => setError(err.message),
  });

  const canPromote =
    Boolean(source) &&
    Boolean(target) &&
    sourceStudents.length > 0 &&
    !mutation.isPending;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <Animated.View entering={FadeInDown.duration(280).springify()} style={styles.header}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerOverline}>Principal</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Promotions</Text>
          <Pressable
            onPress={() => navigation.navigate('PromotionHistory')}
            style={styles.historyBtn}>
            <MaterialCommunityIcons name="history" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.historyBtnText}>History</Text>
          </Pressable>
        </View>
        <Text style={styles.headerSub}>
          Promote a full section to the next academic class
        </Text>
      </Animated.View>

      {/* ── Section selectors ── */}
      <Animated.View
        entering={FadeInDown.delay(60).duration(260).springify()}
        style={styles.formCard}>
        <SelectField
          label="From Section"
          value={form.fromSectionId}
          options={fromOptions}
          onChange={value =>
            setForm(current => ({...current, fromSectionId: value, toSectionId: ''}))
          }
        />
        <SelectField
          label="Target Section (Next Class)"
          value={form.toSectionId}
          options={toOptions}
          onChange={value => setForm(current => ({...current, toSectionId: value}))}
          disabled={!source || !classExists}
        />
      </Animated.View>

      {/* ── Preview ── */}
      {source ? (
        <Animated.View
          entering={FadeInDown.delay(80).duration(260).springify()}
          style={styles.previewCard}>
          <View style={styles.previewRow}>
            <View style={styles.previewStat}>
              <Text style={[styles.previewValue, {color: colors.primary}]}>
                {sourceStudents.length}
              </Text>
              <Text style={styles.previewLabel}>Students selected</Text>
            </View>
            <MaterialCommunityIcons
              name="arrow-right"
              size={22}
              color={colors.textMuted}
            />
            <View style={styles.previewStat}>
              <Text style={[styles.previewValue, {color: colors.secondary}]}>
                {nextClassName || '—'}
              </Text>
              <Text style={styles.previewLabel}>Next class</Text>
            </View>
          </View>

          {source && !nextClassName ? (
            <View style={styles.warnBox}>
              <MaterialCommunityIcons
                name="alert-outline"
                size={14}
                color={colors.warning}
              />
              <Text style={styles.warnText}>
                Class 12 has no automatic promotion target.
              </Text>
            </View>
          ) : null}
        </Animated.View>
      ) : null}

      {/* ── Error ── */}
      {error ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* ── Submit ── */}
      <Pressable
        onPress={() => mutation.mutate()}
        disabled={!canPromote}
        style={({pressed}) => [
          styles.promoteBtn,
          !canPromote && styles.promoteBtnDisabled,
          pressed && canPromote && {opacity: 0.88},
        ]}>
        {mutation.isPending ? (
          <Text style={styles.promoteBtnText}>Promoting…</Text>
        ) : (
          <>
            <MaterialCommunityIcons
              name="arrow-up-circle-outline"
              size={20}
              color={colors.white}
            />
            <Text style={styles.promoteBtnText}>Promote Section</Text>
          </>
        )}
      </Pressable>

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  header: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130,
  },
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  historyBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  historyBtnText: {color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 6},

  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.soft,
  },

  previewCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.soft,
  },
  previewRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewStat: {alignItems: 'center', gap: 4},
  previewValue: {fontSize: 28, fontWeight: '900'},
  previewLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},

  warnBox: {
    alignItems: 'center',
    backgroundColor: colors.warningSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  warnText: {color: colors.warning, flex: 1, fontSize: 12, fontWeight: '600'},

  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorText: {color: colors.danger, flex: 1, fontSize: 13, fontWeight: '600'},

  promoteBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 52,
    justifyContent: 'center',
    ...shadows.medium,
  },
  promoteBtnDisabled: {backgroundColor: colors.border},
  promoteBtnText: {color: colors.white, fontSize: 15, fontWeight: '700'},
});

export default PromotionManagementScreen;
