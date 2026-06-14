import React from 'react';
import {StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import {radius, spacing} from '../../theme';

const CustomButton = ({
  children,
  style,
  contentStyle,
  mode = 'contained',
  ...props
}) => (
  <Button
    mode={mode}
    style={[styles.button, style]}
    contentStyle={[styles.content, contentStyle]}
    labelStyle={styles.label}
    {...props}>
    {children}
  </Button>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.sm,
  },
  content: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0,
  },
});

export default CustomButton;
