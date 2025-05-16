import { useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { user, token, loading } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !token && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && token && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [user, token, segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return <>{children}</>;
}
