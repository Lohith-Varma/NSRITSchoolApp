/**
 * AppHeader — top bar for management/stack screens.
 * Replaces the old Header component with a cleaner, more structured layout.
 */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import BackButton from './BackButton';
import {colors, spacing, typography} from '../../theme';

const AppHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  onBack,
  children,
  style,
}) => (
  <View style={[styles.container, style]}>
    <View style={styles.left}>
      {onBack ? (
        <BackButton
          onPress={typeof onBack === 'function' ? onBack : undefined}
          style={styles.backBtn}
        />
      ) : null}
      <View style={styles.copy}>
        {subtitle ? <Text style={styles.overline}>{subtitle}</Text> : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>

    <View style={styles.right}>
      {children}
      {actionLabel ? (
        <Pressable onPress={onAction} style={styles.actionBtn} hitSlop={6}>
          {actionIcon ? (
            <MaterialCommunityIcons
              name={actionIcon}
              size={16}
              color={colors.primary}
            />
          ) : null}
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    height: 56,
  },
  left: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  backBtn: {
    marginRight: 2,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  overline: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: 1,
    fontSize: 9,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
  },
  actionBtn: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 11,
  },
});

export default AppHeader;
