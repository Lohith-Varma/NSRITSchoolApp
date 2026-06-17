import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn, FadeOut } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { switchRole } from '../../store/slices/authSlice';
import authService from '../../services/auth/authService';
import { USER_ROLES, ROLE_LABELS } from '../../config/constants';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import { authConfig } from '../../config/env';

export const RoleSwitcherModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { user, role: currentRole } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState([]);
  
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      loadAvailableRoles();
    } else {
      scale.value = 0.9;
    }
  }, [visible]);

  const loadAvailableRoles = async () => {
    if (authConfig.ENABLE_DEV_OTP_BYPASS && __DEV__) {
      // In dev bypass, enable switching to ALL roles
      const allRoles = Object.keys(USER_ROLES).map(k => ({
        role: USER_ROLES[k],
        fullName: user?.fullName || 'Dev User',
        isMock: true
      }));
      setAvailableProfiles(allRoles);
      return;
    }

    if (!user?.phoneNumber) return;

    setLoading(true);
    try {
      const profiles = await authService.fetchUsersByPhone(user.phoneNumber);
      setAvailableProfiles(profiles.map(p => ({
        role: p.role,
        fullName: p.fullName,
        profileData: p,
        isMock: false
      })));
    } catch (e) {
      console.warn('Failed to load other roles:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (item) => {
    setLoading(true);
    try {
      await dispatch(switchRole({
        role: item.role,
        profileData: item.profileData,
        phoneNumber: user?.phoneNumber,
        countryCode: user?.countryCode
      })).unwrap();
      onClose();
    } catch (e) {
      console.warn('Role switch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getRoleIcon = (r) => {
    switch (r) {
      case USER_ROLES.MAIN_ADMIN: return 'shield-crown';
      case USER_ROLES.BRANCH_ADMIN: return 'office-building-cog';
      case USER_ROLES.PRINCIPAL: return 'account-tie';
      case USER_ROLES.COORDINATOR: return 'account-supervisor';
      case USER_ROLES.TEACHER: return 'human-male-board';
      case USER_ROLES.PARENT: return 'account-child-circle';
      case USER_ROLES.ACCOUNTANT: return 'cash-register';
      case USER_ROLES.FRONT_DESK: return 'deskphone';
      default: return 'account';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn.duration(200)} 
        exiting={FadeOut.duration(150)} 
        style={styles.backdrop}
      >
        <Pressable style={styles.dismissPressable} onPress={onClose} />
        
        <Animated.View style={[styles.card, animatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>Switch active profile</Text>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={6}>
              <MaterialCommunityIcons name="close" size={20} color={colors.textSoft} />
            </Pressable>
          </View>

          <View style={styles.currentRoleContainer}>
            <Text style={styles.currentLabel}>Current Profile</Text>
            <View style={styles.currentCard}>
              <View style={styles.currentIconWrapper}>
                <MaterialCommunityIcons name={getRoleIcon(currentRole)} size={22} color={colors.white} />
              </View>
              <View>
                <Text style={styles.currentName}>{user?.fullName || 'User'}</Text>
                <Text style={styles.currentRoleText}>{ROLE_LABELS[currentRole] || currentRole}</Text>
              </View>
              <MaterialCommunityIcons name="check" size={20} color={colors.success} style={styles.checkIcon} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Available Profiles</Text>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
              {availableProfiles
                .filter(item => item.role !== currentRole)
                .map((item, idx) => (
                  <Pressable 
                    key={idx} 
                    style={({ pressed }) => [
                      styles.roleItem,
                      pressed && styles.roleItemPressed
                    ]}
                    onPress={() => handleRoleSelect(item)}
                  >
                    <View style={styles.roleIconWrapper}>
                      <MaterialCommunityIcons name={getRoleIcon(item.role)} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.roleMeta}>
                      <Text style={styles.roleName}>{ROLE_LABELS[item.role] || item.role}</Text>
                      {item.isMock && <Text style={styles.mockBadge}>Bypass Mode</Text>}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textMuted} />
                  </Pressable>
                ))}
              {availableProfiles.filter(item => item.role !== currentRole).length === 0 && (
                <Text style={styles.emptyText}>No other roles linked to this account.</Text>
              )}
            </ScrollView>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dismissPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    maxHeight: 460,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.headline,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    padding: 2,
  },
  currentRoleContainer: {
    padding: spacing.lg,
    backgroundColor: `${colors.neutralSoft}44`,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currentLabel: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  currentIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentName: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  currentRoleText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSoft,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  scrollList: {
    maxHeight: 220,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  roleItemPressed: {
    opacity: 0.7,
  },
  roleIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleName: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  mockBadge: {
    fontSize: 9,
    color: colors.primary,
    backgroundColor: `${colors.primary}12`,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  loaderContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
});

export default RoleSwitcherModal;
