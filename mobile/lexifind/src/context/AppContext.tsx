import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { fetchWord } from '../services/dictionaryApi';
import { AppError, AppState, SearchHistoryItem, WordEntry } from '../types';
import { addToHistory, clearAllHistory, loadHistory } from '../utils/storage';

interface AppContextValue {
  state: AppState;
  searchWord: (word: string) => Promise<WordEntry[] | null>;
  clearHistory: () => Promise<void>;
}

type Action =
  | { type: 'SEARCH_START'; payload: string }
  | { type: 'SEARCH_SUCCESS'; payload: SearchHistoryItem[] }
  | { type: 'SEARCH_ERROR'; payload: AppError }
  | { type: 'LOAD_HISTORY'; payload: SearchHistoryItem[] }
  | { type: 'CLEAR_HISTORY' };

const initialState: AppState = {
  status: 'idle',
  currentWord: '',
  error: null,
  history: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SEARCH_START':
      return { ...state, status: 'loading', currentWord: action.payload, error: null };
    case 'SEARCH_SUCCESS':
      return { ...state, status: 'idle', error: null, history: action.payload };
    case 'SEARCH_ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'LOAD_HISTORY':
      return { ...state, history: action.payload };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadHistory().then((history) => {
      dispatch({ type: 'LOAD_HISTORY', payload: history });
    });
  }, []);

  const searchWord = useCallback(async (word: string): Promise<WordEntry[] | null> => {
    const trimmed = word.trim();
    if (!trimmed) return null;

    dispatch({ type: 'SEARCH_START', payload: trimmed });
    try {
      const entries = await fetchWord(trimmed);
      const updatedHistory = await addToHistory(entries[0]?.word ?? trimmed);
      dispatch({ type: 'SEARCH_SUCCESS', payload: updatedHistory });
      return entries;
    } catch (error) {
      dispatch({ type: 'SEARCH_ERROR', payload: error as AppError });
      return null;
    }
  }, []);

  const clearHistory = useCallback(async () => {
    await clearAllHistory();
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  return (
    <AppContext.Provider value={{ state, searchWord, clearHistory }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
