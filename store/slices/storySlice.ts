import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface Story {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  createdAt: string;
  userId: string;
  isPublic: boolean;
  tags: string[];
  featured?: boolean;
  category?: string;
  coverImage?: string;
  duration?: number;
  rating?: number;
  author?: string;
}

interface StoryState {
  stories: Story[];
  currentStory: Story | null;
  loading: boolean;
  error: string | null;
}

const initialState: StoryState = {
  stories: [],
  currentStory: null,
  loading: false,
  error: null,
};

// Mock API calls
const mockStories: Story[] = [
  {
    id: '1',
    title: 'The Magic Forest',
    content: 'Once upon a time, in a magical forest...',
    audioUrl: 'https://example.com/audio1.mp3',
    createdAt: new Date().toISOString(),
    userId: '1',
    isPublic: true,
    tags: ['fantasy', 'adventure'],
    featured: true,
    category: 'fantasy',
    coverImage: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&auto=format&fit=crop',
    duration: 5,
    rating: 4.5,
    author: 'StoryWhisper AI'
  },
  {
    id: '2',
    title: 'Space Adventure',
    content: 'In the vast darkness of space...',
    audioUrl: 'https://example.com/audio2.mp3',
    createdAt: new Date().toISOString(),
    userId: '1',
    isPublic: true,
    tags: ['sci-fi', 'space'],
    featured: false,
    category: 'adventure',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
    duration: 7,
    rating: 4.2,
    author: 'StoryWhisper AI'
  },
  {
    id: '3',
    title: 'The Lost City of Atlantis',
    content: 'Deep beneath the ocean waves...',
    audioUrl: 'https://example.com/audio3.mp3',
    createdAt: new Date().toISOString(),
    userId: '2',
    isPublic: true,
    tags: ['mystery', 'underwater'],
    featured: true,
    category: 'mystery',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    duration: 8,
    rating: 4.8,
    author: 'StoryWhisper AI'
  },
  {
    id: '4',
    title: 'The Time Traveler\'s Diary',
    content: 'The old leather-bound diary contained entries from the future...',
    audioUrl: 'https://example.com/audio4.mp3',
    createdAt: new Date().toISOString(),
    userId: '3',
    isPublic: true,
    tags: ['sci-fi', 'time-travel'],
    featured: false,
    category: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
    duration: 6,
    rating: 4.3,
    author: 'StoryWhisper AI'
  },
  {
    id: '5',
    title: 'The Dragon\'s Treasure',
    content: 'The ancient dragon had been guarding its hoard for centuries...',
    audioUrl: 'https://example.com/audio5.mp3',
    createdAt: new Date().toISOString(),
    userId: '4',
    isPublic: true,
    tags: ['fantasy', 'dragons'],
    featured: true,
    category: 'fantasy',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop',
    duration: 9,
    rating: 4.7,
    author: 'StoryWhisper AI'
  },
  {
    id: '6',
    title: 'The Detective\'s Last Case',
    content: 'It was supposed to be a routine investigation...',
    audioUrl: 'https://example.com/audio6.mp3',
    createdAt: new Date().toISOString(),
    userId: '5',
    isPublic: true,
    tags: ['mystery', 'crime'],
    featured: false,
    category: 'mystery',
    coverImage: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=800&auto=format&fit=crop',
    duration: 7,
    rating: 4.4,
    author: 'StoryWhisper AI'
  },
  {
    id: '7',
    title: 'The Robot\'s Dream',
    content: 'In a world where robots had achieved consciousness...',
    audioUrl: 'https://example.com/audio7.mp3',
    createdAt: new Date().toISOString(),
    userId: '6',
    isPublic: true,
    tags: ['sci-fi', 'philosophy'],
    featured: true,
    category: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop',
    duration: 8,
    rating: 4.6,
    author: 'StoryWhisper AI'
  },
  {
    id: '8',
    title: 'The Last Unicorn',
    content: 'In a world where magic was fading...',
    audioUrl: 'https://example.com/audio8.mp3',
    createdAt: new Date().toISOString(),
    userId: '7',
    isPublic: true,
    tags: ['fantasy', 'magic'],
    featured: false,
    category: 'fantasy',
    coverImage: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&auto=format&fit=crop',
    duration: 6,
    rating: 4.1,
    author: 'StoryWhisper AI'
  },
  {
    id: '9',
    title: 'The Quantum Paradox',
    content: 'The experiment was supposed to be simple...',
    audioUrl: 'https://example.com/audio9.mp3',
    createdAt: new Date().toISOString(),
    userId: '8',
    isPublic: true,
    tags: ['sci-fi', 'quantum'],
    featured: true,
    category: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop',
    duration: 7,
    rating: 4.9,
    author: 'StoryWhisper AI'
  },
  {
    id: '10',
    title: 'The Ancient Scroll',
    content: 'The scroll had been hidden for millennia...',
    audioUrl: 'https://example.com/audio10.mp3',
    createdAt: new Date().toISOString(),
    userId: '9',
    isPublic: true,
    tags: ['mystery', 'ancient'],
    featured: false,
    category: 'mystery',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
    duration: 5,
    rating: 4.2,
    author: 'StoryWhisper AI'
  },
  {
    id: '11',
    title: 'The Cyberpunk Revolution',
    content: 'In the neon-lit streets of Neo-Tokyo...',
    audioUrl: 'https://example.com/audio11.mp3',
    createdAt: new Date().toISOString(),
    userId: '10',
    isPublic: true,
    tags: ['sci-fi', 'cyberpunk'],
    featured: true,
    category: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&auto=format&fit=crop',
    duration: 8,
    rating: 4.7,
    author: 'StoryWhisper AI'
  },
  {
    id: '12',
    title: 'The Enchanted Garden',
    content: 'The garden had been forgotten for centuries...',
    audioUrl: 'https://example.com/audio12.mp3',
    createdAt: new Date().toISOString(),
    userId: '11',
    isPublic: true,
    tags: ['fantasy', 'magic'],
    featured: false,
    category: 'fantasy',
    coverImage: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&auto=format&fit=crop',
    duration: 6,
    rating: 4.3,
    author: 'StoryWhisper AI'
  },
  {
    id: '13',
    title: 'The Time Capsule',
    content: 'The capsule was buried in 1950...',
    audioUrl: 'https://example.com/audio13.mp3',
    createdAt: new Date().toISOString(),
    userId: '12',
    isPublic: true,
    tags: ['mystery', 'historical'],
    featured: true,
    category: 'mystery',
    coverImage: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=800&auto=format&fit=crop',
    duration: 7,
    rating: 4.5,
    author: 'StoryWhisper AI'
  },
  {
    id: '14',
    title: 'The AI\'s Dilemma',
    content: 'The artificial intelligence had to make a choice...',
    audioUrl: 'https://example.com/audio14.mp3',
    createdAt: new Date().toISOString(),
    userId: '13',
    isPublic: true,
    tags: ['sci-fi', 'philosophy'],
    featured: false,
    category: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop',
    duration: 9,
    rating: 4.8,
    author: 'StoryWhisper AI'
  },
  {
    id: '15',
    title: 'The Dragon\'s Apprentice',
    content: 'The young wizard had been chosen...',
    audioUrl: 'https://example.com/audio15.mp3',
    createdAt: new Date().toISOString(),
    userId: '14',
    isPublic: true,
    tags: ['fantasy', 'magic'],
    featured: true,
    category: 'fantasy',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop',
    duration: 8,
    rating: 4.6,
    author: 'StoryWhisper AI'
  },
  {
    id: '16',
    title: 'The Quantum Detective',
    content: 'The case involved multiple timelines...',
    audioUrl: 'https://example.com/audio16.mp3',
    createdAt: new Date().toISOString(),
    userId: '15',
    isPublic: true,
    tags: ['sci-fi', 'mystery'],
    featured: false,
    category: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop',
    duration: 7,
    rating: 4.4,
    author: 'StoryWhisper AI'
  },
  {
    id: '17',
    title: 'The Last Spell',
    content: 'Magic was dying in the world...',
    audioUrl: 'https://example.com/audio17.mp3',
    createdAt: new Date().toISOString(),
    userId: '16',
    isPublic: true,
    tags: ['fantasy', 'magic'],
    featured: true,
    category: 'fantasy',
    coverImage: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&auto=format&fit=crop',
    duration: 6,
    rating: 4.7,
    author: 'StoryWhisper AI'
  },
  {
    id: '18',
    title: 'The Virtual Reality Mystery',
    content: 'The line between reality and virtual reality blurred...',
    audioUrl: 'https://example.com/audio18.mp3',
    createdAt: new Date().toISOString(),
    userId: '17',
    isPublic: true,
    tags: ['sci-fi', 'virtual-reality'],
    featured: false,
    category: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop',
    duration: 8,
    rating: 4.5,
    author: 'StoryWhisper AI'
  },
  {
    id: '19',
    title: 'The Ancient Prophecy',
    content: 'The prophecy had been foretold for generations...',
    audioUrl: 'https://example.com/audio19.mp3',
    createdAt: new Date().toISOString(),
    userId: '18',
    isPublic: true,
    tags: ['fantasy', 'prophecy'],
    featured: true,
    category: 'fantasy',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop',
    duration: 9,
    rating: 4.8,
    author: 'StoryWhisper AI'
  },
  {
    id: '20',
    title: 'The Time Loop',
    content: 'Every day was exactly the same...',
    audioUrl: 'https://example.com/audio20.mp3',
    createdAt: new Date().toISOString(),
    userId: '19',
    isPublic: true,
    tags: ['sci-fi', 'time-travel'],
    featured: false,
    category: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop',
    duration: 7,
    rating: 4.6,
    author: 'StoryWhisper AI'
  },
  {
    id: '21',
    title: 'The Hidden Kingdom',
    content: 'Behind the waterfall lay a secret...',
    audioUrl: 'https://example.com/audio21.mp3',
    createdAt: new Date().toISOString(),
    userId: '20',
    isPublic: true,
    tags: ['fantasy', 'adventure'],
    featured: true,
    category: 'fantasy',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    duration: 8,
    rating: 4.7,
    author: 'StoryWhisper AI'
  },
  {
    id: '22',
    title: 'The Digital Conspiracy',
    content: 'The code contained a hidden message...',
    audioUrl: 'https://example.com/audio22.mp3',
    createdAt: new Date().toISOString(),
    userId: '21',
    isPublic: true,
    tags: ['sci-fi', 'mystery'],
    featured: false,
    category: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
    duration: 6,
    rating: 4.3,
    author: 'StoryWhisper AI'
  }
];

// Async thunks
export const fetchStories = createAsyncThunk(
  'stories/fetchStories',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockStories;
    } catch (error) {
      return rejectWithValue('Failed to fetch stories');
    }
  }
);

export const createStory = createAsyncThunk(
  'stories/createStory',
  async (story: Omit<Story, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newStory: Story = {
        ...story,
        id: String(mockStories.length + 1),
        createdAt: new Date().toISOString(),
      };
      mockStories.push(newStory);
      return newStory;
    } catch (error) {
      return rejectWithValue('Failed to create story');
    }
  }
);

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    setCurrentStory: (state, action) => {
      state.currentStory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stories
      .addCase(fetchStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Story
      .addCase(createStory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.loading = false;
        state.stories.push(action.payload);
      })
      .addCase(createStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentStory, clearError } = storySlice.actions;
export default storySlice.reducer; 