import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { fetchStories } from '@/store/slices/storySlice';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { stories, loading } = useAppSelector((state: RootState) => state.stories);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const story = stories.find(s => s.id === id);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' ? false : true;
  const insets = useSafeAreaInsets();
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;

  // Audio state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // UI state
  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState<{ id: string; text: string; author: string; createdAt: string; avatar?: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showFullContent, setShowFullContent] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

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
    loadingText: {
      marginTop: 10,
      fontSize: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      marginTop: 10,
      fontSize: 16,
      color: '#FF3B30',
    },
    animatedHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    blurView: {
      width: '100%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 10,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 15,
    },
    headerButton: {
      padding: 5,
    },
    heroSection: {
      position: 'relative',
      height: 300,
    },
    coverImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
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
    heroActions: {
      flexDirection: 'row',
      gap: 10,
    },
    heroButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingBottom: 30,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    categoryBadge: {
      backgroundColor: '#e74c3c',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    categoryText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    heroTitle: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    metadata: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 15,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    metaText: {
      fontSize: 14,
      color: '#666',
    },
    metaTextHero: {
      fontSize: 14,
      color: '#fff',
    },
    content: {
      padding: 20,
      gap: 24,
    },
    audioPlayerCard: {
      backgroundColor: isDark ? '#23262F' : '#fff',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    audioPlayerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    audioTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#fff' : '#23262F',
    },
    fontSizeControls: {
      flexDirection: 'row',
      gap: 10,
    },
    fontSizeButton: {
      padding: 4,
    },
    audioPlayer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    controlButton: {
      alignItems: 'center',
    },
    controlText: {
      fontSize: 12,
      color: isDark ? '#A6A6A6' : '#666',
      marginTop: 2,
    },
    playButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: isDark ? '#23262F' : '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    progressContainer: {
      gap: 5,
    },
    progressBar: {
      height: 4,
      backgroundColor: isDark ? '#23262F' : '#e0e0e0',
      borderRadius: 2,
      position: 'relative',
    },
    progress: {
      height: '100%',
      backgroundColor: '#e74c3c',
      borderRadius: 2,
    },
    bufferingIndicator: {
      position: 'absolute',
      right: 0,
      top: -8,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    time: {
      fontSize: 12,
      color: isDark ? '#A6A6A6' : '#666',
    },
    storyContent: {
      backgroundColor: isDark ? '#23262F' : '#fff',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    storyText: {
      lineHeight: 24,
      color: isDark ? '#fff' : '#23262F',
    },
    readMoreButton: {
      marginTop: 16,
      alignSelf: 'center',
    },
    readMoreText: {
      color: '#e74c3c',
      fontWeight: '600',
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      backgroundColor: isDark ? '#23262F' : '#f0f0f0',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tagText: {
      fontSize: 14,
      color: isDark ? '#A6A6A6' : '#666',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#23262F',
    },
    commentCount: {
      marginLeft: 8,
      fontSize: 14,
      color: isDark ? '#A6A6A6' : '#666',
      backgroundColor: isDark ? '#23262F' : '#f0f0f0',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    commentsSection: {
      gap: 16,
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    commentInputContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    commentInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    commentAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
      backgroundColor: '#f8f8f8',
      color: '#e74c3c',
      fontSize: 14,
    },
    commentButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#e74c3c',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2,
    },
    commentButtonDisabled: {
      opacity: 0.5,
    },
    comment: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: '#f8f8f8',
      padding: 16,
      borderRadius: 16,
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    commentAuthor: {
      fontWeight: '600',
      color: '#23262F',
    },
    commentDate: {
      fontSize: 12,
      color: '#666',
    },
    commentText: {
      fontSize: 14,
      lineHeight: 20,
      color: '#666',
    },
    commentActions: {
      flexDirection: 'row',
      marginTop: 8,
      gap: 16,
    },
    commentAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    commentActionText: {
      fontSize: 12,
      color: '#666',
    },
    relatedStories: {
      gap: 16,
    },
    relatedStory: {
      flexDirection: 'row',
      gap: 15,
      // backgroundColor: isDark ? '#23262F' : '#f8f8f8',
      padding: 12,
      borderRadius: 16,
      marginBottom: 12,
    },
    relatedStoryImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    relatedStoryContent: {
      flex: 1,
      justifyContent: 'space-between',
    },
    relatedStoryTitle: {
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 4,
      color: isDark ? '#fff' : '#23262F',
    },
    relatedStoryMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    relatedStoryAuthor: {
      fontSize: 14,
      color: isDark ? '#A6A6A6' : '#666',
    },
    relatedStoryRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    relatedStoryRatingText: {
      fontSize: 14,
      color: isDark ? '#A6A6A6' : '#666',
    },
    relatedStoryDuration: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    relatedStoryDurationText: {
      fontSize: 12,
      color: isDark ? '#A6A6A6' : '#666',
    },
    backButton: {
      marginTop: 20,
      padding: 10,
    },
    backButtonText: {
      color: '#e74c3c',
      fontSize: 16,
    },
  });

  useEffect(() => {
    dispatch(fetchStories());
    
    // Load mock comments
    if (story) {
      setComments([
        {
          id: '1',
          text: 'This story was amazing! I loved the character development and the plot twists.',
          author: 'Sarah Johnson',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        },
        {
          id: '2',
          text: 'The narration was excellent. I felt like I was right there in the story.',
          author: 'Michael Chen',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        },
      ]);
    }
  }, [dispatch, story?.id]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAudio = async () => {
    if (!story?.audioUrl) return;

    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: story.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
      Alert.alert('Audio Error', 'Failed to load audio. Please try again later.');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering);
      
      // Auto-restart when finished
      if (status.didJustFinish) {
        sound?.setPositionAsync(0);
      }
    }
  };

  const handlePlayPause = async () => {
    if (isLoading) return;
    
    if (!sound) {
      await loadAudio();
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
      Alert.alert('Playback Error', 'Failed to control audio playback.');
    }
  };

  const handleSeek = async (value: number) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(value);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  const handleRewind = async () => {
    if (!sound) return;
    const newPosition = Math.max(0, position - 15000);
    await handleSeek(newPosition);
  };

  const handleForward = async () => {
    if (!sound) return;
    const newPosition = Math.min(duration, position + 15000);
    await handleSeek(newPosition);
  };

  const handleShare = async () => {
    if (!story) return;

    try {
      await Share.share({
        message: `Check out this story: ${story.title}\n\n${story.content.substring(0, 100)}...`,
        url: `https://storywhisper.app/story/${story.id}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share story');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, this would update the user's favorites in the backend
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;

    const comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: user.username,
      createdAt: new Date().toISOString(),
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const relatedStories = story ? stories
    .filter(s => s.id !== story.id && s.category === story.category)
    .slice(0, 3) : [];

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
        </View>
      </ThemedView>
    );
  }

  if (!story) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <ThemedText style={styles.errorText}>Story not found</ThemedText>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: isDark ? '#181A20' : '#F6F7FB' }]}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: story.coverImage || 'https://via.placeholder.com/400x225' }}
            style={styles.coverImage}
          />
          
          <View style={[styles.heroOverlay, { paddingTop: insets.top }]}>
            <TouchableOpacity 
              style={styles.backButtonTransparent} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.heroActions}>
              <TouchableOpacity onPress={handleShare} style={styles.heroButton}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleToggleFavorite} style={styles.heroButton}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorite ? '#FF3B30' : '#fff'}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>{story.category}</ThemedText>
            </View>
            <ThemedText type="title" style={styles.heroTitle}>{story.title}</ThemedText>
            
            <View style={styles.metadata}>
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={16} color="#fff" />
                <ThemedText style={styles.metaTextHero}>{story.author || 'Anonymous'}</ThemedText>
              </View>
              {story.duration && (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#fff" />
                  <ThemedText style={styles.metaTextHero}>{story.duration} min</ThemedText>
                </View>
              )}
              {story.rating && (
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <ThemedText style={styles.metaTextHero}>{story.rating}</ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Audio Player */}
          {story.audioUrl && (
            <View style={styles.audioPlayerCard}>
              <View style={styles.audioPlayerHeader}>
                <ThemedText style={styles.audioTitle}>Listen to Story</ThemedText>
                <View style={styles.fontSizeControls}>
                  <TouchableOpacity 
                    onPress={() => setFontSizeMultiplier(Math.max(0.8, fontSizeMultiplier - 0.1))}
                    style={styles.fontSizeButton}
                  >
                    <Ionicons name="text-outline" size={16} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setFontSizeMultiplier(Math.min(1.4, fontSizeMultiplier + 0.1))}
                    style={styles.fontSizeButton}
                  >
                    <Ionicons name="text-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.audioPlayer}>
                <TouchableOpacity onPress={handleRewind} style={styles.controlButton}>
                  <Ionicons name="play-back" size={24} color="#e74c3c" />
                  <ThemedText style={styles.controlText}>15s</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#e74c3c" />
                  ) : (
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={32}
                      color="#e74c3c"
                    />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleForward} style={styles.controlButton}>
                  <Ionicons name="play-forward" size={24} color="#e74c3c" />
                  <ThemedText style={styles.controlText}>15s</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progress,
                      { width: `${duration > 0 ? (position / duration) * 100 : 0}%` },
                    ]}
                  />
                  {isBuffering && (
                    <View style={styles.bufferingIndicator}>
                      <ActivityIndicator size="small" color="#e74c3c" />
                    </View>
                  )}
                </View>
                <View style={styles.timeContainer}>
                  <ThemedText style={styles.time}>
                    {formatTime(position)}
                  </ThemedText>
                  <ThemedText style={styles.time}>
                    {formatTime(duration)}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Story Content */}
          <View style={styles.storyContent}>
            <ThemedText 
              style={[styles.storyText, { fontSize: 16 * fontSizeMultiplier }]}
              numberOfLines={showFullContent ? undefined : 10}
            >
              {story.content}
            </ThemedText>
            
            {story.content.length > 500 && !showFullContent && (
              <TouchableOpacity 
                style={styles.readMoreButton}
                onPress={() => setShowFullContent(true)}
              >
                <ThemedText style={styles.readMoreText}>Read More</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <View style={styles.tags}>
              {story.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Comments</ThemedText>
              <ThemedText style={styles.commentCount}>{comments.length}</ThemedText>
            </View>
            
            <View style={styles.commentInputContainer}>
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/lego/1.jpg' }} 
                style={styles.commentAvatar} 
              />
              <View style={styles.commentInputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={[styles.commentButton, !newComment.trim() && styles.commentButtonDisabled]}
                  onPress={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {comments.map(comment => (
              <View key={comment.id} style={styles.comment}>
                <Image 
                  source={{ uri: comment.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg' }} 
                  style={styles.commentAvatar} 
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <ThemedText style={styles.commentAuthor}>{comment.author}</ThemedText>
                    <ThemedText style={styles.commentDate}>
                      {formatDate(comment.createdAt)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.commentText}>{comment.text}</ThemedText>
                  <View style={styles.commentActions}>
                    <TouchableOpacity style={styles.commentAction}>
                      <Ionicons name="heart-outline" size={16} color="#666" />
                      <ThemedText style={styles.commentActionText}>Like</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentAction}>
                      <Ionicons name="chatbubble-outline" size={16} color="#666" />
                      <ThemedText style={styles.commentActionText}>Reply</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Related Stories */}
          {relatedStories.length > 0 && (
            <View style={styles.relatedStories}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Related Stories</ThemedText>
              {relatedStories.map(relatedStory => (
                <TouchableOpacity
                  key={relatedStory.id}
                  style={styles.relatedStory}
                  onPress={() => router.push(`/story/${relatedStory.id}`)}
                >
                  <Image
                    source={{ uri: relatedStory.coverImage || 'https://via.placeholder.com/100x100' }}
                    style={styles.relatedStoryImage}
                  />
                  <View style={styles.relatedStoryContent}>
                    <ThemedText style={styles.relatedStoryTitle}>{relatedStory.title}</ThemedText>
                    <View style={styles.relatedStoryMeta}>
                      <ThemedText style={styles.relatedStoryAuthor}>
                        {relatedStory.author || 'Anonymous'}
                      </ThemedText>
                      {relatedStory.rating && (
                        <View style={styles.relatedStoryRating}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <ThemedText style={styles.relatedStoryRatingText}>{relatedStory.rating}</ThemedText>
                        </View>
                      )}
                    </View>
                    {relatedStory.duration && (
                      <View style={styles.relatedStoryDuration}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <ThemedText style={styles.relatedStoryDurationText}>{relatedStory.duration} min</ThemedText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};