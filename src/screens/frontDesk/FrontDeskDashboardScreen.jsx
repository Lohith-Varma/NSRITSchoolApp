import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const SERVICE_TILES = [
  {
    key: 'admissions',
    icon: 'account-plus',
    label: 'New Admissions',
    desc: 'Register prospective students and manage enquiries',
    color: colors.primary,
    route: 'Admissions',
  },
  {
    key: 'visitors',
    icon: 'card-account-details',
    label: 'Visitor Registration',
    desc: 'Check-in and track campus visitors',
    color: colors.secondary,
    route: 'Visitors',
  },
  {
    key: 'students',
    icon: 'school-outline',
    label: 'Student Lookup',
    desc: 'Search student information and contacts',
    color: colors.info,
    route: 'Students',
  },
];

const QUICK_STATS = [
  {label: "Today's Visitors", value: '12', icon: 'account-eye-outline', color: colors.secondary},
  {label: 'Enquiries', value: '4', icon: 'help-circle-outline', color: colors.warning},
  {label: 'Admissions', value: '2', icon: 'account-plus-outline', color: colors.success},
];

const ServiceTile = ({tile, onPress, delay = 0}) => (
  <Animated.View entering={FadeInRight.delay(delay).duration(260).springify()}>
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.tile, pressed && {opacity: 0.88}]}>
      <View
        style={[styles.tileIconWrap, {backgroundColor: `${tile.color}15`}]}>
        <MaterialCommunityIcons name={tile.icon} size={26} color={tile.color} />
      </View>
      <View style={styles.tileCopy}>
        <Text style={styles.tileLabel}>{tile.label}</Text>
        <Text style={styles.tileDesc}>{tile.desc}</Text>
      </View>
      <View style={[styles.tileChevron, {backgroundColor: `${tile.color}10`}]}>
        <MaterialCommunityIcons name="chevron-right" size={18} color={tile.color} />
      </View>
    </Pressable>
  </Animated.View>
);

const FrontDeskDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) {return 'Good morning';}
    if (h < 17) {return 'Good afternoon';}
    return 'Good evening';
  };

  const initials = (user?.fullName || user?.name || 'FD')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <Animated.View
        entering={FadeInDown.duration(280).springify()}
        style={styles.header}>
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        <View style={styles.headerTop}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>
              {user?.fullName || user?.name || 'Front Desk'}
            </Text>
          </View>
          <Pressable
            onPress={() => dispatch(logoutUser())}
            style={styles.logoutBtn}>
            <MaterialCommunityIcons
              name="logout-variant"
              size={18}
              color="rgba(255,255,255,0.85)"
            />
          </Pressable>
        </View>

        <View style={styles.roleBadge}>
          <View style={styles.roleDot} />
          <Text style={styles.roleText}>Reception & Front Desk</Text>
        </View>

        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </Animated.View>

      {/* ── Quick stats ── */}
      <Animated.View
        entering={FadeInDown.delay(60).duration(280).springify()}
        style={styles.statsCard}>
        {QUICK_STATS.map((stat, i) => (
          <React.Fragment key={stat.label}>
            {i > 0 ? <View style={styles.statSep} /> : null}
            <View style={styles.statItem}>
              <View style={[styles.statIcon, {backgroundColor: `${stat.color}15`}]}>
                <MaterialCommunityIcons name={stat.icon} size={16} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </Animated.View>

      {/* ── Services ── */}
      <Text style={styles.sectionLabel}>Desk Services</Text>
      <View style={styles.tilesGroup}>
        {SERVICE_TILES.map((tile, i) => (
          <React.Fragment key={tile.key}>
            {i > 0 ? <View style={styles.tileDiv} /> : null}
            <ServiceTile
              tile={tile}
              onPress={() => navigation.navigate(tile.route)}
              delay={i * 40}
            />
          </React.Fragment>
        ))}
      </View>

      {/* ── Quick tips ── */}
      <Animated.View
        entering={FadeInDown.delay(180).duration(280).springify()}
        style={styles.tipCard}>
        <MaterialCommunityIcons
          name="information-outline"
          size={16}
          color={colors.info}
          style={{marginBottom: spacing.xs}}
        />
        <Text style={styles.tipTitle}>Quick Note</Text>
        <Text style={styles.tipBody}>
          All visitor check-ins are timestamped and logged automatically. Ensure
          IDs are collected before granting campus access.
        </Text>
      </Animated.View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: spacing.xxxl},

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
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  avatarText: {color: colors.white, fontSize: 15, fontWeight: '800'},
  headerCopy: {flex: 1, minWidth: 0},
  greeting: {color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase'},
  name: {color: colors.white, fontSize: 18, fontWeight: '800', marginTop: 1},
  logoutBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  roleBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  roleDot: {
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  roleText: {color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600'},
  headerDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Stats card
  statsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  statItem: {alignItems: 'center', flex: 1, gap: 5},
  statIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    marginBottom: 2,
    width: 36,
  },
  statValue: {color: colors.text, fontSize: 20, fontWeight: '800'},
  statLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center'},
  statSep: {backgroundColor: colors.border, width: 1},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },

  // Tiles
  tilesGroup: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.soft,
  },
  tile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  tileIconWrap: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  tileCopy: {flex: 1},
  tileLabel: {...typography.bodyBold, color: colors.text, fontSize: 15},
  tileDesc: {...typography.caption, color: colors.textMuted, lineHeight: 16, marginTop: 2},
  tileChevron: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  tileDiv: {backgroundColor: colors.border, height: 1, marginLeft: 82},

  // Tip card
  tipCard: {
    backgroundColor: colors.infoSoft,
    borderColor: `${colors.info}30`,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  tipTitle: {...typography.bodyBold, color: colors.info, marginBottom: spacing.xs},
  tipBody: {color: colors.textMuted, fontSize: 12, lineHeight: 18},
});

export default FrontDeskDashboardScreen;
