import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { Audio } from 'expo-av';

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface AudioState {
  status: AudioStatus;
  currentUrl: string | null;
}

type AudioAction =
  | { type: 'PLAY_START'; url: string }
  | { type: 'PLAY_SUCCESS' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'FINISH' }
  | { type: 'ERROR' };

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case 'PLAY_START':
      return { status: 'loading', currentUrl: action.url };
    case 'PLAY_SUCCESS':
      return { ...state, status: 'playing' };
    case 'PAUSE':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;
    case 'RESUME':
      return state.status === 'paused' ? { ...state, status: 'playing' } : state;
    case 'STOP':
    case 'FINISH':
      return { status: 'idle', currentUrl: null };
    case 'ERROR':
      return { ...state, status: 'error' };
    default:
      return state;
  }
}

interface AudioContextValue {
  status: AudioStatus;
  currentUrl: string | null;
  playAudio: (url: string) => Promise<void>;
  pauseAudio: () => Promise<void>;
  resumeAudio: () => Promise<void>;
  stopAudio: () => Promise<void>;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audioState, dispatch] = useReducer(audioReducer, {
    status: 'idle',
    currentUrl: null,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const mountedRef = useRef(true);
  const processingRef = useRef(false);
  // Mirror state in a ref so async callbacks read the latest values without stale closures
  const stateRef = useRef(audioState);

  useEffect(() => {
    stateRef.current = audioState;
  }, [audioState]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const cleanupSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(async () => {
    await cleanupSound();
    if (mountedRef.current) dispatch({ type: 'STOP' });
  }, [cleanupSound]);

  const pauseAudio = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.pauseAsync();
      if (mountedRef.current) dispatch({ type: 'PAUSE' });
    } catch {}
  }, []);

  const resumeAudio = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.playAsync();
      if (mountedRef.current) dispatch({ type: 'RESUME' });
    } catch {}
  }, []);

  const playAudio = useCallback(
    async (url: string) => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        // Resume paused audio at the same URL instead of restarting
        if (
          url === stateRef.current.currentUrl &&
          stateRef.current.status === 'paused' &&
          soundRef.current
        ) {
          await soundRef.current.playAsync();
          if (mountedRef.current) dispatch({ type: 'RESUME' });
          return;
        }

        // Stop any currently playing audio before loading new one
        await cleanupSound();
        if (!mountedRef.current) return;

        dispatch({ type: 'PLAY_START', url });

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          (playbackStatus) => {
            if (!mountedRef.current) return;
            if (!playbackStatus.isLoaded) return;
            if (playbackStatus.didJustFinish) {
              soundRef.current?.unloadAsync().catch(() => {});
              soundRef.current = null;
              if (mountedRef.current) dispatch({ type: 'FINISH' });
            }
          },
        );

        soundRef.current = sound;
        if (mountedRef.current) dispatch({ type: 'PLAY_SUCCESS' });
      } catch {
        soundRef.current = null;
        if (mountedRef.current) dispatch({ type: 'ERROR' });
      } finally {
        processingRef.current = false;
      }
    },
    [cleanupSound],
  );

  const value = useMemo<AudioContextValue>(
    () => ({
      status: audioState.status,
      currentUrl: audioState.currentUrl,
      playAudio,
      pauseAudio,
      resumeAudio,
      stopAudio,
    }),
    [audioState.status, audioState.currentUrl, playAudio, pauseAudio, resumeAudio, stopAudio],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudioContext(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudioContext must be used within AudioProvider');
  return ctx;
}
