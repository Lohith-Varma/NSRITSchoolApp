import React, {useCallback, useEffect, useState} from 'react';
import {
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
import notificationService from '../../services/notifications/notificationService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const ICON_MAP = {
  'Attendance Alert': {icon: 'calendar-remove', color: colors.danger, bg: colors.dangerSoft},
  'Fee Reminder': {icon: 'cash-multiple', color: colors.warning, bg: colors.warningSoft},
  'Notice': {icon: 'bulletin-board', color: colors.info, bg: colors.infoSoft},
  default: {icon: 'bell-outline', color: colors.primary, bg: colors.primaryFaint},
};

const getIconProps = title => {
  for (const key of Object.keys(ICON_MAP)) {
    if (key !== 'default' && title?.toLowerCase().includes(key.toLowerCase())) {
      return ICON_MAP[key];
    }
  }
  return ICON_MAP.default;
};

const formatTime = isoString => {
  if (!isoString) {return '';}
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) {return 'Just now';}
    if (diffMins < 60) {return `${diffMins}m ago`;}
    if (diffHours < 24) {return `${diffHours}h ago`;}
    if (diffDays < 7) {return `${diffDays}d ago`;}
    return date.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
  } catch {
    return '';
  }
};

const NotificationItem = ({item, onPress, index}) => {
  const iconProps = getIconProps(item.title);
  return (
    <Animated.View entering={FadeInRight.delay(index * 40).duration(350).springify()}>
      <Pressable
        onPress={() => onPress(item)}
        style={({pressed}) => [
          styles.notifCard,
          !item.isRead && styles.notifCardUnread,
          pressed && styles.notifCardPressed,
        ]}>
        {/* Unread indicator */}
        {!item.isRead && <View style={styles.unreadDot} />}

        {/* Icon */}
        <View style={[styles.iconWrap, {backgroundColor: iconProps.bg}]}>
          <MaterialCommunityIcons
            name={iconProps.icon}
            size={22}
            color={iconProps.color}
          />
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <View style={styles.notifTopRow}>
            <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.notifMessage} numberOfLines={3}>
            {item.message}
          </Text>
          {item.branch?.name ? (
            <View style={styles.branchChip}>
              <MaterialCommunityIcons name="office-building" size={10} color={colors.textSoft} />
              <Text style={styles.branchChipText}>{item.branch.name}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const EmptyNotifications = () => (
  <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyWrap}>
    <View style={styles.emptyIconRing}>
      <MaterialCommunityIcons name="bell-off-outline" size={44} color={colors.textSoft} />
    </View>
    <Text style={styles.emptyTitle}>All caught up!</Text>
    <Text style={styles.emptySub}>
      You have no notifications yet. Attendance alerts and school updates will appear here.
    </Text>
  </Animated.View>
);

const NotificationCenterScreen = () => {
  const user = useSelector(state => state.auth.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async (isRefresh = false) => {
    if (!user?.id) {return;}
    if (isRefresh) {setRefreshing(true);}
    else {setLoading(true);}
    try {
      const [data, count] = await Promise.all([
        notificationService.getNotifications({userId: user.id}),
        notificationService.getUnreadCount(user.id),
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch (err) {
      console.log('[NotificationCenter] Load failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = useCallback(async item => {
    if (item.isRead) {return;}
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? {...n, isRead: true} : n)),
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    await notificationService.markRead(item.id);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    if (!user?.id || unreadCount === 0) {return;}
    setNotifications(prev => prev.map(n => ({...n, isRead: true})));
    setUnreadCount(0);
    await notificationService.markAllRead(user.id);
  }, [user?.id, unreadCount]);

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.listHeader}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 ? (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          ) : (
            <Text style={styles.headerSub}>All read</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllRead} style={styles.markAllBtn} hitSlop={8}>
            <MaterialCommunityIcons name="check-all" size={16} color={colors.primary} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Summary chips */}
      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <MaterialCommunityIcons name="bell-outline" size={13} color={colors.primary} />
          <Text style={styles.chipText}>{notifications.length} Total</Text>
        </View>
        <View style={[styles.chip, {backgroundColor: colors.dangerSoft, borderColor: colors.danger}]}>
          <MaterialCommunityIcons name="bell-ring-outline" size={13} color={colors.danger} />
          <Text style={[styles.chipText, {color: colors.danger}]}>{unreadCount} Unread</Text>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <MaterialCommunityIcons name="bell-outline" size={32} color={colors.border} />
        <Text style={styles.loadingText}>Loading notifications…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <NotificationItem item={item} onPress={handleMarkRead} index={index} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={EmptyNotifications}
        contentContainerStyle={[
          styles.list,
          notifications.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadNotifications(true)}
            tintColor={colors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  listEmpty: {
    flexGrow: 1,
  },
  // List header
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    color: colors.text,
  },
  headerSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  markAllBtn: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  markAllText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  // Notification card
  notifCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
    position: 'relative',
  },
  notifCardUnread: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
  },
  notifCardPressed: {
    opacity: 0.85,
  },
  unreadDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 8,
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    width: 8,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 44,
    justifyContent: 'center',
    width: 44,
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  notifTitle: {
    ...typography.captionBold,
    color: colors.textMuted,
    flex: 1,
    fontSize: 13,
  },
  notifTitleUnread: {
    color: colors.text,
    fontWeight: '800',
  },
  notifTime: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '500',
    flexShrink: 0,
  },
  notifMessage: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  branchChip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  branchChipText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '500',
  },
  separator: {
    height: spacing.sm,
  },
  // Loading
  loadingWrap: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  // Empty
  emptyWrap: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
  emptyIconRing: {
    alignItems: 'center',
    backgroundColor: colors.neutralSoft,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
  },
  emptySub: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default NotificationCenterScreen;
