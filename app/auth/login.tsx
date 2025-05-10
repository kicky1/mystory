import { ThemedText } from '@/components/ThemedText';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { clearError, login } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SocialProvider {
  provider: 'google' | 'apple';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const SOCIALS: SocialProvider[] = [
  { provider: 'google', icon: 'logo-google', label: 'Login with Google' },
  { provider: 'apple', icon: 'logo-apple', label: 'Login with Apple' },
];

type AuthRoute = '/auth/login' | '/auth/register' | '/auth/forgot-password';

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' ? false : true; // Force light mode by default

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animation when component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNavigation = (route: AuthRoute) => {
    // Animate out before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      router.push(route);
    });
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    dispatch(login({ email, password }))
      .unwrap()
      .then((result) => {
        if (result) router.replace('/(tabs)/home');
      })
      .catch(() => {});
  }

  async function handleSocialLogin(provider: 'google' | 'apple') {
    setSocialLoading(provider);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Coming Soon', 'Social login will be available soon!');
    } catch {
      Alert.alert('Error', 'Failed to login with ' + provider);
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#181A20' : '#F6F7FB' }]}>
      {/* Decorative Top Shape */}
      <View style={[styles.topShape, { backgroundColor: isDark ? '#23262F' : '#D1E3FF', width }]} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            {/* Logo Placeholder */}
            <View style={styles.logoCircle} accessibilityLabel="App Logo" />
            {/* Card */}
            <View style={[styles.card, { backgroundColor: isDark ? '#23262F' : '#fff', shadowColor: isDark ? '#000' : '#B0C4DE' }]}> 
              <ThemedText style={styles.heading}>Welcome Back</ThemedText>
              <ThemedText style={styles.subheading}>Sign in to your account</ThemedText>
              {/* Inputs */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#23262F' : '#F6F7FB', color: isDark ? '#fff' : '#121212', borderColor: isDark ? '#353945' : '#E8E8E8' }]}
                  placeholder="Email"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  accessibilityLabel="Email"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#23262F' : '#F6F7FB', color: isDark ? '#fff' : '#121212', borderColor: isDark ? '#353945' : '#E8E8E8' }]}
                  placeholder="Password"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                  accessibilityLabel="Password"
                />
              </View>
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => handleNavigation('/auth/forgot-password')}
                disabled={loading}
                accessibilityRole="button"
              >
                <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
              </TouchableOpacity>
              {/* Primary Button */}
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: isDark ? '#e74c3c' : '#e74c3c' }]}
                onPress={handleLogin}
                disabled={loading}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryBtnText}>Login</ThemedText>
                )}
              </TouchableOpacity>
              {/* Divider */}
              <View style={styles.dividerRow} accessible accessibilityRole="text">
                <View style={styles.dividerLine} />
                <ThemedText style={styles.dividerText}>Or with</ThemedText>
                <View style={styles.dividerLine} />
              </View>
              {/* Social Buttons */}
              {SOCIALS.map(({ provider, icon, label }) => (
                <TouchableOpacity
                  key={provider}
                  style={[styles.socialBtn, { backgroundColor: isDark ? '#181A20' : '#fff', borderColor: isDark ? '#353945' : '#E8E8E8' }]}
                  onPress={() => handleSocialLogin(provider)}
                  disabled={socialLoading !== null}
                  accessibilityRole="button"
                >
                  <Ionicons name={icon} size={22} color={isDark ? '#fff' : '#23262F'} style={styles.socialIcon} />
                  <ThemedText style={styles.socialBtnText}>
                    {socialLoading === provider ? 'Connecting...' : label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            {/* Footer */}
            <View style={styles.footerRow}>
              <ThemedText style={styles.footerText}>Don&apos;t have an account?</ThemedText>
              <TouchableOpacity
                onPress={() => handleNavigation('/auth/register')}
                disabled={loading}
                accessibilityRole="button"
              >
                <ThemedText style={styles.footerLink}>Sign Up</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  flex: { flex: 1 },
  topShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 180,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    zIndex: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e74c3c',
    marginBottom: 24,
    alignSelf: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#B0C4DE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    color: '#23262F',
    textAlign: 'center',
    paddingTop: 4,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
    color: '#777E90',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    gap: 12,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 0,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 2,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1.1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#A6A6A6',
    marginHorizontal: 8,
  },
  socialBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 0,
    gap: 8,
  },
  socialIcon: {
    marginRight: 8,
  },
  socialBtnText: {
    color: '#A6A6A6',
    fontWeight: '500',
    fontSize: 15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  footerText: {
    color: '#A6A6A6',
    fontWeight: '500',
    fontSize: 15,
  },
  footerLink: {
    color: '#e74c3c',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 2,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen; 