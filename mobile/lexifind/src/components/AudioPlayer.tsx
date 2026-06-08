import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioContext } from '../context/AudioContext';

interface Props {
  audioUrl: string | null;
  phoneticText?: string | null;
}

export default function AudioPlayer({ audioUrl, phoneticText }: Props) {
  const { status, currentUrl, playAudio, pauseAudio, stopAudio } = useAudioContext();

  const isActive = audioUrl !== null && currentUrl === audioUrl;
  const isPlaying = isActive && status === 'playing';
  const isPaused = isActive && status === 'paused';
  const isLoading = isActive && status === 'loading';
  const isError = isActive && status === 'error';
  const showControls = isPlaying || isPaused;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const stopAnim = useRef(new Animated.Value(0)).current;

  // Pulse the main button while audio is playing
  useEffect(() => {
    if (isPlaying) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 380, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
        ]),
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    }
  }, [isPlaying, pulseAnim]);

  // Spring the stop button in when active, out when idle
  useEffect(() => {
    Animated.spring(stopAnim, {
      toValue: showControls ? 1 : 0,
      useNativeDriver: true,
      tension: 90,
      friction: 7,
    }).start();
  }, [showControls, stopAnim]);

  const handlePlayPause = async () => {
    if (!audioUrl) return;
    if (isPlaying) {
      await pauseAudio();
    } else {
      // Handles fresh play, resume from paused, and error retry
      await playAudio(audioUrl);
    }
  };

  const icon: keyof typeof Ionicons.glyphMap = isLoading
    ? 'hourglass-outline'
    : isPlaying
    ? 'pause-circle'
    : isError
    ? 'alert-circle-outline'
    : isPaused
    ? 'play-circle'
    : 'volume-high-outline';

  const disabled = !audioUrl || isLoading;

  return (
    <View style={styles.container}>
      {phoneticText ? <Text style={styles.phonetic}>{phoneticText}</Text> : null}

      <View style={styles.controls}>
        {/* Play / pause toggle */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.button,
              disabled && styles.buttonDisabled,
              isPlaying && styles.buttonPlaying,
              isPaused && styles.buttonPaused,
              isError && styles.buttonError,
            ]}
            onPress={handlePlayPause}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Ionicons name={icon} size={22} color={isError ? '#FF6B8A' : '#fff'} />
          </TouchableOpacity>
        </Animated.View>

        {/* Stop button — springs in when playing or paused */}
        <Animated.View
          style={[
            styles.stopWrap,
            { transform: [{ scale: stopAnim }], opacity: stopAnim },
          ]}
        >
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopAudio}
            disabled={!showControls}
            activeOpacity={0.8}
          >
            <Ionicons name="stop-circle-outline" size={22} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {isError && <Text style={styles.errorHint}>Audio unavailable</Text>}
      {!audioUrl && !phoneticText && <Text style={styles.noAudio}>No audio</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  phonetic: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.90)',
    fontStyle: 'italic',
    fontWeight: '500',
    flexShrink: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.18)',
    opacity: 0.55,
  },
  buttonPlaying: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderColor: 'rgba(255,255,255,0.9)',
  },
  buttonPaused: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderColor: 'rgba(255,255,255,0.7)',
  },
  buttonError: {
    backgroundColor: 'rgba(255,50,80,0.25)',
    borderColor: 'rgba(255,50,80,0.5)',
  },
  stopWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  errorHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  noAudio: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
  },
});
