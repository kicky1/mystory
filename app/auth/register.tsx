import { ThemedText } from '@/components/ThemedText';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { clearError, register } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PasswordStrength = 'weak' | 'medium' | 'strong';
type AuthRoute = '/auth/login' | '/auth/register' | '/auth/forgot-password';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: RootState) => state.auth);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' ? false : true; // Force light mode by default

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Calculate password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strength = 
      isLongEnough && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar ? 'strong' :
      isLongEnough && ((hasUpperCase && hasLowerCase) || (hasNumbers && hasSpecialChar)) ? 'medium' :
      'weak';

    setPasswordStrength(strength);
  }, [password]);

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

  const getPasswordStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'strong': return '#4CAF50';
      case 'medium': return '#FFC107';
      case 'weak': return '#F44336';
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!acceptTerms || !ageVerified) {
      Alert.alert('Error', 'Please accept the terms and verify your age');
      return;
    }

    if (passwordStrength === 'weak') {
      Alert.alert('Error', 'Please choose a stronger password');
      return;
    }

    try {
      const result = await dispatch(register({ username, email, password })).unwrap();
      if (result) {
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

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
              <ThemedText style={styles.heading}>Create Account</ThemedText>
              <ThemedText style={styles.subheading}>Join StoryWhisper today</ThemedText>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#23262F' : '#F6F7FB', color: isDark ? '#fff' : '#121212', borderColor: isDark ? '#353945' : '#E8E8E8' }]}
                  placeholder="Username"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                  accessibilityLabel="Username"
                />

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

                <View>
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

                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#23262F' : '#F6F7FB', color: isDark ? '#fff' : '#121212', borderColor: isDark ? '#353945' : '#E8E8E8' }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                  accessibilityLabel="Confirm Password"
                />
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, ageVerified && styles.checkboxChecked]}
                  onPress={() => setAgeVerified(!ageVerified)}
                  disabled={loading}
                  accessibilityRole="checkbox"
                >
                  {ageVerified && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
                <ThemedText style={styles.checkboxText}>
                  I confirm I am at least 13 years old
                </ThemedText>
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                  disabled={loading}
                  accessibilityRole="checkbox"
                >
                  {acceptTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
                <ThemedText style={styles.checkboxText}>
                  I accept the{' '}
                  <ThemedText style={styles.link}>Terms of Service</ThemedText> and{' '}
                  <ThemedText style={styles.link}>Privacy Policy</ThemedText>
                </ThemedText>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: isDark ? '#e74c3c' : '#e74c3c' },
                  (!acceptTerms || !ageVerified || loading) && styles.primaryBtnDisabled
                ]}
                onPress={handleRegister}
                disabled={!acceptTerms || !ageVerified || loading}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryBtnText}>Create Account</ThemedText>
                )}
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <ThemedText style={styles.footerText}>Already have an account?</ThemedText>
                <TouchableOpacity
                  onPress={() => handleNavigation('/auth/login')}
                  disabled={loading}
                  accessibilityRole="button"
                >
                  <ThemedText style={styles.footerLink}>Sign In</ThemedText>
                </TouchableOpacity>
              </View>
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
  passwordStrengthContainer: {
    marginTop: 5,
    gap: 5,
  },
  passwordStrengthBar: {
    height: 4,
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: 12,
    width: '100%',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#e74c3c',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#777E90',
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 18,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1.1,
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
  link: {
    color: '#e74c3c',
  },
}); 