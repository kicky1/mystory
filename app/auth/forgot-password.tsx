import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { clearError, resetPassword, sendVerificationCode, verifyCode } from '@/store/slices/authSlice';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

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
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Reset Password</ThemedText>
        <ThemedText style={styles.subtitle}>
          {step === 'email' && 'Enter your email to receive a verification code'}
          {step === 'code' && 'Enter the verification code sent to your email'}
          {step === 'password' && 'Create a new password'}
        </ThemedText>
      </View>

      <View style={styles.form}>
        {step === 'email' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Send Code</ThemedText>
              )}
            </TouchableOpacity>
          </>
        )}

        {step === 'code' && (
          <>
            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="Enter 6-digit code"
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
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Verify Code</ThemedText>
              )}
            </TouchableOpacity>
          </>
        )}

        {step === 'password' && (
          <>
            <View>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!loading}
              />
              <View style={styles.passwordStrengthContainer}>
                <View style={[styles.passwordStrengthBar, { backgroundColor: getPasswordStrengthColor(passwordStrength) }]} />
                <ThemedText style={[styles.passwordStrengthText, { color: getPasswordStrengthColor(passwordStrength) }]}>
                  {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)} Password
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Reset Password</ThemedText>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (step === 'code') setStep('email');
            else if (step === 'password') setStep('code');
            else router.push('/auth/login');
          }}
          disabled={loading}
        >
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  codeInputContainer: {
    gap: 10,
  },
  codeInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: '#fff',
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
  button: {
    backgroundColor: '#e74c3c',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#e74c3c',
    fontSize: 16,
  },
}); 