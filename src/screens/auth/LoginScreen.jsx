import React, {useState, useEffect} from 'react';
import {StyleSheet, View, TextInput, Pressable} from 'react-native';
import {HelperText, Text} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {CustomButton, ScreenContainer} from '../../components';
import {clearAuthError, sendOtp} from '../../store/slices/authSlice';
import {colors, spacing, typography, radius, shadows} from '../../theme';
import {validatePhoneLogin} from '../../utils/validators';

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {loading, error} = useSelector(state => state.auth);
  const [form, setForm] = useState({countryCode: '+91', phoneNumber: ''});
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error && __DEV__) {
      console.log('Firebase login error details:', error);
    }
  }, [error]);

  const updateField = (field, value) => {
    if (error) {
      dispatch(clearAuthError());
    }
    setLocalError('');
    setForm(current => ({...current, [field]: value}));
  };

  const handleSendOtp = async () => {
    const validationError = validatePhoneLogin(form);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const action = await dispatch(sendOtp(form));
    if (sendOtp.fulfilled.match(action)) {
      navigation.navigate('OTPVerification', {
        ...form,
        verificationId: action.payload.verificationId,
        fullPhoneNumber: action.payload.fullPhoneNumber,
      });
    }
  };

  // Format connection error or validation error
  const displayError = localError || (error ? 'Unable to connect. Please try again.' : '');

  return (
    <ScreenContainer scroll={true} style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Top: Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="school" size={42} color={colors.primary} />
          </View>
          <Text style={styles.brandTitle}>NSRIT Connect</Text>
          <Text style={styles.brandSubtitle}>Enterprise School Management System</Text>
        </View>

        {/* Middle: Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>Enter your registered phone number to verify via OTP</Text>

          <View style={styles.phoneRow}>
            <View style={styles.inputWrapperCode}>
              <Text style={styles.inputLabel}>Code</Text>
              <TextInput
                keyboardType="phone-pad"
                value={form.countryCode}
                placeholder="+91"
                placeholderTextColor={colors.textSoft}
                style={styles.inputCode}
                onChangeText={value => updateField('countryCode', value)}
              />
            </View>
            <View style={styles.inputWrapperPhone}>
              <Text style={styles.inputLabel}>Phone number</Text>
              <TextInput
                keyboardType="phone-pad"
                value={form.phoneNumber}
                placeholder="Enter 10-digit number"
                placeholderTextColor={colors.textSoft}
                style={styles.inputPhone}
                onChangeText={value => updateField('phoneNumber', value)}
              />
            </View>
          </View>

          {displayError ? (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {displayError}
            </HelperText>
          ) : null}

          <CustomButton
            loading={loading}
            disabled={loading}
            onPress={handleSendOtp}
            style={styles.submitBtn}
            textStyle={styles.submitBtnText}>
            Send OTP
          </CustomButton>
        </View>

        {/* Bottom: Help / Support */}
        <View style={styles.footer}>
          <Text style={styles.helpText}>Need Help?</Text>
          <Pressable onPress={() => {}} style={styles.supportLink}>
            <Text style={styles.supportText}>Contact Administrator</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    minHeight: 520,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 420,
    marginBottom: spacing.xl,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  inputWrapperCode: {
    flex: 0.28,
  },
  inputWrapperPhone: {
    flex: 0.72,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  inputCode: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputPhone: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    paddingHorizontal: 0,
    marginTop: spacing.xxs,
    marginBottom: spacing.xxs,
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 4,
  },
  helpText: {
    fontSize: 11,
    color: colors.textSoft,
    fontWeight: '600',
  },
  supportLink: {
    paddingVertical: 2,
  },
  supportText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
