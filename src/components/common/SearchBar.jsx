import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, spacing} from '../../theme';

const SearchBar = ({value, onChangeText, placeholder = 'Search', style}) => (
  <View style={[styles.wrap, style]}>
    <MaterialCommunityIcons name="magnify" size={18} color={colors.textSoft} />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSoft}
      style={styles.input}
    />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
});

export default SearchBar;
