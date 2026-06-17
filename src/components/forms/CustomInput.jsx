import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, spacing} from '../../theme';

const CustomInput = ({style, label, error, icon, ...props}) => (
  <View style={[styles.wrapper, style]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <View style={[styles.inputWrap, error && styles.inputWrapError]}>
      {icon ? (
        <MaterialCommunityIcons name={icon} size={16} color={colors.textSoft} style={styles.icon} />
      ) : null}
      <TextInput
        placeholderTextColor={colors.textSoft}
        style={styles.input}
        autoCapitalize="none"
        {...props}
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {marginBottom: spacing.md},
  label: {color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 6},
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  inputWrapError: {borderColor: colors.danger},
  icon: {marginRight: spacing.sm},
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
  },
  errorText: {color: colors.danger, fontSize: 11, fontWeight: '600', marginTop: 4},
});

export default CustomInput;
