import React, {useState} from 'react';
import {FlatList, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {EmptyState, FloatingActionButton} from '../../components';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const CATEGORIES = ['All', 'Academic', 'Fee', 'Holiday', 'Event', 'Urgent'];

const CATEGORY_META = {
  Academic: {color: colors.primary, icon: 'school-outline'},
  Fee: {color: colors.secondary, icon: 'cash-multiple'},
  Holiday: {color: colors.success, icon: 'calendar-star'},
  Event: {color: colors.purple, icon: 'party-popper'},
  Urgent: {color: colors.danger, icon: 'alert-circle-outline'},
};

const MOCK_NOTICES = [
  {
    id: 'n1',
    category: 'Urgent',
    title: 'Term II Fee Payment Deadline Extended',
    body: 'Due to technical issues with the payment gateway, the deadline for Term II fee payment has been extended to 25th June 2026. Parents are requested to complete payment before the new deadline.',
    date: '2026-06-17',
    author: 'Principal Office',
    pinned: true,
    readCount: 142,
  },
  {
    id: 'n2',
    category: 'Academic',
    title: 'Annual Examination Schedule Released',
    body: 'The timetable for annual examinations (Classes I–XII) has been published on the school portal. Students must carry hall tickets during the examination period from 20th June to 5th July.',
    date: '2026-06-15',
    author: 'Academic Committee',
    pinned: false,
    readCount: 289,
  },
  {
    id: 'n3',
    category: 'Holiday',
    title: 'Summer Vacation Dates Announced',
    body: 'School will remain closed from 1st July to 31st July 2026 for summer vacation. The new academic year will commence on 1st August 2026.',
    date: '2026-06-12',
    author: 'Principal Office',
    pinned: false,
    readCount: 431,
  },
  {
    id: 'n4',
    category: 'Event',
    title: 'Annual Sports Day – Registration Open',
    body: 'Registration for Annual Sports Day events is now open. Students can register through the class teacher on or before 22nd June. Events include track, field, and team sports for all age groups.',
    date: '2026-06-10',
    author: 'Sports Department',
    pinned: false,
    readCount: 198,
  },
  {
    id: 'n5',
    category: 'Fee',
    title: 'Transport Fee Revision — AY 2026-27',
    body: 'The transport fee for the academic year 2026-27 has been revised. The updated fee structure is available on the parent portal. Bus route changes will be communicated separately.',
    date: '2026-06-08',
    author: 'Accounts Department',
    pinned: false,
    readCount: 167,
  },
];

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

const NoticeCard = ({notice, index}) => {
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
          <View
            style={[
              styles.categoryBadge,
              {backgroundColor: `${meta.color}15`},
            ]}>
            <MaterialCommunityIcons name={meta.icon} size={11} color={meta.color} />
            <Text style={[styles.categoryText, {color: meta.color}]}>
              {notice.category}
            </Text>
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
            <MaterialCommunityIcons
              name="account-tie-outline"
              size={12}
              color={colors.textMuted}
            />
            <Text style={styles.noticeAuthorText}>{notice.author}</Text>
          </View>
          <View style={styles.noticeReads}>
            <MaterialCommunityIcons
              name="eye-outline"
              size={12}
              color={colors.textSoft}
            />
            <Text style={styles.noticeReadsText}>{notice.readCount}</Text>
          </View>
          <View style={styles.expandBtn}>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.primary}
            />
            <Text style={styles.expandText}>
              {expanded ? 'Less' : 'More'}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const NoticeBoardScreen = ({navigation}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered =
    selectedCategory === 'All'
      ? MOCK_NOTICES
      : MOCK_NOTICES.filter(n => n.category === selectedCategory);

  const pinnedNotices = filtered.filter(n => n.pinned);
  const regularNotices = filtered.filter(n => !n.pinned);

  return (
    <View style={styles.root}>
      <FlatList
        data={regularNotices}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <Animated.View
              entering={FadeInDown.duration(280).springify()}
              style={styles.header}>
              <View style={styles.headerDecor1} />
              <View style={styles.headerDecor2} />
              <View style={styles.headerRow}>
                <MaterialCommunityIcons
                  name="bulletin-board"
                  size={22}
                  color={colors.white}
                />
                <View style={styles.headerCopy}>
                  <Text style={styles.headerTitle}>Notice Board</Text>
                  <Text style={styles.headerSub}>
                    {MOCK_NOTICES.length} notices · Principal Edition
                  </Text>
                </View>
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
                    style={[
                      styles.catChip,
                      selectedCategory === cat && styles.catChipActive,
                    ]}>
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
                  <MaterialCommunityIcons name="pin" size={12} color={colors.danger} />
                  {'  '}Pinned
                </Text>
                {pinnedNotices.map((notice, i) => (
                  <NoticeCard key={notice.id} notice={notice} index={i} />
                ))}
              </View>
            ) : null}

            {regularNotices.length > 0 ? (
              <Text style={styles.sectionLabel}>Recent Notices</Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <NoticeCard notice={item} index={pinnedNotices.length + index} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No notices"
            message="Post a notice using the button below. It will be visible to all parents and staff."
          />
        }
        ListFooterComponent={<View style={{height: spacing.xxxl + spacing.xl}} />}
      />

      <FloatingActionButton
        icon="plus"
        label="New Notice"
        onPress={() => navigation.navigate('PostNotice')}
        extended
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

  // Header
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

  // Notice card
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
  noticePinned: {
    borderColor: `${colors.danger}50`,
    borderWidth: 1.5,
  },
  pinnedBanner: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 4,
    alignSelf: 'flex-start',
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
  noticeReads: {alignItems: 'center', flexDirection: 'row', gap: 3},
  noticeReadsText: {color: colors.textSoft, fontSize: 11, fontWeight: '600'},
  expandBtn: {alignItems: 'center', flexDirection: 'row', gap: 2},
  expandText: {color: colors.primary, fontSize: 11, fontWeight: '700'},
});

export default NoticeBoardScreen;
