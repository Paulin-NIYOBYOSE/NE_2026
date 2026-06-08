import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  message?: string;
  isDark?: boolean;
}

export default function LoadingSpinner({ message, isDark = false }: Props) {
  const spinnerBg = isDark ? 'rgba(13,148,136,0.18)' : Colors.tealLight;
  const textColor = isDark ? '#B4B4CC' : '#4B5066';

  return (
    <View style={styles.container}>
      <View style={[styles.spinnerWrap, { backgroundColor: spinnerBg }]}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
      {message ? (
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  spinnerWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});
