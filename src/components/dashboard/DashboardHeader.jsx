import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ROLE_LABELS} from '../../config/constants';
import CustomButton from '../buttons/CustomButton';
import {colors, radius, shadows, spacing, typography} from '../../theme';

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
});

export default DashboardHeader;
