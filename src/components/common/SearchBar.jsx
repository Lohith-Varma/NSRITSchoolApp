import React from 'react';
import {StyleSheet} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {colors, radius, spacing} from '../../theme';

const SearchBar = ({value, onChangeText, placeholder = 'Search', style}) => (
  <Searchbar
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    elevation={0}
    style={[styles.search, style]}
    inputStyle={styles.input}
    placeholderTextColor={colors.textSoft}
  />
);

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  input: {
    color: colors.text,
    minHeight: 0,
  },
});

export default SearchBar;
