import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchHistoryItem } from '../types';

const HISTORY_KEY = '@lexifind:history';
const MAX_HISTORY_ITEMS = 50;

export async function loadHistory(): Promise<SearchHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.word === 'string' &&
        typeof item.timestamp === 'number',
    );
  } catch {
    return [];
  }
}

export async function addToHistory(word: string): Promise<SearchHistoryItem[]> {
  try {
    const existing = await loadHistory();
    // Remove existing entry for this word (case-insensitive dedup)
    const filtered = existing.filter(
      (item) => item.word.toLowerCase() !== word.toLowerCase(),
    );
    const newItem: SearchHistoryItem = {
      word: word.trim(),
      timestamp: Date.now(),
    };
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function clearAllHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {
    // Silently ignore storage errors
  }
}
