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
    label: 'My Account',
    onPress: () => router.push('/my-account'),
  },
  {
    icon: 'heart-outline',
    label: 'Your Favorites',
    onPress: () => router.push('/favorites'),
  },
];

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <ThemedText style={styles.headerTitle}>Profile</ThemedText>

        {/* User Info Row */}
        <View style={styles.userRow}>
          <View style={styles.avatarWrapper}>
            {/* Replace with user.avatar if available */}
            <Image
              source={{ uri: 'https://i.pravatar.cc/80?img=3' }}
              style={styles.avatar}
              accessibilityLabel="User avatar"
            />
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>{user?.username || 'John Doe'}</ThemedText>
            <ThemedText style={styles.userContact}>{user?.email || '(+1) 234 567 890'}</ThemedText>
          </View>
          <TouchableOpacity onPress={handleLogout} accessibilityRole="button">
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Menu List */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={item.onPress}
              accessibilityRole="button"
            >
              <Ionicons name={item.icon as any} size={22} color="#23262F" style={styles.menuIcon} />
              <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
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
    backgroundColor: '#fff',
    paddingHorizontal: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    alignSelf: 'center',
    marginVertical: 18,
    color: '#23262F',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    color: '#23262F',
  },
  userContact: {
    fontSize: 14,
    color: '#A6A6A6',
    marginTop: 2,
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 12,
  },
  menuList: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  menuIcon: {
    marginRight: 18,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#23262F',
  },
}); 