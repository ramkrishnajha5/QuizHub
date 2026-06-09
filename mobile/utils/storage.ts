/**
 * Storage utility for React Native
 * Replaces web's IndexedDB (idb.ts) with AsyncStorage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUIZ_STATE_KEY = '@quizhub_quiz_state';

export const saveQuizState = async (state: any) => {
  try {
    await AsyncStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving quiz state:', error);
  }
};

export const getQuizState = async () => {
  try {
    const value = await AsyncStorage.getItem(QUIZ_STATE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting quiz state:', error);
    return null;
  }
};

export const clearQuizState = async () => {
  try {
    await AsyncStorage.removeItem(QUIZ_STATE_KEY);
  } catch (error) {
    console.error('Error clearing quiz state:', error);
  }
};

// Generic storage helpers
export const setItem = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

export const getItem = async <T = any>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting from storage:', error);
    return null;
  }
};

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
};
