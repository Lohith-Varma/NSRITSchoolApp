import React, {useState, useEffect} from 'react';
import {StyleSheet, View, TextInput, Pressable} from 'react-native';
import {HelperText, Text} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {CustomButton, ScreenContainer} from '../../components';
import {clearAuthError, verifyOtp} from '../../store/slices/authSlice';
import {colors, spacing, typography, radius, shadows} from '../../theme';
import {validateOtp} from '../../utils/validators';

const OTPVerificationScreen = ({route, navigation}) => {
  const dispatch = useDispatch();
  const {loading, error, verificationId: storedVerificationId} = useSelector(state => state.auth);
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');
  const params = route?.params || {};

  useEffect(() => {
    if (error && __DEV__) {
      console.log('Firebase verification error details:', error);
    }
  }, [error]);

  const updateOtp = value => {
    if (error) {
      dispatch(clearAuthError());
    }
    setLocalError('');
    setOtp(value.replace(/\D/g, '').slice(0, 6));
  };

  const handleVerify = async () => {
    const validationError = validateOtp(otp);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    await dispatch(
      verifyOtp({
        otp,
        countryCode: params.countryCode,
        phoneNumber: params.phoneNumber,
        verificationId: params.verificationId || storedVerificationId,
      }),
    );
  };

  // Format connection error or validation error
  const displayError = localError || (error ? 'Unable to connect. Please try again.' : '');

  return (
    <ScreenContainer scroll={true} style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Top: Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="shield-lock" size={42} color={colors.primary} />
          </View>
          <Text style={styles.brandTitle}>Security Verification</Text>
          <Text style={styles.brandSubtitle}>Verifying identity for {params.fullPhoneNumber}</Text>
        </View>

        {/* Middle: Verification Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter OTP</Text>
          <Text style={styles.cardSubtitle}>Please enter the 6-digit code sent to your phone number</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Verification Code</Text>
            <TextInput
              keyboardType="number-pad"
              value={otp}
              maxLength={6}
              placeholder="0 0 0 0 0 0"
              placeholderTextColor={colors.textSoft}
              style={styles.inputCode}
              onChangeText={updateOtp}
            />
          </View>

          {displayError ? (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {displayError}
            </HelperText>
          ) : null}

          <CustomButton
            loading={loading}
            disabled={loading}
            onPress={handleVerify}
            style={styles.submitBtn}
            textStyle={styles.submitBtnText}>
            Verify and Continue
          </CustomButton>
        </View>

        {/* Bottom: Back Button */}
        <View style={styles.footer}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backText}>Change Phone Number</Text>
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
  inputWrapper: {
    marginBottom: spacing.xs,
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
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
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
  },
  backLink: {
    paddingVertical: 2,
  },
  backText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});

export default OTPVerificationScreen;
