import { store } from '@/store';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <View style={styles.container}>
            {/* Always render Slot first */}
            <Slot />
          </View>
        </GestureHandlerRootView>
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
