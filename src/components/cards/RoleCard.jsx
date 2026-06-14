import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {ROLE_LABELS} from '../../config/constants';
import {colors, radius, spacing, typography} from '../../theme';

const RoleCard = ({role, description}) => (
  <Card mode="outlined" style={styles.card}>
    <Card.Content>
      <Text style={styles.role}>{ROLE_LABELS[role] || role}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  role: {
    ...typography.subtitle,
    color: colors.primaryDark,
  },
  description: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default RoleCard;
