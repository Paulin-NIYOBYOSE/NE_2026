import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../hooks/useAudio';

interface Props {
  audioUrl: string | null;
  phoneticText?: string | null;
}

export default function AudioPlayer({ audioUrl, phoneticText }: Props) {
  const { status, playAudio, stopAudio } = useAudio();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const loopRef = React.useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (status === 'playing') {
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
  }, [status, pulseAnim]);

  const handlePress = () => {
    if (!audioUrl) return;
    if (status === 'playing') {
      stopAudio();
    } else {
      playAudio(audioUrl);
    }
  };

  const icon: keyof typeof Ionicons.glyphMap =
    status === 'loading'
      ? 'hourglass-outline'
      : status === 'playing'
      ? 'stop-circle'
      : status === 'error'
      ? 'alert-circle-outline'
      : 'volume-high-outline';

  const btnStyle = [
    styles.button,
    !audioUrl && styles.buttonDisabled,
    status === 'playing' && styles.buttonPlaying,
    status === 'error' && styles.buttonError,
  ];

  return (
    <View style={styles.container}>
      {phoneticText ? (
        <Text style={styles.phonetic}>{phoneticText}</Text>
      ) : null}

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={btnStyle}
          onPress={handlePress}
          disabled={!audioUrl || status === 'loading'}
          activeOpacity={0.8}
        >
          <Ionicons
            name={icon}
            size={22}
            color={
              status === 'error'
                ? '#FF6B8A'
                : '#fff'
            }
          />
        </TouchableOpacity>
      </Animated.View>

      {status === 'error' && (
        <Text style={styles.errorHint}>Audio unavailable</Text>
      )}
      {!audioUrl && !phoneticText && (
        <Text style={styles.noAudio}>No audio</Text>
      )}
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
  buttonError: {
    backgroundColor: 'rgba(255,50,80,0.25)',
    borderColor: 'rgba(255,50,80,0.5)',
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
