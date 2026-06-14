import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Menu, TextInput} from 'react-native-paper';
import {colors, radius, spacing} from '../../theme';

const SelectField = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  disabled,
}) => {
  const [visible, setVisible] = useState(false);
  const selected = options.find(option => option.value === value);

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        contentStyle={styles.menu}
        anchor={
          <TextInput
            mode="outlined"
            label={label}
            value={selected?.label || ''}
            placeholder={placeholder}
            editable={false}
            disabled={disabled}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            placeholderTextColor={colors.textSoft}
            outlineStyle={styles.outline}
            style={styles.input}
            right={
              <TextInput.Icon
                icon="menu-down"
                onPress={() => !disabled && setVisible(true)}
              />
            }
            onPressIn={() => !disabled && setVisible(true)}
          />
        }>
        {options.map(option => (
          <Menu.Item
            key={option.value}
            title={option.label}
            onPress={() => {
              onChange(option.value, option);
              setVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
  },
  menu: {
    backgroundColor: colors.surface,
  },
  outline: {
    borderRadius: radius.sm,
  },
});

export default SelectField;
