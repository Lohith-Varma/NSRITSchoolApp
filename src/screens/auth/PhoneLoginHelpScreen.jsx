import React from 'react';
import {StyleSheet, View} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const PhoneLoginHelpScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="OTP login help"
      message="Users sign in with phone OTP. Contact the school office if the registered phone number must be changed."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default PhoneLoginHelpScreen;
