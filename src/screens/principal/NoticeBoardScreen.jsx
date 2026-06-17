import React, {useState} from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {EmptyState, FloatingActionButton} from '../../components';
import noticesService from '../../services/notices/noticesService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const CATEGORIES = ['All', 'Academic', 'Fee', 'Holiday', 'Event', 'Urgent'];

const CATEGORY_META = {
  Academic: {color: colors.primary, icon: 'school-outline'},
  Fee: {color: colors.secondary, icon: 'cash-multiple'},
  Holiday: {color: colors.success, icon: 'calendar-star'},
  Event: {color: colors.purple, icon: 'party-popper'},
  Urgent: {color: colors.danger, icon: 'alert-circle-outline'},
};

const formatDate = dateStr => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const NoticeCard = ({notice, index, onPin}) => {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[notice.category] || {color: colors.primary, icon: 'bell-outline'};

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(260).springify()}>
      <Pressable
        onPress={() => setExpanded(e => !e)}
        style={[styles.noticeCard, notice.pinned && styles.noticePinned]}>
        {notice.pinned ? (
          <View style={styles.pinnedBanner}>
            <MaterialCommunityIcons name="pin" size={10} color={colors.white} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        ) : null}
        <View style={styles.noticeTop}>
          <View style={[styles.categoryBadge, {backgroundColor: `${meta.color}15`}]}>
            <MaterialCommunityIcons name={meta.icon} size={11} color={meta.color} />
            <Text style={[styles.categoryText, {color: meta.color}]}>{notice.category}</Text>
          </View>
          <Text style={styles.noticeDate}>{formatDate(notice.date)}</Text>
        </View>
        <Text style={styles.noticeTitle}>{notice.title}</Text>
        <Text
          style={styles.noticeBody}
          numberOfLines={expanded ? undefined : 2}>
          {notice.body}
        </Text>
        <View style={styles.noticeMeta}>
          <View style={styles.noticeAuthor}>
            <MaterialCommunityIcons name="account-tie-outline" size={12} color={colors.textMuted} />
            <Text style={styles.noticeAuthorText}>{notice.author}</Text>
          </View>
          {onPin ? (
            <Pressable
              onPress={() => onPin(notice)}
              hitSlop={6}
              style={styles.pinBtn}>
              <MaterialCommunityIcons
                name={notice.pinned ? 'pin-off' : 'pin-outline'}
                size={14}
                color={notice.pinned ? colors.danger : colors.textMuted}
              />
            </Pressable>
          ) : null}
          <View style={styles.expandBtn}>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.primary}
            />
            <Text style={styles.expandText}>{expanded ? 'Less' : 'More'}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const NoticeBoardScreen = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const branchId = user?.branchId;
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    const unsubscribe = noticesService.subscribeNotices({
      branchId,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      onUpdate: (data) => {
        setNotices(data);
        setIsLoading(false);
        setIsRefetching(false);
      },
      onError: (err) => {
        console.warn('[NoticeBoardScreen] Subscription error:', err);
        setIsLoading(false);
        setIsRefetching(false);
      },
    });
    return () => unsubscribe();
  }, [branchId, selectedCategory]);

  const refetch = () => {
    setIsRefetching(true);
    setTimeout(() => {
      setIsRefetching(false);
    }, 500);
  };

  const handlePin = async notice => {
    try {
      await noticesService.togglePin(notice.id, notice.pinned);
      queryClient.invalidateQueries({queryKey: ['principalNotices']});
      queryClient.invalidateQueries({queryKey: ['parentNotices']});
    } catch (err) {
      console.warn('[NoticeBoardScreen] togglePin failed:', err?.message);
    }
  };

  const pinnedNotices = notices.filter(n => n.pinned);
  const regularNotices = notices.filter(n => !n.pinned);

  return (
    <View style={styles.root}>
      <FlatList
        data={regularNotices}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <Animated.View entering={FadeInDown.duration(280).springify()} style={styles.header}>
              <View style={styles.headerDecor1} />
              <View style={styles.headerDecor2} />
              <View style={styles.headerRow}>
                <MaterialCommunityIcons name="bulletin-board" size={22} color={colors.white} />
                <View style={styles.headerCopy}>
                  <Text style={styles.headerTitle}>Notice Board</Text>
                  <Text style={styles.headerSub}>
                    {notices.length} notice{notices.length !== 1 ? 's' : ''} · Principal Edition
                  </Text>
                </View>
                {isLoading ? (
                  <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                ) : null}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.catScroll}
                contentContainerStyle={styles.catContent}>
                {CATEGORIES.map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}>
                    <Text
                      style={[
                        styles.catChipText,
                        selectedCategory === cat && styles.catChipTextActive,
                      ]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

            {/* ── Pinned notices ── */}
            {pinnedNotices.length > 0 ? (
              <View style={styles.pinnedSection}>
                <Text style={styles.sectionLabel}>
                  {'  '}Pinned
                </Text>
                {pinnedNotices.map((notice, i) => (
                  <NoticeCard key={notice.id} notice={notice} index={i} onPin={handlePin} />
                ))}
              </View>
            ) : null}

            {regularNotices.length > 0 ? (
              <Text style={styles.sectionLabel}>Recent Notices</Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <NoticeCard
            notice={item}
            index={pinnedNotices.length + index}
            onPin={handlePin}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No notices yet"
              message="Tap the button below to post your first notice for parents and staff."
            />
          ) : null
        }
        ListFooterComponent={<View style={{height: spacing.xxxl + spacing.xl}} />}
      />

      <FloatingActionButton
        icon="plus"
        label="New Notice"
        onPress={() => navigation.navigate('PostNotice', {branchId})}
        extended
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

  header: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  headerDecor1: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 80,
    height: 140,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 140,
  },
  headerDecor2: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 60,
    bottom: -20,
    height: 90,
    left: -10,
    position: 'absolute',
    width: 90,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerCopy: {flex: 1},
  headerTitle: {color: colors.white, fontSize: 20, fontWeight: '800'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 2},
  catScroll: {},
  catContent: {gap: spacing.sm},
  catChip: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  catChipActive: {backgroundColor: 'rgba(255,255,255,0.9)'},
  catChipText: {color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700'},
  catChipTextActive: {color: colors.primary},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  pinnedSection: {marginBottom: spacing.sm},

  noticeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.soft,
  },
  noticePinned: {borderColor: `${colors.danger}50`, borderWidth: 1.5},
  pinnedBanner: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pinnedText: {color: colors.white, fontSize: 9, fontWeight: '800', textTransform: 'uppercase'},
  noticeTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  categoryText: {fontSize: 10, fontWeight: '800', textTransform: 'uppercase'},
  noticeDate: {...typography.caption, color: colors.textMuted},
  noticeTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  noticeBody: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  noticeMeta: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  noticeAuthor: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: 4},
  noticeAuthorText: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  pinBtn: {padding: 2},
  expandBtn: {alignItems: 'center', flexDirection: 'row', gap: 2},
  expandText: {color: colors.primary, fontSize: 11, fontWeight: '700'},
});

export default NoticeBoardScreen;
