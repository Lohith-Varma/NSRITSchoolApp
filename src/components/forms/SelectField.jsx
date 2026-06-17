import React, {useState} from 'react';
import {FlatList, Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../theme';

const SelectField = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  disabled,
  style,
}) => {
  const [visible, setVisible] = useState(false);
  const selected = options?.find(o => o.value === value);

  const open = () => { if (!disabled) setVisible(true); };
  const close = () => setVisible(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={open}
        style={[styles.trigger, disabled && styles.triggerDisabled]}>
        <Text style={[styles.triggerText, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label || placeholder}
        </Text>
        <MaterialCommunityIcons
          name={visible ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={disabled ? colors.textSoft : colors.textMuted}
        />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.overlay} onPress={close}>
          <View style={styles.sheet}>
            {label ? <Text style={styles.sheetTitle}>{label}</Text> : null}
            <FlatList
              data={options}
              keyExtractor={item => String(item.value)}
              renderItem={({item}) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => { onChange(item.value, item); close(); }}
                    style={({pressed}) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && {opacity: 0.7},
                    ]}>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <MaterialCommunityIcons name="check" size={16} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
              bounces={false}
              style={styles.list}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {marginBottom: spacing.md},
  label: {color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 6},

  trigger: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  triggerDisabled: {backgroundColor: colors.background, opacity: 0.6},
  triggerText: {color: colors.text, flex: 1, fontSize: 14},
  placeholder: {color: colors.textSoft},

  overlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: '60%',
    paddingBottom: 24,
    paddingTop: spacing.lg,
    ...shadows.medium,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  list: {flexGrow: 0},
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
  },
  optionSelected: {backgroundColor: colors.primarySoft},
  optionText: {color: colors.text, flex: 1, fontSize: 14},
  optionTextSelected: {color: colors.primary, fontWeight: '700'},
});

export default SelectField;
