import { Notifications } from '@/components/Notifications';
import { ThemedText } from '@/components/ThemedText';
import { useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyAccountScreen() {
  const [name, setName] = useState('John');
  const [email, setEmail] = useState('Johndoe@email.com');
  const [phone, setPhone] = useState('(+1) 234 567 890');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const { unreadCount } = useAppSelector((state: RootState) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  // Animation value for the notification badge
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (unreadCount > 0) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [unreadCount]);

  function handleSave() {
    // Save logic here
  }

  async function handleChangePicture() {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#23262F" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>My Account</ThemedText>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={24} color={'#e74c3c'} />
            {unreadCount > 0 && (
                  <Animated.View
                    style={[
                      styles.notificationBadge,
                      {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  />
                )}
          </TouchableOpacity>
        </View>

        {/* Avatar and Change Picture */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleChangePicture}>
            <Image
              source={{ uri: profileImage }}
              style={styles.avatar}
              accessibilityLabel="Profile picture"
            />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <ThemedText style={styles.label}>Name</ThemedText>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#A6A6A6"
            autoCapitalize="words"
          />

          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#A6A6A6"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <ThemedText style={styles.label}>Phone Number</ThemedText>
            <TextInput
              style={[styles.input]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number"
              placeholderTextColor="#A6A6A6"
              keyboardType="phone-pad"
            />


          <ThemedText style={styles.label}>Password</ThemedText>
          <View style={styles.inputIconRow}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#A6A6A6"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(v => !v)}
              style={styles.inputIcon}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A6A6A6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} accessibilityRole="button">
          <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
        </TouchableOpacity>
      </View>
      <Notifications 
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#23262F',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0F0F0',
  },
  form: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#23262F',
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#23262F',
    marginBottom: 8,
  },
  inputIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  inputIcon: {
    marginRight: 6,
  },
  saveButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 24,
    marginHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  headerButton: {
    marginLeft: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    width: 12,
    height: 12,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 