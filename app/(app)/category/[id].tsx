import { CATEGORIES } from '@/app/(tabs)/home';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { fetchStories } from '@/store/slices/storySlice';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { stories, loading } = useAppSelector((state: RootState) => state.stories);
  const category = CATEGORIES.find(s => s.id === id);
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    dispatch(fetchStories());
  }, [dispatch]);

  const filteredStories = stories?.filter(story => {
    const matchesCategory = story.category === id;
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
        </View>
      </ThemedView>
    );
  }

  const renderStoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => router.push({
        pathname: '/story/[id]',
        params: { id: item.id }
      })}
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
    <ThemedView style={[styles.container, { backgroundColor: '#fff' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <ImageBackground
          source={category?.image}
          resizeMode="cover"
          style={styles.coverImage}
        >
          <BlurView
            intensity={20}
            tint="light"
            style={styles.categoryOverlay}
          />
          <View style={[styles.heroOverlay, { paddingTop: insets.top }]}>
            <TouchableOpacity 
              style={styles.backButtonTransparent} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoryContent}>
            <ThemedText style={[styles.categoryTitle, { 
              color: '#fff', 
              textShadowColor: 'rgba(0, 0, 0, 0.75)', 
              textShadowOffset: { width: 1, height: 1 }, 
              textShadowRadius: 3 
            }]}>
              {category?.name}
            </ThemedText>
          </View>
        </ImageBackground>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#A6A6A6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj historii..."
          placeholderTextColor="#A6A6A6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stories List */}
      <FlatList
        data={filteredStories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storyList}
        refreshing={loading}
        onRefresh={() => dispatch(fetchStories())}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroSection: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 1,
  },
  backButtonTransparent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#23262F',
  },
  storyList: {
    padding: 16,
    gap: 16,
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
});