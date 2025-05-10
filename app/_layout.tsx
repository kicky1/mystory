import { ProtectedRoute } from '@/components/ProtectedRoute';
import { store } from '@/store';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  // Add state to manage when it's safe to render protected content
  const [isReady, setIsReady] = useState(false);

  // Use effect to ensure layout is mounted before attempting authentication logic
  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <StatusBar style="auto" />
        <View style={styles.container}>
          {isReady ? (
            <ProtectedRoute>
              <Slot />
            </ProtectedRoute>
          ) : (
            // Render an empty Slot during initial mount to ensure layout is available
            <Slot />
          )}
        </View>
      </ThemeProvider>
    </Provider>
  );
}

// Define styles outside the component using StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});