import React, {useEffect, useRef, useState} from 'react';
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
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {clearAuthError, verifyOtp} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {validateOtp} from '../../utils/validators';
import {LoadingOverlay} from '../../components';

// Individual OTP digit box
const OtpBox = ({value, focused}) => (
  <View
    style={[
      styles.otpBox,
      value && styles.otpBoxFilled,
      focused && styles.otpBoxFocused,
    ]}>
    <Text style={styles.otpDigit}>{value || ''}</Text>
    {focused && !value ? <View style={styles.cursor} /> : null}
  </View>
);

const OTPVerificationScreen = ({route, navigation}) => {
  const dispatch = useDispatch();
  const {loading, error, verificationId: storedVerificationId} = useSelector(
    s => s.auth,
  );
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);
  const params = route?.params || {};

  // Shake animation on error
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shake.value}],
  }));

  const triggerShake = () => {
    shake.value = withSequence(
      withTiming(-8, {duration: 60}),
      withTiming(8, {duration: 60}),
      withTiming(-6, {duration: 50}),
      withTiming(6, {duration: 50}),
      withTiming(0, {duration: 40}),
    );
  };

  useEffect(() => {
    if (error && __DEV__) {
      console.log('Firebase verification error:', error);
    }
    if (error) {triggerShake();}
  }, [error]);

  const updateOtp = value => {
    if (error) {dispatch(clearAuthError());}
    setLocalError('');
    setOtp(value.replace(/\D/g, '').slice(0, 6));
  };

  const handleVerify = async () => {
    console.log('TRACE LOGIN FLOW: Verify OTP Button Pressed (Verify OTP) with OTP:', otp);
    const validationError = validateOtp(otp);
    console.log('TRACE LOGIN FLOW: Validation result (OTPVerificationScreen):', validationError || 'Success');
    if (validationError) {
      setLocalError(validationError);
      triggerShake();
      return;
    }
    console.log('TRACE LOGIN FLOW: Dispatching verifyOtp request');
    const action = await dispatch(
      verifyOtp({
        otp,
        countryCode: params.countryCode,
        phoneNumber: params.phoneNumber,
        verificationId: params.verificationId || storedVerificationId,
      }),
    );
    if (verifyOtp.fulfilled.match(action)) {
      console.log('TRACE LOGIN FLOW: verifyOtp fulfilled, session set up. User role:', action.payload?.user?.role);
    } else {
      console.log('TRACE LOGIN FLOW: verifyOtp rejected with payload/error:', action.payload || action.error);
    }
  };

  const displayError = localError || (error ? 'Incorrect code. Try again.' : '');
  const digits = otp.split('').concat(Array(6 - otp.length).fill(''));

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LoadingOverlay visible={loading} message="Verifying OTP..." />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Background decoration */}
        <View style={styles.bgBlob} />

        {/* Back button */}
        <Animated.View entering={FadeIn.duration(250)} style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color={colors.text}
            />
          </Pressable>
        </Animated.View>

        {/* Shield icon */}
        <Animated.View
          entering={FadeInDown.duration(350).springify()}
          style={styles.iconSection}>
          <View style={styles.iconRing}>
            <View style={styles.iconInner}>
              <MaterialCommunityIcons
                name="shield-check"
                size={36}
                color={colors.primary}
              />
            </View>
          </View>
          <Text style={styles.heading}>Verify Phone</Text>
          <Text style={styles.sub}>
            Code sent to{' '}
            <Text style={styles.phone}>{params.fullPhoneNumber || 'your phone'}</Text>
          </Text>
        </Animated.View>

        {/* OTP boxes card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(380).springify()}
          style={styles.card}>

          <Text style={styles.label}>Enter 6-digit code</Text>

          {/* Invisible full TextInput drives the OTP boxes */}
          <Pressable
            onPress={() => inputRef.current?.focus()}
            style={styles.otpContainer}>
            <Animated.View style={[styles.otpRow, shakeStyle]}>
              {digits.map((digit, i) => (
                <OtpBox
                  key={i}
                  value={digit}
                  focused={otp.length === i}
                />
              ))}
            </Animated.View>
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              value={otp}
              maxLength={6}
              onChangeText={updateOtp}
              autoFocus
              caretHidden
            />
          </Pressable>

          {displayError ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          {/* Verify button */}
          <Pressable
            onPress={handleVerify}
            disabled={loading || otp.length < 6}
            style={[
              styles.verifyBtn,
              (loading || otp.length < 6) && styles.verifyBtnDisabled,
            ]}>
            {loading ? (
              <MaterialCommunityIcons
                name="loading"
                size={20}
                color={colors.white}
              />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.verifyBtnText}>Verify & Continue</Text>
              </>
            )}
          </Pressable>

          {/* Resend note */}
          <View style={styles.resendRow}>
            <Text style={styles.resendNote}>Didn't receive it? </Text>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
              <Text style={styles.resendLink}>Change number</Text>
            </Pressable>
          </View>
        </Animated.View>



      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  bgBlob: {
    backgroundColor: colors.primarySoft,
    borderRadius: 140,
    height: 280,
    opacity: 0.45,
    position: 'absolute',
    right: -60,
    top: -40,
    width: 280,
  },
  topRow: {
    marginBottom: spacing.xl,
  },
  backBtn: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
    ...shadows.soft,
  },
  // Icon section
  iconSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconRing: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 8,
    height: 90,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 90,
  },
  iconInner: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  heading: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  phone: {
    color: colors.primary,
    fontWeight: '700',
  },
  // Card
  card: {
    ...shadows.medium,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  // OTP boxes
  otpContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  otpBox: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 2,
    height: 52,
    justifyContent: 'center',
    width: 44,
  },
  otpBoxFilled: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
  },
  otpBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  otpDigit: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cursor: {
    backgroundColor: colors.primary,
    borderRadius: 1,
    height: 22,
    width: 2,
  },
  hiddenInput: {
    height: 0,
    opacity: 0,
    position: 'absolute',
    width: 0,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Verify button
  verifyBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 52,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  verifyBtnDisabled: {
    opacity: 0.55,
  },
  verifyBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  // Resend
  resendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  resendNote: {
    ...typography.caption,
    color: colors.textMuted,
  },
  resendLink: {
    ...typography.captionBold,
    color: colors.primary,
  },

});

export default OTPVerificationScreen;
