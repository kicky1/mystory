import { ThemedText } from '@/components/ThemedText';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { clearError, login, register } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, KeyboardAvoidingView, LayoutAnimation, Platform, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SocialProvider {
  provider: 'google' | 'apple';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const SOCIALS: SocialProvider[] = [
  { provider: 'google', icon: 'logo-google', label: 'Logowanie przez Google' },
  { provider: 'apple', icon: 'logo-apple', label: 'Logowanie przez Apple' },
];

type AuthMode = 'login' | 'register';
type PasswordStrength = 'weak' | 'medium' | 'strong';

export default function AuthScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: RootState) => state.auth);
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' ? false : true; // Force light mode by default

  // Animation values
  const cardHeight = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set initial card height
    Animated.timing(cardHeight, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, []);

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

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      if (result) {
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      // Error is handled by the useEffect above
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
    <SafeAreaView style={styles.safeArea} >
      {/* Decorative Top Shape */}
      <View style={[styles.topShape, { backgroundColor: isDark ? '#23262F' : '#fbe9e7', width }]} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View 
            style={[
              styles.content,
            ]}
          >
            {/* Logo */}
            <Image 
              source={require('@/assets/images/party_1.png')}
              style={styles.logo}
              accessibilityLabel="App Logo"
              resizeMode="contain"
            />
            {/* Card */}
            <Animated.View 
              style={[
                styles.card, 
                { 
                  transform: [{ scale: cardHeight }],
                  opacity: cardHeight
                }
              ]}
            > 
              <ThemedText style={styles.heading}>
                {mode === 'login' ? 'Cześć!' : 'Utwórz konto'}
              </ThemedText>
              <ThemedText style={styles.subheading}>
                {mode === 'login' ? 'Zaloguj się do swojego konta' : 'Dołącz do MyStory dzisiaj!'}
              </ThemedText>

              <View style={styles.inputGroup}>
                {mode === 'register' && (
                  <TextInput
                    style={[styles.input]}
                    placeholder="Nazwa użytkownika"
                    placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    editable={!loading}
                    accessibilityLabel="Username"
                  />
                )}

                <TextInput
                  style={[styles.input]}
                  placeholder="Adres e-mail"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  accessibilityLabel="Email"
                />

                <TextInput
                  style={[styles.input]}
                  placeholder="Hasło"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                  accessibilityLabel="Password"
                />

                {mode === 'register' && (
                  <TextInput
                    style={[styles.input]}
                    placeholder="Powtórz hasło"
                    placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!loading}
                    accessibilityLabel="Confirm Password"
                  />
                )}
              </View>

              {mode === 'login' ? (
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push('/auth/forgot-password')}
                  disabled={loading}
                  accessibilityRole="button"
                >
                  <ThemedText style={styles.forgotPasswordText}>Zapomniałeś hasła?</ThemedText>
                </TouchableOpacity>
              ) : (
                <>
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
                      Potwierdzam, że mam co najmniej 13 lat
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
                      Akceptuję{' '}
                      <ThemedText style={styles.link}>Warunki użytkowania</ThemedText> i{' '}
                      <ThemedText style={styles.link}>Politykę prywatności</ThemedText>
                    </ThemedText>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  mode === 'login' ? styles.primaryBtnLogin : styles.primaryBtnRegister,
                  { backgroundColor: isDark ? '#e74c3c' : '#e74c3c' },
                  ((mode === 'login' && (!email || !password)) || 
                   (mode === 'register' && (!username || !email || !password || !confirmPassword || !acceptTerms || !ageVerified || loading))) && 
                  styles.primaryBtnDisabled
                ]}
                onPress={mode === 'login' ? handleLogin : handleRegister}
                disabled={
                  (mode === 'login' && (!email || !password)) || 
                  (mode === 'register' && (!username || !email || !password || !confirmPassword || !acceptTerms || !ageVerified || loading)) || 
                  loading
                }
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryBtnText}>
                    {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
                  </ThemedText>
                )}
              </TouchableOpacity>

              {mode === 'login' && (
                <>
                  <View style={styles.dividerRow} accessible accessibilityRole="text">
                    <View style={styles.dividerLine} />
                    <ThemedText style={styles.dividerText}>lub</ThemedText>
                    <View style={styles.dividerLine} />
                  </View>

                  {SOCIALS.map(({ provider, icon, label }) => (
                    <TouchableOpacity
                      key={provider}
                      style={[styles.socialBtn]}
                      onPress={() => handleSocialLogin(provider)}
                      disabled={socialLoading !== null}
                      accessibilityRole="button"
                    >
                      <Ionicons name={icon} size={22} color={isDark ? '#fff' : '#e74c3c'} style={styles.socialIcon} />
                      <ThemedText style={styles.socialBtnText}>
                        {socialLoading === provider ? 'Łączenie...' : label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </Animated.View>

            <View style={styles.footerRow}>
              <ThemedText style={styles.footerText}>
                {mode === 'login' ? 'Nie masz jeszcze konta?' : 'Masz już konto?'}
              </ThemedText>
              <TouchableOpacity
                onPress={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
                disabled={loading}
                accessibilityRole="button"
              >
                <ThemedText style={styles.footerLink}>
                  {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: { flex: 1 },
  topShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '20%',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    zIndex: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
    paddingVertical: 0,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  logo: {
    width: 400,
    height: 200,
    marginTop: 0,
    marginBottom: 10,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#fbe9e7', 
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    minHeight: 450,
  },
  heading: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
    color: '#23262F',
    textAlign: 'center',
    paddingTop: 4,
  },
  subheading: {
    fontSize: 15,
    fontWeight: '500',
    color: '#777E90',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputGroup: {
    width: '100%',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 0,
    backgroundColor: '#fff',
    borderColor: '#fff',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 0,
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
    color: '#777E90',
    fontSize: 14,
    lineHeight: 18,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnLogin: {
    marginTop: 0,
    marginBottom: 20,
  },
  primaryBtnRegister: {
    marginTop: 20,
    marginBottom: 0,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#A6A6A6',
    opacity: 0.5,
  },
  dividerText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#A6A6A6',
    marginHorizontal: 8,
  },
  socialBtn: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 0,
    gap: 8,
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  socialIcon: {
    marginRight: 8,
  },
  socialBtnText: {
    color: '#A6A6A6',
    fontWeight: '600',
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
  link: {
    color: '#e74c3c',
    fontWeight: '600',
  },
}); 