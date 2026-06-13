import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {MMKV} from 'react-native-mmkv';
import AppNavigator from './src/navigation/AppNavigator';
import store from './src/store';
import {colors, paperTheme} from './src/theme';

const queryClient = new QueryClient();

const App = () => {
  console.log('APP_START');
  React.useEffect(() => {
    try {
      const storage = new MMKV({
        id: 'nsrit-connect-storage',
      });
      console.log('MMKV_TEST_START');
      const prev = storage.getString('test');
      console.log('MMKV_TEST_PREV_VAL:', prev);
      storage.set('test', '123');
      const curr = storage.getString('test');
      console.log('MMKV_TEST_CURR_VAL:', curr);
      console.log('MMKV_TEST_END');
    } catch (e) {
      console.error('MMKV_TEST_ERROR:', e);
    }
  }, []);

  console.log('APP_AFTER_MMKV');

  console.log('APP_RENDER');
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={paperTheme}>
            <SafeAreaProvider>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={colors.background}
              />
              <AppNavigator />
              <Toast />
            </SafeAreaProvider>
          </PaperProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
