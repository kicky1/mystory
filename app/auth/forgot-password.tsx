import { ThemedText } from '@/components/ThemedText';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { clearError, resetPassword, sendVerificationCode, verifyCode } from '@/store/slices/authSlice';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
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
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    // Calculate password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const isLongEnough = newPassword.length >= 8;

    const strength = 
      isLongEnough && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar ? 'strong' :
      isLongEnough && ((hasUpperCase && hasLowerCase) || (hasNumbers && hasSpecialChar)) ? 'medium' :
      'weak';

    setPasswordStrength(strength);
  }, [newPassword]);

  const getPasswordStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'strong': return '#4CAF50';
      case 'medium': return '#FFC107';
      case 'weak': return '#F44336';
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      const result = await dispatch(sendVerificationCode(email)).unwrap();
      if (result.success) {
        setStep('code');
        setResendTimer(60); // Start 60-second timer
      }
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    try {
      const result = await dispatch(sendVerificationCode(email)).unwrap();
      if (result.success) {
        setResendTimer(60);
        Alert.alert('Success', 'Verification code has been resent');
      }
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      const result = await dispatch(verifyCode({ email, code: verificationCode })).unwrap();
      if (result.success) {
        setStep('password');
      }
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (passwordStrength === 'weak') {
      Alert.alert('Error', 'Please choose a stronger password');
      return;
    }

    try {
      const result = await dispatch(resetPassword({ email, newPassword })).unwrap();
      if (result.success) {
        Alert.alert('Success', 'Password has been reset successfully', [
          { text: 'OK', onPress: () => router.push('/auth/login') }
        ]);
      }
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative Top Shape */}
      <View style={[styles.topShape, { backgroundColor: isDark ? '#23262F' : '#fbe9e7', width }]} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.content}>
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
              <ThemedText style={styles.heading}>Zresetuj hasło</ThemedText>
              <ThemedText style={styles.subheading}>
                {step === 'email' && 'Wpisz swój email, aby otrzymać kod weryfikacyjny'}
                {step === 'code' && 'Wpisz kod weryfikacyjny wysłany na email'}
                {step === 'password' && 'Utwórz nowe hasło'}
              </ThemedText>

              <View style={styles.inputGroup}>
                {step === 'email' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Adres email"
                    placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                )}

                {step === 'code' && (
                  <View style={styles.codeInputContainer}>
                    <TextInput
                      style={styles.codeInput}
                      placeholder="Wpisz 6-cyfrowy kod"
                      placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                      value={verificationCode}
                      onChangeText={text => {
                        if (text.length <= 6) {
                          setVerificationCode(text.replace(/[^0-9]/g, ''));
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={[styles.resendButton, resendTimer > 0 && styles.resendButtonDisabled]}
                      onPress={handleResendCode}
                      disabled={resendTimer > 0 || loading}
                    >
                      <ThemedText style={styles.resendButtonText}>
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )}

                {step === 'password' && (
                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Nowe hasło"
                      placeholderTextColor={isDark ? '#A6A6A6' : '#A6A6A6'}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      editable={!loading}
                    />
                    <View style={styles.passwordStrengthContainer}>
                      <View style={[styles.passwordStrengthBar, { backgroundColor: getPasswordStrengthColor(passwordStrength) }]} />
                      <ThemedText style={[styles.passwordStrengthText, { color: getPasswordStrengthColor(passwordStrength) }]}>
                        {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)} hasło
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: isDark ? '#e74c3c' : '#e74c3c' },
                  loading && styles.primaryBtnDisabled
                ]}
                onPress={
                  step === 'email' ? handleSendCode :
                  step === 'code' ? handleVerifyCode :
                  handleResetPassword
                }
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryBtnText}>
                    {step === 'email' ? 'Wyślij kod' :
                     step === 'code' ? 'Weryfikuj kod' :
                     'Zresetuj hasło'}
                  </ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  if (step === 'code') setStep('email');
                  else if (step === 'password') setStep('code');
                  else router.push('/auth/login');
                }}
                disabled={loading}
              >
                <ThemedText style={styles.backButtonText}>Wróć</ThemedText>
              </TouchableOpacity>
            </Animated.View>
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
    minHeight: 250,
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
  codeInputContainer: {
    width: '100%',
    gap: 10,
  },
  codeInput: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  resendButton: {
    alignSelf: 'center',
    padding: 10,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
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
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
}); 