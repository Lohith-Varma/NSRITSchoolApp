import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../theme';

const ScreenWrapper = ({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
  statusBarColor = colors.background,
  statusBarDark = true,
}) => {
  return (
    <SafeAreaView edges={edges} style={[styles.container, style]}>
      <StatusBar
        barStyle={statusBarDark ? 'dark-content' : 'light-content'}
        backgroundColor={statusBarColor}
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default ScreenWrapper;
