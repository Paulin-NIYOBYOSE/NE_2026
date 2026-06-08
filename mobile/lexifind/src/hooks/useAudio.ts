import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';

export function useAudio() {
  const [status, setStatus] = useState<AudioStatus>('idle');
  const soundRef = useRef<Audio.Sound | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const stopAudio = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch {
      // Ignore cleanup errors
    }
    if (mountedRef.current) setStatus('idle');
  }, []);

  const playAudio = useCallback(
    async (url: string) => {
      // Unload any existing sound first
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {
          // Ignore
        }
        soundRef.current = null;
      }

      if (mountedRef.current) setStatus('loading');

      try {
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
              if (mountedRef.current) setStatus('idle');
            }
          },
        );

        soundRef.current = sound;
        if (mountedRef.current) setStatus('playing');
      } catch {
        soundRef.current = null;
        if (mountedRef.current) setStatus('error');
      }
    },
    [],
  );

  return { status, playAudio, stopAudio };
}
