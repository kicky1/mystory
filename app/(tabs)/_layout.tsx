import { useTheme } from '@/context/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function TabLayout() {
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  if (!theme || !backgroundColor || !tintColor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: '#A6A6A6',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 2,
          borderTopColor: '#e74c3c',
          height: 70,
          paddingBottom: 16,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Polecane',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-story"
        options={{
          title: 'Dodaj',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
