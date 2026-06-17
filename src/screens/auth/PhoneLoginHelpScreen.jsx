import React from 'react';
import {StyleSheet} from 'react-native';
import {AppHeader, EmptyState, ScreenWrapper} from '../../components';
import {colors} from '../../theme';

const PhoneLoginHelpScreen = () => (
  <ScreenWrapper style={styles.root}>
    <AppHeader title="OTP Login Help" onBack={true} />
    <EmptyState
      icon="help-circle-outline"
      title="How to sign in?"
      message="All users sign in securely using their registered mobile phone number. If you need to register a new number, update an existing one, or are experiencing login issues, please contact the main administration office."
    />
  </ScreenWrapper>
);

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
});

export default PhoneLoginHelpScreen;
