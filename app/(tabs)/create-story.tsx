import { Notifications } from '@/components/Notifications';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { createStory } from '@/store/slices/storySlice';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AGE_CATEGORIES = [
  { id: 'age-2-4', name: 'Ages 2-4' },
  { id: 'age-5-7', name: 'Ages 5-7' },
  { id: 'age-8-10', name: 'Ages 8-10' },
];

const THEME_CATEGORIES = [
  { id: 'adventure', name: 'Adventure' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'educational', name: 'Educational' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'science-fiction', name: 'Sci-Fi' },
  { id: 'fairy-tale', name: 'Fairy Tales' },
];

export default function CreateStoryScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: RootState) => state.stories);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' ? false : true; // Force light mode by default
  const { unreadCount } = useAppSelector((state: RootState) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  // Animation value for the notification badge
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'age' | 'theme'>('age');

  // New state variables for story generation
  const [storyLength, setStoryLength] = useState('medium'); // short, medium, long
  const [mainCharacter, setMainCharacter] = useState('');
  const [supportingCharacters, setSupportingCharacters] = useState<string[]>([]);
  const [currentSupportingCharacter, setCurrentSupportingCharacter] = useState('');
  const [storySetting, setStorySetting] = useState('');
  const [storyMood, setStoryMood] = useState('');
  const [storyConflict, setStoryConflict] = useState('');
  const [storyLesson, setStoryLesson] = useState('');
  const [showGeneratedContent, setShowGeneratedContent] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

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

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleAddSupportingCharacter = () => {
    if (currentSupportingCharacter.trim() && !supportingCharacters.includes(currentSupportingCharacter.trim())) {
      setSupportingCharacters([...supportingCharacters, currentSupportingCharacter.trim()]);
      setCurrentSupportingCharacter('');
    }
  };

  const handleRemoveSupportingCharacter = (characterToRemove: string) => {
    setSupportingCharacters(supportingCharacters.filter(char => char !== characterToRemove));
  };

  const handleGenerateStory = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title first');
      return;
    }

    if (!mainCharacter.trim()) {
      Alert.alert('Error', 'Please enter a main character name');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI story generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const generatedContent = `Once upon a time, in ${storySetting || 'a magical world'}, there lived ${mainCharacter}...\n\nThis is a sample AI-generated story based on the provided parameters. In a real implementation, this would be generated by an AI model using all the story elements provided.`;
      setContent(generatedContent);
      setShowGeneratedContent(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCreateStory = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }

    try {
      const result = await dispatch(createStory({
        title: title.trim(),
        content: content.trim(),
        userId: user?.id || '',
        isPublic,
        tags,
        category: selectedCategories[0],
        coverImage: coverImage || undefined,
        author: user?.username || 'Anonymous',
      })).unwrap();

      if (result) {
        Alert.alert('Success', 'Story created successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea]} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#23262F" />
          </TouchableOpacity>
          <ThemedText style={[styles.headerTitle, { color: '#23262F' }]}>Stwórz nową historię</ThemedText>
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
          data={[1]}
          renderItem={() => (
            <View style={styles.form}>
              <View style={styles.coverImageSection}>
                <ThemedText style={[styles.sectionTitle, { color: '#23262F' }]}>Okładka</ThemedText>
                <TouchableOpacity
                  style={[styles.coverImageButton, { backgroundColor: '#fbe9e7' }]}
                  onPress={handlePickImage}
                  disabled={loading}
                >
                  {coverImage ? (
                    <Image source={{ uri: coverImage }} style={styles.coverImage} />
                  ) : (
                    <View style={styles.coverImagePlaceholder}>
                      <Ionicons name="image-outline" size={32} color="#666" />
                      <ThemedText style={[styles.coverImageText, { color: '#666' }]}>Dodaj okładkę</ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.storyParametersSection}>
                <ThemedText style={[styles.sectionTitle, { color: '#23262F' }]}>Parametry historii</ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: '#fbe9e7' }]}>
                <TextInput
                  style={[styles.input, { color: '#23262F' }]}
                  placeholder="Tytuł historii"
                  placeholderTextColor="#666"
                  value={title}
                  onChangeText={setTitle}
                  editable={!loading}
                />
              </View>
                <View style={[styles.inputContainer, { backgroundColor: '#fbe9e7' }]}>
                  <TextInput
                    style={[styles.input, { color: '#23262F' }]}
                    placeholder="Imię głównego bohatera"
                    placeholderTextColor="#666"
                    value={mainCharacter}
                    onChangeText={setMainCharacter}
                    editable={!loading}
                  />
                </View>

                <View style={styles.supportingCharactersSection}>
                  <View style={[styles.inputContainer, { backgroundColor: '#fbe9e7' }]}>
                    <TextInput
                      style={[styles.input, { color: '#23262F' }]}
                      placeholder="Dodaj postać drugoplanową"
                      placeholderTextColor="#666"
                      value={currentSupportingCharacter}
                      onChangeText={setCurrentSupportingCharacter}
                      onSubmitEditing={handleAddSupportingCharacter}
                      editable={!loading}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.addTagButton, !currentSupportingCharacter.trim() && styles.addTagButtonDisabled]}
                    onPress={handleAddSupportingCharacter}
                    disabled={!currentSupportingCharacter.trim() || loading}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                    <ThemedText style={styles.addTagButtonText}>Dodaj postać</ThemedText>
                  </TouchableOpacity>

                  <View style={styles.tags}>
                    {supportingCharacters.map(character => (
                      <View key={character} style={[styles.tag, { backgroundColor: '#f0f0f0' }]}>
                        <ThemedText style={[styles.tagText, { color: '#666' }]}>{character}</ThemedText>
                        <TouchableOpacity
                          onPress={() => handleRemoveSupportingCharacter(character)}
                          disabled={loading}
                        >
                          <Ionicons name="close" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={[styles.inputContainer, { backgroundColor: '#fbe9e7' }]}>
                  <TextInput
                    style={[styles.input, { color: '#23262F' }]}
                    placeholder="Miejsce akcji (np. magiczny las, kosmiczna stacja)"
                    placeholderTextColor="#666"
                    value={storySetting}
                    onChangeText={setStorySetting}
                    editable={!loading}
                  />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: '#fbe9e7' }]}>
                  <TextInput
                    style={[styles.input, { color: '#23262F' }]}
                    placeholder="Nastrój historii (np. tajemniczy, wesoły, przygodowy)"
                    placeholderTextColor="#666"
                    value={storyMood}
                    onChangeText={setStoryMood}
                    editable={!loading}
                  />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: '#fbe9e7' }]}>
                  <TextInput
                    style={[styles.input, { color: '#23262F' }]}
                    placeholder="Główny konflikt lub problem do rozwiązania"
                    placeholderTextColor="#666"
                    value={storyConflict}
                    onChangeText={setStoryConflict}
                    editable={!loading}
                  />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: '#fbe9e7' }]}>
                  <TextInput
                    style={[styles.input, { color: '#23262F' }]}
                    placeholder="Morał lub lekcja z historii"
                    placeholderTextColor="#666"
                    value={storyLesson}
                    onChangeText={setStoryLesson}
                    editable={!loading}
                  />
                </View>

                <View style={styles.storyLengthSection}>
                  <ThemedText style={[styles.sectionSubtitle, { color: '#23262F' }]}>Długość historii</ThemedText>
                  <View style={styles.storyLengthButtons}>
                    <TouchableOpacity
                      style={[
                        styles.storyLengthButton,
                        storyLength === 'short' && styles.storyLengthButtonActive
                      ]}
                      onPress={() => setStoryLength('short')}
                    >
                      <ThemedText style={[
                        styles.storyLengthButtonText,
                        storyLength === 'short' && styles.storyLengthButtonTextActive
                      ]}>Krótka</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.storyLengthButton,
                        storyLength === 'medium' && styles.storyLengthButtonActive
                      ]}
                      onPress={() => setStoryLength('medium')}
                    >
                      <ThemedText style={[
                        styles.storyLengthButtonText,
                        storyLength === 'medium' && styles.storyLengthButtonTextActive
                      ]}>Średnia</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.storyLengthButton,
                        storyLength === 'long' && styles.storyLengthButtonActive
                      ]}
                      onPress={() => setStoryLength('long')}
                    >
                      <ThemedText style={[
                        styles.storyLengthButtonText,
                        storyLength === 'long' && styles.storyLengthButtonTextActive
                      ]}>Długa</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

             

              

              <View style={styles.contentSection}>
                <View style={styles.contentHeader}>
                  <TouchableOpacity
                    style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
                    onPress={handleGenerateStory}
                    disabled={isGenerating || loading}
                  >
                    <Ionicons name="sparkles-outline" size={20} color="#e74c3c" />
                    <ThemedText style={styles.generateButtonText}>
                      {isGenerating ? 'Generuje...' : 'Generuj z AI'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                {showGeneratedContent && (
                  <>
                    <ThemedText style={[styles.sectionTitle, { color: '#23262F' }]}>Wygenerowana historia</ThemedText>
                    <View style={[styles.inputContainer, { backgroundColor: '#fbe9e7' }]}>
                      <TextInput
                        style={[styles.input, styles.contentInput, { color: '#23262F' }]}
                        placeholder="Napisz swoją historię tutaj..."
                        placeholderTextColor="#666"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                        editable={!loading}
                      />
                    </View>
                  </>
                )}
              </View>
              <View style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: '#23262F' }]}>Kategorie</ThemedText>
                  <TouchableOpacity
                    style={[styles.categoryButton, { backgroundColor: '#e74c3c' }]}
                    onPress={() => setShowCategoryModal(true)}
                  >
                    {selectedCategories.length > 0 ? (
                      <ThemedText style={[styles.categoryButtonText, { color: '#fff' }]}>
                        {selectedCategories.length} wybranych
                      </ThemedText>
                    ) : (
                      <View style={styles.addCategoryButton}>
                        <Ionicons name="add" size={20} color="#fff" />
                        <ThemedText style={[styles.categoryButtonText, { color: '#fff' }]}>
                          Dodaj kategorie
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                >
                  {selectedCategories.map(categoryId => {
                    const category = [...AGE_CATEGORIES, ...THEME_CATEGORIES].find(cat => cat.id === categoryId);
                    return category ? (
                      <View key={categoryId} style={[styles.selectedCategory, { backgroundColor: '#e74c3c' }]}>
                        <ThemedText style={[styles.selectedCategoryText, { color: '#fff' }]}>
                          {category.name}
                        </ThemedText>
                        <TouchableOpacity onPress={() => toggleCategory(categoryId)}>
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : null;
                  })}
                </ScrollView>
              </View>
              <View style={styles.tagSection}>
                <ThemedText style={[styles.sectionTitle, { color: '#23262F' }]}>Tagi</ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: '#fbe9e7' }]}>
                  <TextInput
                    style={[styles.input, styles.tagInput, { color: '#23262F' }]}
                    placeholder="Dodaj tag"
                    placeholderTextColor="#666"
                    value={currentTag}
                    onChangeText={setCurrentTag}
                    onSubmitEditing={handleAddTag}
                    editable={!loading}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.addTagButton, !currentTag.trim() && styles.addTagButtonDisabled]}
                  onPress={handleAddTag}
                  disabled={!currentTag.trim() || loading}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                  <ThemedText style={styles.addTagButtonText}>Dodaj tag</ThemedText>
                </TouchableOpacity>

                <View style={styles.tags}>
                  {tags.map(tag => (
                    <View key={tag} style={[styles.tag, { backgroundColor: '#f0f0f0' }]}>
                      <ThemedText style={[styles.tagText, { color: '#666' }]}>{tag}</ThemedText>
                      <TouchableOpacity
                        onPress={() => handleRemoveTag(tag)}
                        disabled={loading}
                      >
                        <Ionicons name="close" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.privacySection}>
                <ThemedText style={[styles.sectionTitle, { color: '#23262F' }]}>Prywatność</ThemedText>
                <TouchableOpacity
                  style={styles.privacyToggle}
                  onPress={() => setIsPublic(!isPublic)}
                  disabled={loading}
                >
                  <View style={[styles.toggle, isPublic && styles.toggleActive]} />
                  <ThemedText style={{ color: '#23262F' }}>{isPublic ? 'Publiczna' : 'Prywatna'}</ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.createButton, loading && styles.createButtonDisabled]}
                onPress={handleCreateStory}
                disabled={loading}
              >
                <ThemedText style={styles.createButtonText}>
                  {loading ? 'Tworzenie...' : 'Stwórz historię'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={() => 'create-story-form'}
          contentContainerStyle={styles.storyList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: '#fff' }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: '#23262F' }]}>
                Wybierz kategorie
              </ThemedText>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#23262F" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalTabs}>
              <TouchableOpacity
                style={[styles.modalTab, activeTab === 'age' && styles.activeModalTab]}
                onPress={() => setActiveTab('age')}
              >
                <ThemedText style={[styles.modalTabText, { color: '#23262F' }]}>
                  Grupy wiekowe
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalTab, activeTab === 'theme' && styles.activeModalTab]}
                onPress={() => setActiveTab('theme')}
              >
                <ThemedText style={[styles.modalTabText, { color: '#23262F' }]}>
                  Tematy
                </ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {(activeTab === 'age' ? AGE_CATEGORIES : THEME_CATEGORIES).map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.modalItem,
                    selectedCategories.includes(category.id) && styles.selectedModalItem
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <ThemedText style={[
                    styles.modalItemText,
                    { color: '#23262F' },
                    selectedCategories.includes(category.id) && { color: '#fff' }
                  ]}>
                    {category.name}
                  </ThemedText>
                  {selectedCategories.includes(category.id) && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <ThemedText style={styles.modalDoneButtonText}>Gotowe</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Notifications 
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    borderRadius: 14,
  },
  input: {
    height: 48,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  contentInput: {
    height: 250,
    paddingTop: 15,
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  categorySection: {
    gap: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoriesList: {
    gap: 10,
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#23262F',
  },
  categoryButtonText: {
    fontSize: 14,
  },
  coverImageSection: {
    gap: 10,
  },
  coverImageButton: {
    width: 200,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  coverImageText: {
    fontSize: 14,
  },
  contentSection: {
    gap: 15,
    marginTop: 10,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  tagSection: {
    gap: 10,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
    gap: 8,
  },
  addTagButtonDisabled: {
    opacity: 0.5,
  },
  addTagButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
  },
  privacySection: {
    gap: 10,
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#e74c3c',
  },
  createButton: {
    backgroundColor: '#e74c3c',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 20,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  modalTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 14,
  },
  activeModalTab: {
    backgroundColor: '#e74c3c',
  },
  modalTabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalList: {
    maxHeight: '60%',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 10,
  },
  selectedModalItem: {
    backgroundColor: '#e74c3c',
  },
  modalItemText: {
    fontSize: 16,
  },
  modalDoneButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  modalDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  selectedCategoryText: {
    fontSize: 14,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  storyList: {
    gap: 20,
    paddingHorizontal: 4,
  },
  storyParametersSection: {
    gap: 15,
  },
  supportingCharactersSection: {
    gap: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  storyLengthSection: {
    gap: 10,
  },
  storyLengthButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  storyLengthButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e74c3c',
    alignItems: 'center',
  },
  storyLengthButtonActive: {
    backgroundColor: '#e74c3c',
  },
  storyLengthButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
  },
  storyLengthButtonTextActive: {
    color: '#fff',
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