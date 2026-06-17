import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import teacherService from '../../services/teachers/teacherService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const Field = ({label, icon, value, onChangeText, placeholder, keyboardType}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputWrap}>
      <MaterialCommunityIcons name={icon} size={16} color={colors.textMuted} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor={colors.textSoft}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
      />
    </View>
  </View>
);

const AssignTeachersScreen = () => {
  const [form, setForm] = useState({
    teacherId: '',
    teacherName: '',
    classId: '',
    sectionId: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) =>
    setForm(current => ({...current, [field]: value}));

  const handleAssign = async () => {
    setLoading(true);
    setMessage('');
    await teacherService.assignTeacher(form);
    setMessage('Teacher assignment saved successfully.');
    setLoading(false);
  };

  const canSubmit = Boolean(form.teacherId && form.classId) && !loading;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <Animated.View
          entering={FadeInDown.duration(280).springify()}
          style={styles.header}>
          <View style={styles.headerDecor} />
          <Text style={styles.headerOverline}>Coordinator</Text>
          <Text style={styles.headerTitle}>Assign Teachers</Text>
          <Text style={styles.headerSub}>
            Map a branch teacher to a class and section
          </Text>
        </Animated.View>

        {/* ── Form ── */}
        <Animated.View
          entering={FadeInDown.delay(60).duration(260).springify()}
          style={styles.formCard}>
          <Field
            label="Teacher ID"
            icon="badge-account-outline"
            value={form.teacherId}
            onChangeText={v => updateField('teacherId', v)}
            placeholder="e.g. TCH-001"
          />
          <Field
            label="Teacher Name"
            icon="account-tie-outline"
            value={form.teacherName}
            onChangeText={v => updateField('teacherName', v)}
            placeholder="Full name"
          />
          <Field
            label="Class ID"
            icon="school-outline"
            value={form.classId}
            onChangeText={v => updateField('classId', v)}
            placeholder="e.g. class-id"
          />
          <Field
            label="Section ID"
            icon="google-classroom"
            value={form.sectionId}
            onChangeText={v => updateField('sectionId', v)}
            placeholder="e.g. section-id"
          />
        </Animated.View>

        {/* ── Success message ── */}
        {message ? (
          <View style={styles.successBox}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={16}
              color={colors.success}
            />
            <Text style={styles.successText}>{message}</Text>
          </View>
        ) : null}

        {/* ── Submit ── */}
        <Pressable
          onPress={handleAssign}
          disabled={!canSubmit}
          style={({pressed}) => [
            styles.submitBtn,
            !canSubmit && styles.submitBtnDisabled,
            pressed && canSubmit && {opacity: 0.88},
          ]}>
          {loading ? (
            <Text style={styles.submitText}>Saving…</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.white} />
              <Text style={styles.submitText}>Save Assignment</Text>
            </>
          )}
        </Pressable>

        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  header: {
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 120,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 120,
  },
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.soft,
  },
  fieldWrap: {marginBottom: spacing.md},
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    height: 46,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {marginRight: spacing.sm},
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },

  successBox: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  successText: {color: colors.success, flex: 1, fontSize: 13, fontWeight: '600'},

  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 52,
    justifyContent: 'center',
    ...shadows.medium,
  },
  submitBtnDisabled: {backgroundColor: colors.border},
  submitText: {color: colors.white, fontSize: 15, fontWeight: '700'},
});

export default AssignTeachersScreen;
