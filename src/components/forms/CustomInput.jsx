import React from 'react';
import {StyleSheet} from 'react-native';
import {TextInput} from 'react-native-paper';
import {colors, radius, spacing} from '../../theme';

const CustomInput = ({style, ...props}) => (
  <TextInput
    mode="outlined"
    outlineColor={colors.border}
    activeOutlineColor={colors.primary}
    textColor={colors.text}
    placeholderTextColor={colors.textSoft}
    outlineStyle={styles.outline}
    style={[styles.input, style]}
    autoCapitalize="none"
    {...props}
  />
);

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  outline: {
    borderRadius: radius.sm,
  },
});

export default CustomInput;
