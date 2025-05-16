import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function MyStoriesScreen() {
  const { stories } = useAppSelector((state: RootState) => state.stories);
  const { user } = useAppSelector((state: RootState) => state.auth);

  const myStories = stories.filter(story => story.author === user?.username);

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
        <ThemedText type="title" style={styles.storyTitle}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.storyPreview} numberOfLines={2}>
          {item.content}
        </ThemedText>
        <View style={styles.storyFooter}>
          <View style={styles.storyMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <ThemedText style={styles.metaText}>{item.duration} min</ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <ThemedText style={styles.metaText}>{item.rating}</ThemedText>
            </View>
          </View>
          <View style={styles.tags}>
            {item.tags.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <ThemedText style={styles.tagText}>{tag}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#e74c3c" />
        </TouchableOpacity>
        <ThemedText type="title">My Stories</ThemedText>
        <TouchableOpacity onPress={() => router.push('/create-story')}>
          <Ionicons name="add" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={myStories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storyList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#666" />
            <ThemedText style={styles.emptyStateText}>
              You haven't created any stories yet
            </ThemedText>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create-story')}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <ThemedText style={styles.createButtonText}>Create Story</ThemedText>
            </TouchableOpacity>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 30,
  },
  storyList: {
    gap: 15,
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storyImage: {
    width: 100,
    height: 100,
  },
  storyContent: {
    flex: 1,
    padding: 15,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  storyPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  storyFooter: {
    gap: 10,
  },
  storyMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 15,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 