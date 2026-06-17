import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import {colors, radius, spacing} from '../../theme';

const FilterTabs = ({tabs, value, onChange}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}>
    {tabs.map(tab => {
      const active = tab.value === value;
      return (
        <Pressable
          key={tab.value}
          onPress={() => onChange(tab.value)}
          style={[styles.chip, active && styles.activeChip]}>
          <Text style={[styles.text, active && styles.activeText]}>{tab.label}</Text>
        </Pressable>
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
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  activeChip: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  text: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  activeText: {
    color: colors.primary,
  },
});

export default FilterTabs;
