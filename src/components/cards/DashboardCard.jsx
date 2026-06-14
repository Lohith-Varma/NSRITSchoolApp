import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const DashboardCard = ({
  title,
  value,
  description,
  onPress,
  icon = 'view-dashboard-outline',
  tone = colors.primary,
}) => (
  <Card mode="outlined" onPress={onPress} style={styles.card}>
    <Card.Content style={styles.content}>
      <View style={styles.row}>
        <View style={[styles.icon, {backgroundColor: `${tone}14`}]}>
          <MaterialCommunityIcons name={icon} size={22} color={tone} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.value, {color: tone}]}>{value}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>
      </View>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  content: {
    paddingVertical: spacing.md,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 42,
    justifyContent: 'center',
    marginTop: spacing.xxs,
    width: 42,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    ...typography.subtitle,
    marginTop: spacing.xs,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default DashboardCard;
