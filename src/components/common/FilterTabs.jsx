import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Chip} from 'react-native-paper';
import {colors, radius, spacing} from '../../theme';

const FilterTabs = ({tabs, value, onChange}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}>
    {tabs.map(tab => {
      const active = tab.value === value;

      return (
        <Chip
          key={tab.value}
          selected={active}
          onPress={() => onChange(tab.value)}
          style={[styles.chip, active && styles.activeChip]}
          textStyle={[styles.text, active && styles.activeText]}>
          {tab.label}
        </Chip>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  activeChip: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  text: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  activeText: {
    color: colors.primary,
  },
});

export default FilterTabs;
