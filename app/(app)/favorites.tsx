import { Notifications } from '@/components/Notifications';
import { ThemedText } from '@/components/ThemedText';
import { useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const { stories } = useAppSelector((state: RootState) => state.stories);
  const { user } = useAppSelector((state: RootState) => state.auth);
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

  // In a real app, this would come from the user's favorites in the backend
  const favoriteStories = stories.filter(story => story.featured);

  console.log(stories);

  const renderStoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => router.push(`/story/${item.id}`)}
    >
      <Image
        source={{ uri: item.coverImage || 'https://via.placeholder.com/150x100' }}
        style={styles.storyImage}
      />
      <View style={styles.storyContent}>
        <View>
          <ThemedText style={styles.storyTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.storyPreview} numberOfLines={2}>
            {item.content}
          </ThemedText>
        </View>
        <View style={styles.storyMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#A6A6A6" />
            <ThemedText style={styles.metaText}>{item.duration} min</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <ThemedText style={styles.metaText}>{item.rating}</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={14} color="#A6A6A6" />
            <ThemedText style={styles.metaText} numberOfLines={1}>{item.author}</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#23262F" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Favorites</ThemedText>
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

        <FlatList
          data={favoriteStories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.storyList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={48} color="#A6A6A6" />
              <ThemedText style={styles.emptyStateText}>
                You haven&apos;t added any stories to favorites yet
              </ThemedText>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/home')}
              >
                <Ionicons name="compass-outline" size={24} color="#fff" />
                <ThemedText style={styles.exploreButtonText}>Explore Stories</ThemedText>
              </TouchableOpacity>
            </View>
          }
        />
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
    paddingHorizontal: 20,
    marginVertical: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#23262F',
  },
  storyList: {
    paddingHorizontal: 20,
    gap: 15,
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    height: 120,
  },
  storyImage: {
    width: 120,
    height: '100%',
  },
  storyContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#23262F',
    marginBottom: 4,
  },
  storyPreview: {
    fontSize: 13,
    color: '#A6A6A6',
    lineHeight: 18,
  },
  storyMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#A6A6A6',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 15,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A6A6A6',
    textAlign: 'center',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 5,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    position: 'relative',
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