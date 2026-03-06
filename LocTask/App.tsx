import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { AppNavigator } from './src/navigation/AppNavigator';
import { openDatabase } from './src/database';
import { store } from './src/store';

export default function App() {
  useEffect(() => {
    void openDatabase();
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
      <StatusBar style="auto" />
    </Provider>
  );
}
