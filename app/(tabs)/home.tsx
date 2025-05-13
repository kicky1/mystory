import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { fetchStories } from '@/store/slices/storySlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  { id: 'fantasy', name: 'Fantasy', image: require('@/assets/images/ninja.png') },
  { id: 'adventure', name: 'Przygoda', image: require('@/assets/images/ninja.png') },
  { id: 'science-fiction', name: 'Sci-Fi', image: require('@/assets/images/robot.png') },
  { id: 'fairy-tale', name: 'Bajki', image: require('@/assets/images/wizzard.png') },
  { id: 'educational', name: 'Edukacyjne', image: require('@/assets/images/ninja.png') },
];

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { stories, loading, error } = useAppSelector((state: RootState) => state.stories);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' ? false : true; // Force light mode by default

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

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // If clicking the same category, go back to categories view
      setShowCategories(true);
      setShowSearch(false);
      setSelectedCategory('all');
    } else {
      // If selecting a new category, show search and stories
      setSelectedCategory(categoryId);
      setShowCategories(false);
      setShowSearch(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <ThemedText style={[styles.headerTitle, { color: '#23262F' }]}>Strona główna</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={24} color={'#e74c3c'} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={showCategories ? [] : filteredStories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.storyList}
          refreshing={loading}
          onRefresh={() => dispatch(fetchStories())}
          ListHeaderComponent={
            <>
              {showCategories && featuredStories.length > 0 && (
                <View style={styles.featuredSection}>
                  <ThemedText style={[styles.sectionTitle, { color: isDark ? '#fff' : '#23262F' }]}>Top 20 tygodnia</ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.featuredList}
                  >
                    {featuredStories.map((story, index) => (
                      <TouchableOpacity
                        key={story.id}
                        style={styles.featuredStoryCard}
                        onPress={() => router.push({
                          pathname: '/story/[id]',
                          params: { id: story.id }
                        })}
                      >
                        <View style={styles.featuredStoryImageContainer}>
                          <Image
                            source={{ uri: story.coverImage || 'https://via.placeholder.com/150x150' }}
                            style={styles.featuredStoryImage}
                          />
                          <View style={styles.featuredStoryNumber}>
                            <ThemedText style={styles.featuredStoryNumberText}>{index + 1}</ThemedText>
                          </View>
                        </View>
                        <View style={styles.featuredStoryInfo}>
                          <ThemedText style={[styles.featuredStoryTitle, { color: isDark ? '#fff' : '#23262F' }]} numberOfLines={1}>
                            {story.title}
                          </ThemedText>
                          <ThemedText style={[styles.featuredStoryAuthor, { color: isDark ? '#A6A6A6' : '#666' }]} numberOfLines={1}>
                            {story.author}
                          </ThemedText>
                          <ThemedText style={[styles.featuredStoryTheme, { color: isDark ? '#A6A6A6' : '#666' }]} numberOfLines={1}>
                            {story.category}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {showCategories ? (
                <View style={styles.categoriesSection}>
                  <View style={styles.categoriesGrid}>
                    {CATEGORIES.map(category => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryTile,
                          { backgroundColor: isDark ? '#23262F' : '#fbe9e7' },
                          selectedCategory === category.id && { backgroundColor: '#e74c3c' }
                        ]}
                        onPress={() => handleCategorySelect(category.id)}
                      >
                        <Image source={category.image} style={styles.categoryImage} />
                        <ThemedText
                          style={[
                            styles.categoryTileText,
                            { color: isDark ? '#A6A6A6' : '#000' },
                            selectedCategory === category.id && { color: '#fff' }
                          ]}
                        >
                          {category.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.categoriesSection}>
                  <View style={styles.categoryHeader}>
                    <TouchableOpacity 
                      style={styles.backButton}
                      onPress={() => {
                        setShowCategories(true);
                        setShowSearch(false);
                        setSelectedCategory('all');
                      }}
                    >
                      <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#23262F'} />
                    </TouchableOpacity>
                    <ThemedText style={[styles.categoryTitle, { color: isDark ? '#fff' : '#23262F' }]}>
                      {CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                    </ThemedText>
                  </View>
                  <View style={[styles.searchContainer, { backgroundColor: isDark ? '#23262F' : '#fff', marginBottom: 2 }]}>
                    <Ionicons name="search" size={20} color={isDark ? '#A6A6A6' : '#666'} style={styles.searchIcon} />
                    <TextInput
                      style={[styles.searchInput, { color: isDark ? '#fff' : '#23262F' }]}
                      placeholder="Szukaj opowiadań..."
                      placeholderTextColor={isDark ? '#A6A6A6' : '#666'}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                </View>
              )}
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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    position: 'relative',
  },
  headerTitleContainer: {
    position: 'absolute',
    
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerRight: {
    marginLeft: 'auto',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 48,
    marginBottom: 20,
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
    paddingBottom: 0,
    marginBottom: 0,
    paddingHorizontal: 4,
  },
  featuredSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 15,
  },
  carouselWrapper: {
    marginTop: 10,
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
    marginBottom: 0,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryTile: {
    width: '48%',
    aspectRatio: 1.3,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    overflow: 'hidden',
  },
  categoryImage: {
    width: 100,
    height: 100,
    marginBottom: 2,
    resizeMode: 'contain',
  },
  categoryTileText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
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
    paddingRight: 24,
    paddingLeft: 4,
  },
  featuredStoryCard: {
    width: 140,
  },
  featuredStoryImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  featuredStoryImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
  },
  featuredStoryNumber: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredStoryNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  featuredStoryInfo: {
    paddingHorizontal: 4,
    gap: 0,
  },
  featuredStoryTitle: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '600',
  },
  featuredStoryAuthor: {
    fontSize: 12,
    lineHeight: 16,
  },
  featuredStoryTheme: {
    fontSize: 10,
    lineHeight: 14,
  },
}); 