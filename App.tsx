import React, {useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {useAuthStore} from './src/store/authStore';
import {useOfflineStore} from './src/store/offlineStore';
import {COLORS} from './src/utils/constants';

LogBox.ignoreLogs(['Reanimated']);

export default function App() {
  const loadSession = useAuthStore(s => s.loadSession);
  const checkConnection = useOfflineStore(s => s.checkConnection);

  useEffect(() => {
    loadSession();
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <AppNavigator />
    </>
  );
}
