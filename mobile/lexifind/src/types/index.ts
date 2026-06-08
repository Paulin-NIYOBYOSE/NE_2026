import { NavigatorScreenParams } from '@react-navigation/native';

export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: { name: string; url: string };
}

export interface Definition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface License {
  name: string;
  url: string;
}

export interface WordEntry {
  word: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license: License;
  sourceUrls: string[];
}

export interface SearchHistoryItem {
  word: string;
  timestamp: number;
}

export type ErrorType = 'not_found' | 'network' | 'timeout' | 'parse' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
}

export type AppStatus = 'idle' | 'loading' | 'error';

export interface AppState {
  status: AppStatus;
  currentWord: string;
  error: AppError | null;
  history: SearchHistoryItem[];
}

export type RootStackParamList = {
  Search: { word?: string } | undefined;
  WordDetail: { entries: WordEntry[]; word: string };
};

export type DrawerParamList = {
  MainStack: NavigatorScreenParams<RootStackParamList> | undefined;
  Settings: undefined;
};
