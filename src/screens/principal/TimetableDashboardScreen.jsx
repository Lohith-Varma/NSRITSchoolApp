import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState} from '../../components';
import academicRepository from '../../repositories/academicRepository';
import timetableService from '../../services/timetable/timetableService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const SectionCard = ({item, timetableMap, index, onPress}) => {
  const hasTimetable = Boolean(timetableMap[item.id]);
  const periodCount = timetableMap[item.id]?.periods?.filter(p => p.subject)?.length || 0;
  const totalSlots = timetableService.DAYS.length * timetableService.MAX_PERIODS;

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(240).springify()}>
      <Pressable onPress={() => onPress(item)} style={styles.sectionCard}>
        <View style={[styles.sectionIcon, {backgroundColor: hasTimetable ? colors.successSoft : colors.warningSoft}]}>
          <MaterialCommunityIcons
            name={hasTimetable ? 'calendar-check' : 'calendar-alert'}
            size={22}
            color={hasTimetable ? colors.success : colors.warning}
          />
        </View>
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionName}>
            {item.className || item.class || 'Class'} — {item.name || item.sectionName || 'Section'}
          </Text>
          <Text style={styles.sectionMeta}>
            {hasTimetable
              ? `${periodCount} of ${totalSlots} slots filled`
              : 'No timetable created yet'}
          </Text>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: hasTimetable ? colors.successSoft : colors.warningSoft}]}>
          <Text style={[styles.statusText, {color: hasTimetable ? colors.success : colors.warning}]}>
            {hasTimetable ? 'Set' : 'Empty'}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSoft} />
      </Pressable>
    </Animated.View>
  );
};

const TimetableDashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const branchId = user?.branchId;

  const {data: sections = [], isLoading: loadingSections, refetch: refetchSections, isRefetching} = useQuery({
    queryKey: ['timetableSections', branchId],
    queryFn: () => academicRepository.getSections({branchId}),
    enabled: Boolean(branchId),
  });

  const {data: timetables = [], isLoading: loadingTimetables, refetch: refetchTimetables} = useQuery({
    queryKey: ['timetablesForBranch', branchId],
    queryFn: () => timetableService.getTimetablesForBranch(branchId),
    enabled: Boolean(branchId),
  });

  const timetableMap = React.useMemo(() => {
    const map = {};
    timetables.forEach(tt => {map[tt.sectionId] = tt;});
    return map;
  }, [timetables]);

  const refetch = () => {
    refetchSections();
    refetchTimetables();
  };

  const isLoading = loadingSections || loadingTimetables;

  const handleSectionPress = section => {
    navigation.navigate('TimetableEditor', {
      sectionId: section.id,
      sectionName: section.name || section.sectionName || 'Section',
      classId: section.academicClassId || section.classId || '',
      className: section.className || section.class || 'Class',
      branchId,
    });
  };

  if (isLoading && sections.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const setCount = sections.filter(s => Boolean(timetableMap[s.id])).length;

  return (
    <FlatList
      data={sections}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />
      }
      ListHeaderComponent={
        <Animated.View entering={FadeInDown.duration(280).springify()} style={styles.hero}>
          <View style={styles.heroDecor} />
          <View style={styles.heroRow}>
            <MaterialCommunityIcons name="calendar-clock" size={26} color={colors.white} />
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Timetable Management</Text>
              <Text style={styles.heroSub}>
                {setCount} of {sections.length} sections configured
              </Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{sections.length}</Text>
              <Text style={styles.heroStatLabel}>Sections</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{setCount}</Text>
              <Text style={styles.heroStatLabel}>With Timetable</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{sections.length - setCount}</Text>
              <Text style={styles.heroStatLabel}>Pending</Text>
            </View>
          </View>
        </Animated.View>
      }
      renderItem={({item, index}) => (
        <SectionCard
          item={item}
          timetableMap={timetableMap}
          index={index}
          onPress={handleSectionPress}
        />
      )}
      ListEmptyComponent={
        !isLoading ? (
          <EmptyState
            title="No sections found"
            message="Create sections under classes first to manage timetables."
          />
        ) : null
      }
      ListFooterComponent={<View style={{height: spacing.xxxl}} />}
    />
  );
};

const styles = StyleSheet.create({
  content: {padding: spacing.lg},
  center: {alignItems: 'center', flex: 1, justifyContent: 'center'},

  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 90,
    height: 170,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 170,
  },
  heroRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg},
  heroCopy: {flex: 1},
  heroTitle: {color: colors.white, fontSize: 18, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2},
  heroStats: {flexDirection: 'row', justifyContent: 'space-around'},
  heroStat: {alignItems: 'center', gap: 4},
  heroStatVal: {color: colors.white, fontSize: 22, fontWeight: '900'},
  heroStatLabel: {color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600'},
  heroStatDiv: {backgroundColor: 'rgba(255,255,255,0.2)', width: 1},

  sectionCard: {
    ...shadows.soft,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  sectionIcon: {alignItems: 'center', borderRadius: radius.md, height: 44, justifyContent: 'center', width: 44},
  sectionInfo: {flex: 1},
  sectionName: {...typography.bodyBold, color: colors.text},
  sectionMeta: {...typography.caption, color: colors.textMuted, marginTop: 2},
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {fontSize: 11, fontWeight: '800', textTransform: 'uppercase'},
});

export default TimetableDashboardScreen;
