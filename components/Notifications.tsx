import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import {
  clearAllNotifications,
  deleteNotification,
  markAllAsRead,
  markAsRead,
  Notification
} from '@/store/slices/notificationSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, FlatList, Modal, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface NotificationsProps {
  visible: boolean;
  onClose: () => void;
}

export function Notifications({ visible, onClose }: NotificationsProps) {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state: RootState) => state.notifications);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' ? false : true;

  // Animation values
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  

  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }

    // Handle navigation based on notification type and data
    if (notification.data?.storyId) {
      router.push({
        pathname: '/story/[id]',
        params: { id: notification.data.storyId }
      });
      onClose();
    } else if (notification.data?.category) {
      router.push(`/category/${notification.data.category}`);
      onClose();
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => dispatch(clearAllNotifications())
        }
      ]
    );
  };


  const renderRightActions = (id: string, dragX: Animated.AnimatedInterpolation<number>) => {
    const opacity = dragX.interpolate({
      inputRange: [-132, -120, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    const borderRadius = dragX.interpolate({
      inputRange: [-120, 0],
      outputRange: [0, 12],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            opacity,
          },
        ]}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </Animated.View>
    );
  };

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => {
    return (
      <Animated.View
        style={[
          styles.notificationItemContainer,
          {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
        ]}
      >
        <Swipeable
          ref={(ref) => {
            swipeableRefs.current[item.id] = ref;
          }}
          renderRightActions={(progress, dragX) => renderRightActions(item.id, dragX)}
          rightThreshold={40}
          friction={2}
          overshootRight={false}
          enableTrackpadTwoFingerGesture
          onSwipeableOpen={() => {
            Alert.alert(
              'Usuń powiadomienie',
              'Czy na pewno chcesz usunąć to powiadomienie?',
              [
                { text: 'Anuluj', style: 'cancel', onPress: () => swipeableRefs.current[item.id]?.close() },
                { 
                  text: 'Usuń', 
                  style: 'destructive',
                  onPress: () => dispatch(deleteNotification(item.id))
                }
              ]
            );
          }}
        >
          <Animated.View
            style={[
              styles.notificationItem,
              { 
                backgroundColor: isDark ? '#23262F' : '#fff',
                borderRightWidth: 1,
              },
              !item.read && styles.unreadNotification
            ]}
          >
            <TouchableOpacity
              style={styles.notificationContent}
              onPress={() => handleNotificationPress(item)}
            > 
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <ThemedText style={[styles.notificationTitle, { color: isDark ? '#fff' : '#23262F' }]}>
                    {item.title}
                  </ThemedText>
                  {!item.read && (
                    <Animated.View
                      style={[
                        styles.unreadIndicator,
                        {
                          transform: [{ scale: pulseAnim }],
                        },
                      ]}
                    />
                  )}
                </View>
                <ThemedText style={[styles.notificationMessage, { color: isDark ? '#A6A6A6' : '#666' }]}>
                  {item.message}
                </ThemedText>
                <ThemedText style={[styles.notificationTime, { color: isDark ? '#A6A6A6' : '#999' }]}>
                  {item.time}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Swipeable>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.modalContent, { backgroundColor: isDark ? '#1A1A1A' : '#fff' }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ThemedText style={[styles.headerTitle, { color: isDark ? '#fff' : '#23262F' }]}>
                Powiadomienia
              </ThemedText>
              {unreadCount > 0 && (
                <Animated.View
                  style={[
                    styles.unreadBadge,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <ThemedText style={styles.unreadBadgeText}>{unreadCount}</ThemedText>
                </Animated.View>
              )}
            </View>
            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerButton}>
                  <Ionicons name="checkmark-done-outline" size={24} color={isDark ? '#fff' : '#23262F'} />
                </TouchableOpacity>
              )}
              {notifications.length > 0 && (
                <TouchableOpacity onPress={handleClearAll} style={styles.headerButton}>
                  <Ionicons name="trash-outline" size={24} color={isDark ? '#fff' : '#23262F'} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#23262F'} />
              </TouchableOpacity>
            </View>
          </View>
          
          {notifications.length > 0 ? (
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.notificationsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={isDark ? '#A6A6A6' : '#666'} />
              <ThemedText style={[styles.emptyStateText, { color: isDark ? '#A6A6A6' : '#666' }]}>
                Nie masz jeszcze żadnych powiadomień
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  headerButton: {
    padding: 5,
    marginLeft: 10,
  },
  unreadBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 200,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsList: {
    padding: 20,
  },
  notificationItemContainer: {
    marginBottom: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginRight: 0,
    borderRightWidth: 0,
  },
  notificationIcon: {
    marginRight: 12,
    alignSelf: 'center',
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
  },
  notificationTime: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 8,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
  },
  deleteAction: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
}); 