import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'story' | 'system' | 'update' | 'welcome';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: {
    storyId?: string;
    category?: string;
    action?: string;
  };
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [
    {
      id: '1',
      type: 'story',
      title: 'New Story Available',
      message: 'Check out the latest story in the Adventure category!',
      time: '2 hours ago',
      read: false,
      data: {
        storyId: 'story-123',
        category: 'adventure'
      }
    },
    {
      id: '2',
      type: 'update',
      title: 'Story Update',
      message: 'Your favorite story has been updated with new content.',
      time: '1 day ago',
      read: true,
      data: {
        storyId: 'story-456',
        action: 'update'
      }
    },
    {
      id: '3',
      type: 'welcome',
      title: 'Welcome!',
      message: 'Welcome to StoryWhisper! Start exploring our collection of stories.',
      time: '3 days ago',
      read: true
    },
    {
      id: '4',
      type: 'system',
      title: 'System Maintenance',
      message: 'We will be performing maintenance on our servers tomorrow at 2 AM.',
      time: '5 days ago',
      read: true
    },
    {
      id: '5',
      type: 'story',
      title: 'New Category Added',
      message: 'We have added a new category: Science Fiction!',
      time: '1 week ago',
      read: true,
      data: {
        category: 'science-fiction'
      }
    }
  ],
  unreadCount: 1,
  loading: false,
  error: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'time' | 'read'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        time: 'Just now',
        read: false
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    }
  }
});

export const {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  addNotification
} = notificationSlice.actions;

export default notificationSlice.reducer; 