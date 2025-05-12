import { ThemedText } from '@/components/ThemedText';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU_ITEMS = [
  {
    icon: 'person-outline',
    label: 'Moje konto',
    onPress: () => router.push('/my-account'),
  },
  {
    icon: 'heart-outline',
    label: 'Ulubione',
    onPress: () => router.push('/favorites'),
  },
];

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' ? false : true; // Force light mode by default

  function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            router.replace('/auth/login');
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea]} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <ThemedText style={[styles.headerTitle, { color: isDark ? '#fff' : '#23262F' }]}>Profil użytkownika</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={24} color={isDark ? '#fff' : '#23262F'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info Row */}
        <View style={[styles.userRow, { backgroundColor: isDark ? '#23262F' : '#fff' }]}>
          <View style={styles.avatarWrapper}>
            {/* Replace with user.avatar if available */}
            <Image
              source={{ uri: 'https://i.pravatar.cc/80?img=3' }}
              style={styles.avatar}
              accessibilityLabel="User avatar"
            />
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={[styles.userName, { color: isDark ? '#fff' : '#23262F' }]}>{user?.username || 'John Doe'}</ThemedText>
            <ThemedText style={[styles.userContact, { color: isDark ? '#A6A6A6' : '#666' }]}>{user?.email || '(+1) 234 567 890'}</ThemedText>
          </View>
          <TouchableOpacity onPress={handleLogout} accessibilityRole="button">
            <ThemedText style={styles.logoutText}>Wyloguj</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Menu List */}
        <View style={[styles.menuList]}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, { 
                backgroundColor: isDark ? '#23262F' : '#fff',
                borderBottomColor: isDark ? '#2A2D36' : '#F0F0F0'
              }]}
              onPress={item.onPress}
              accessibilityRole="button"
            >
              <Ionicons 
                name={item.icon as any} 
                size={22} 
                color={isDark ? '#fff' : '#23262F'} 
                style={styles.menuIcon} 
              />
              <ThemedText style={[styles.menuLabel, { color: isDark ? '#fff' : '#23262F' }]}>{item.label}</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#A6A6A6' : '#C7C7CC'} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    position: 'relative',
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerRight: {
    marginLeft: 'auto',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  avatarWrapper: {
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userContact: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 12,
  },
  menuList: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20
  },
  menuIcon: {
    marginRight: 18,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
  },
}); 