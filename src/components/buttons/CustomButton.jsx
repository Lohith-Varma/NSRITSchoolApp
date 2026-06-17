import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';
import {colors, radius, spacing} from '../../theme';

const CustomButton = ({
  children,
  style,
  mode = 'contained',
  loading,
  disabled,
  onPress,
  textStyle,
  ...props
}) => {
  const outlined = mode === 'outlined';
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({pressed}) => [
        styles.button,
        outlined ? styles.outlined : styles.contained,
        (pressed || loading) && {opacity: 0.8},
        disabled && {opacity: 0.5},
        style,
      ]}
      accessibilityRole="button"
      {...props}>
      {loading ? (
        <ActivityIndicator size="small" color={outlined ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.label, outlined && styles.labelOutlined, textStyle]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  contained: {backgroundColor: colors.primary},
  outlined: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  label: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },
  labelOutlined: {color: colors.primary},
});

export default CustomButton;
