import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { fetchStories } from '@/store/slices/storySlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'All Stories' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'science-fiction', name: 'Sci-Fi' },
  { id: 'fairy-tale', name: 'Fairy Tales' },
  { id: 'educational', name: 'Educational' },
];

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { stories, loading, error } = useAppSelector((state: RootState) => state.stories);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' ? false : true; // Force light mode by default
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchStories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const featuredStories = stories?.filter(story => story.featured) || [];
  const filteredStories = stories?.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#e74c3c" />
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#181A20' : '#F6F7FB' }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name="search" size={24} color={isDark ? '#fff' : '#23262F'} />
          </TouchableOpacity>
          <ThemedText style={[styles.headerTitle, { color: isDark ? '#fff' : '#23262F' }]}>Home</ThemedText>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color={isDark ? '#fff' : '#23262F'} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={[styles.searchContainer, { backgroundColor: isDark ? '#23262F' : '#fff' }]}>
            <Ionicons name="search" size={20} color={isDark ? '#A6A6A6' : '#666'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#fff' : '#23262F' }]}
              placeholder="Search stories..."
              placeholderTextColor={isDark ? '#A6A6A6' : '#666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        <FlatList
          data={filteredStories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.storyList}
          refreshing={loading}
          onRefresh={() => dispatch(fetchStories())}
          ListHeaderComponent={
            <>
              {featuredStories.length > 0 && (
                <View style={styles.featuredSection}>
                  <ThemedText style={[styles.sectionTitle, { color: isDark ? '#fff' : '#23262F' }]}>Top Stories of the Week</ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.featuredList}
                  >
                    {featuredStories.map(story => (
                      <TouchableOpacity
                        key={story.id}
                        style={styles.featuredStoryCard}
                        onPress={() => router.push({
                          pathname: '/story/[id]',
                          params: { id: story.id }
                        })}
                      >
                        <Image
                          source={{ uri: story.coverImage || 'https://via.placeholder.com/150x150' }}
                          style={styles.featuredStoryImage}
                        />
                        <ThemedText style={[styles.featuredStoryTitle, { color: isDark ? '#fff' : '#23262F' }]} numberOfLines={1}>
                          {story.title}
                        </ThemedText>
                        <ThemedText style={[styles.featuredStoryTheme, { color: isDark ? '#A6A6A6' : '#666' }]} numberOfLines={1}>
                          {story.category}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.categoriesSection}>
                <ThemedText style={[styles.sectionTitle, { color: isDark ? '#fff' : '#23262F' }]}>Categories</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                >
                  {CATEGORIES.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        { backgroundColor: isDark ? '#23262F' : '#f0f0f0' },
                        selectedCategory === category.id && { backgroundColor: '#e74c3c' }
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <ThemedText
                        style={[
                          styles.categoryButtonText,
                          { color: isDark ? '#A6A6A6' : '#666' },
                          selectedCategory === category.id && { color: '#fff' }
                        ]}
                      >
                        {category.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 48,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  storyList: {
    gap: 15,
  },
  featuredSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  carouselWrapper: {
    marginTop: 10,
  },
  featuredCard: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featuredMetaText: {
    color: '#fff',
    fontSize: 14,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesList: {
    gap: 10,
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryButtonText: {
    fontSize: 14,
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
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  paginationContainer: {
    paddingVertical: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  paginationDotInactive: {
    backgroundColor: '#A6A6A6',
  },
  paginationDotContainer: {
    marginHorizontal: 4,
  },
  featuredList: {
    gap: 15,
    paddingRight: 20,
  },
  featuredStoryCard: {
    width: 120,
    alignItems: 'center',
  },
  featuredStoryImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  featuredStoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  featuredStoryTheme: {
    fontSize: 12,
    textAlign: 'center',
  },
}); 