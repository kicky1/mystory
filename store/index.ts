import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import storyReducer from './slices/storySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stories: storyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 