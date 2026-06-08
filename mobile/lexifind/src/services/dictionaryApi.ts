import axios, { AxiosError } from 'axios';
import { AppError, WordEntry } from '../types';

const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

function buildError(type: AppError['type'], message: string): AppError {
  return { type, message };
}

export async function fetchWord(word: string): Promise<WordEntry[]> {
  const trimmed = word.trim();
  if (!trimmed) {
    throw buildError('unknown', 'Please enter a word to search.');
  }

  try {
    const { data } = await apiClient.get<WordEntry[]>(
      `${BASE_URL}/${encodeURIComponent(trimmed)}`,
    );

    if (!Array.isArray(data) || data.length === 0) {
      throw buildError(
        'not_found',
        `"${trimmed}" was not found. Please check the spelling and try again.`,
      );
    }

    // Defensive: ensure each entry has required fields
    const valid = data.filter(
      (e) => e && typeof e.word === 'string' && Array.isArray(e.meanings),
    );
    if (valid.length === 0) {
      throw buildError('parse', 'The API returned an unexpected format. Please try again.');
    }

    return valid;
  } catch (error) {
    // Re-throw our own AppErrors directly
    if ((error as AppError).type !== undefined) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError;

      if (axiosErr.response?.status === 404) {
        throw buildError(
          'not_found',
          `"${trimmed}" was not found in the dictionary. Check your spelling or try a base form of the word.`,
        );
      }

      if (axiosErr.code === 'ECONNABORTED') {
        throw buildError(
          'timeout',
          'The request timed out. Please check your connection and try again.',
        );
      }

      if (!axiosErr.response || axiosErr.code === 'ERR_NETWORK') {
        throw buildError(
          'network',
          'No internet connection. Please check your network settings and try again.',
        );
      }

      if ((axiosErr.response?.status ?? 0) >= 500) {
        throw buildError(
          'unknown',
          'The dictionary service is temporarily unavailable. Please try again later.',
        );
      }
    }

    throw buildError('unknown', 'An unexpected error occurred. Please try again.');
  }
}
