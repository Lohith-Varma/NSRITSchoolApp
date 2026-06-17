import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ROLE_LABELS} from '../../config/constants';
import {switchActiveRole} from '../../store/slices/authSlice';
import CustomButton from '../buttons/CustomButton';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const RoleSwitch = () => {
  const dispatch = useDispatch();
  const {role, user, loading} = useSelector(state => state.auth);
  const roles = (user?.roles || []).filter(item => item && item !== role);

  if (!roles.length) {
    return null;
  }

  return (
    <View style={styles.switchContainer}>
      <Text style={styles.switchLabel}>Switch Role</Text>
      <View style={styles.switchRow}>
        {roles.map(item => (
          <CustomButton
            key={item}
            compact
            disabled={loading}
            mode="contained-tonal"
            onPress={() => dispatch(switchActiveRole(item))}>
            {ROLE_LABELS[item] || item}
          </CustomButton>
        ))}
      </View>
    </View>
  );
};

const DashboardHeader = ({name, role, subtitle, onLogout}) => (
  <View style={styles.container}>
    <View style={styles.topRow}>
      <View style={styles.roleRow}>
        <View style={styles.iconBubble}>
          <MaterialCommunityIcons
            name="school-outline"
            size={22}
            color={colors.white}
          />
        </View>
        <View>
          <Text style={styles.caption}>Welcome back</Text>
          <Text style={styles.subtitle}>{subtitle || ROLE_LABELS[role]}</Text>
        </View>
      </View>
      {onLogout ? (
        <CustomButton compact mode="contained-tonal" onPress={onLogout}>
          Logout
        </CustomButton>
      ) : null}
    </View>
    <Text style={styles.title}>
      {name || ROLE_LABELS[role] || 'NSRIT User'}
    </Text>
    <RoleSwitch />
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...shadows.medium,
    backgroundColor: colors.primary,
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  roleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
    paddingRight: spacing.md,
  },
  iconBubble: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
  },
  caption: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    color: colors.white,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    marginTop: spacing.xs,
  },
  switchContainer: {
    marginTop: spacing.lg,
  },
  switchLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

export default DashboardHeader;
