import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../buttons/CustomButton';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const EmptyState = ({
  title = 'Nothing here yet',
  message,
  icon = 'inbox-outline',
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    <View style={styles.icon}>
      <MaterialCommunityIcons name={icon} size={28} color={colors.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {actionLabel ? (
      <CustomButton mode="outlined" style={styles.action} onPress={onAction}>
        {actionLabel}
      </CustomButton>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...shadows.soft,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 56,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.lg,
  },
});

export default EmptyState;
