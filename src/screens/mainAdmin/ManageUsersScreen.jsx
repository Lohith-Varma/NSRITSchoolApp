import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const USER_ACTIONS = [
  {
    id: 'branchAdmin',
    title: 'Branch Admin',
    description: 'Create administrators for specific branches',
    icon: 'shield-account',
    color: colors.primary,
    colorSoft: colors.primarySoft,
    cta: 'Create Branch Admin',
  },
  {
    id: 'schoolRoles',
    title: 'School Roles',
    description: 'Create Principals, Coordinators, Teachers, and Parents',
    icon: 'account-group',
    color: colors.secondary,
    colorSoft: colors.secondarySoft,
    cta: 'Create School User',
  },
];

const ActionCard = ({item, index, onPress}) => (
  <Animated.View
    entering={FadeInRight.delay(index * 80).duration(280).springify()}>
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, {backgroundColor: item.colorSoft}]}>
          <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
      </View>
      <View style={[styles.cardCta, {backgroundColor: item.color}]}>
        <MaterialCommunityIcons name="plus" size={14} color={colors.white} />
        <Text style={styles.cardCtaText}>{item.cta}</Text>
      </View>
    </Pressable>
  </Animated.View>
);

const ManageUsersScreen = ({navigation}) => {
  const navigateToBranchList = () => {
    Toast.show({
      type: 'info',
      text1: 'Select a branch',
      text2: 'Users must be provisioned within a specific branch context.',
    });
    navigation.navigate('BranchList');
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <Animated.View
        entering={FadeInDown.duration(280).springify()}
        style={styles.header}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerOverline}>Main Admin</Text>
        <Text style={styles.headerTitle}>Create Users</Text>
        <Text style={styles.headerSub}>
          Provision branch admins and role-based school users
        </Text>
      </Animated.View>

      {/* ── Info notice ── */}
      <Animated.View
        entering={FadeInDown.delay(60).duration(260).springify()}
        style={styles.notice}>
        <MaterialCommunityIcons
          name="information-outline"
          size={15}
          color={colors.primary}
        />
        <Text style={styles.noticeText}>
          Select a branch first. All users must be provisioned within a specific
          branch context.
        </Text>
      </Animated.View>

      {/* ── Action cards ── */}
      {USER_ACTIONS.map((item, i) => (
        <ActionCard
          key={item.id}
          item={item}
          index={i}
          onPress={navigateToBranchList}
        />
      ))}

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  header: {
    backgroundColor: colors.primaryDark,
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
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  notice: {
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  noticeText: {
    color: colors.primary,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.soft,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cardIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  cardCopy: {flex: 1},
  cardTitle: {...typography.bodyBold, color: colors.text, fontSize: 16},
  cardDesc: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 3,
  },
  cardCta: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 42,
    justifyContent: 'center',
    ...shadows.soft,
  },
  cardCtaText: {color: colors.white, fontSize: 14, fontWeight: '700'},
});

export default ManageUsersScreen;
