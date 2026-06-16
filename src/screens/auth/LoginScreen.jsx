import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {HelperText, Text} from 'react-native-paper';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {CustomButton} from '../../components';
import {clearAuthError, sendOtp} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {validatePhoneLogin} from '../../utils/validators';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {loading, error} = useSelector(state => state.auth);
  const [form, setForm] = useState({countryCode: '+91', phoneNumber: ''});
  const [localError, setLocalError] = useState('');
  const [focused, setFocused] = useState(null);

  const btnScale = useSharedValue(1);

  useEffect(() => {
    if (error && __DEV__) {
      console.log('Firebase login error details:', error);
    }
  }, [error]);

  const updateField = (field, value) => {
    if (error) {dispatch(clearAuthError());}
    setLocalError('');
    setForm(c => ({...c, [field]: value}));
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

  const handleBtnPressIn = () => {
    btnScale.value = withSpring(0.97, {damping: 20, stiffness: 300});
  };
  const handleBtnPressOut = () => {
    btnScale.value = withSpring(1, {damping: 15, stiffness: 200});
  };

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{scale: btnScale.value}],
  }));

  const displayError = localError || (error ? 'Unable to connect. Please try again.' : '');

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Background decoration */}
        <View style={styles.bgBlob1} />
        <View style={styles.bgBlob2} />

        {/* Brand header */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          style={styles.brand}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="school" size={36} color={colors.primary} />
          </View>
          <Text style={styles.brandName}>NSRIT Connect</Text>
          <Text style={styles.brandTagline}>Enterprise School Management</Text>
        </Animated.View>

        {/* Login card */}
        <Animated.View
          entering={FadeInDown.delay(120).duration(400).springify()}
          style={styles.card}>

          {/* Card header accent */}
          <View style={styles.cardAccent} />

          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSub}>
            Enter your phone number to receive a verification code
          </Text>

          {/* Phone input */}
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={styles.phoneRow}>
            {/* Country code */}
            <View
              style={[
                styles.inputWrap,
                styles.codeWrap,
                focused === 'code' && styles.inputFocused,
              ]}>
              <TextInput
                keyboardType="phone-pad"
                value={form.countryCode}
                placeholder="+91"
                placeholderTextColor={colors.textSoft}
                style={styles.input}
                onChangeText={v => updateField('countryCode', v)}
                onFocus={() => setFocused('code')}
                onBlur={() => setFocused(null)}
              />
            </View>

            {/* Phone number */}
            <View
              style={[
                styles.inputWrap,
                styles.phoneWrap,
                focused === 'phone' && styles.inputFocused,
              ]}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={16}
                color={
                  focused === 'phone' ? colors.primary : colors.textSoft
                }
                style={styles.inputIcon}
              />
              <TextInput
                keyboardType="phone-pad"
                value={form.phoneNumber}
                placeholder="10-digit number"
                placeholderTextColor={colors.textSoft}
                style={styles.input}
                onChangeText={v => updateField('phoneNumber', v)}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                maxLength={15}
              />
            </View>
          </View>

          {displayError ? (
            <HelperText type="error" visible style={styles.errorText}>
              {displayError}
            </HelperText>
          ) : null}

          {/* OTP button */}
          <AnimatedPressable
            onPress={handleSendOtp}
            onPressIn={handleBtnPressIn}
            onPressOut={handleBtnPressOut}
            disabled={loading}
            style={[styles.submitBtn, btnStyle, loading && styles.submitBtnLoading]}>
            {loading ? (
              <MaterialCommunityIcons name="loading" size={20} color={colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="send"
                  size={16}
                  color={colors.white}
                />
                <Text style={styles.submitBtnText}>Send OTP</Text>
              </>
            )}
          </AnimatedPressable>

          {/* Dev bypass hint */}
          {__DEV__ ? (
            <View style={styles.devHint}>
              <MaterialCommunityIcons
                name="information-outline"
                size={12}
                color={colors.textSoft}
              />
              <Text style={styles.devText}>
                Dev: Use OTP <Text style={{color: colors.primary}}>123456</Text>
              </Text>
            </View>
          ) : null}
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(350)}
          style={styles.footer}>
          <Pressable
            onPress={() => navigation.navigate('PhoneLoginHelp')}
            hitSlop={8}>
            <Text style={styles.helpLink}>
              Having trouble?{' '}
              <Text style={styles.helpLinkBold}>Contact Admin</Text>
            </Text>
          </Pressable>
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
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    minHeight: 560,
  },
  // Background decorations
  bgBlob1: {
    backgroundColor: colors.primarySoft,
    borderRadius: 150,
    height: 300,
    opacity: 0.5,
    position: 'absolute',
    right: -80,
    top: -60,
    width: 300,
  },
  bgBlob2: {
    backgroundColor: colors.secondarySoft,
    borderRadius: 120,
    bottom: -40,
    height: 240,
    left: -60,
    opacity: 0.4,
    position: 'absolute',
    width: 240,
  },
  // Brand
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoWrap: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 80,
    ...shadows.medium,
  },
  brandName: {
    ...typography.title,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },
  // Card
  card: {
    ...shadows.medium,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  cardAccent: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 3,
    marginBottom: spacing.lg,
    width: 40,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardSub: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  // Inputs
  inputLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  codeWrap: {
    flex: 0.28,
    justifyContent: 'center',
  },
  phoneWrap: {
    flex: 0.72,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 0,
  },
  // Button
  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 52,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  submitBtnLoading: {
    opacity: 0.8,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  // Dev hint
  devHint: {
    alignItems: 'center',
    backgroundColor: colors.neutralSoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  devText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '600',
  },
  // Footer
  footer: {
    alignItems: 'center',
  },
  helpLink: {
    ...typography.caption,
    color: colors.textMuted,
  },
  helpLinkBold: {
    ...typography.captionBold,
    color: colors.primary,
  },
});

export default LoginScreen;
