import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  message?: string;
  isDark?: boolean;
}

export default function LoadingSpinner({ message, isDark = false }: Props) {
  const spinnerBg = isDark ? 'rgba(91,79,233,0.18)' : Colors.primaryLight;
  const textColor = isDark ? '#B4B4CC' : '#4B5066';

  return (
    <View style={styles.container}>
      <View style={[styles.spinnerWrap, { backgroundColor: spinnerBg }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
    paddingVertical: 60,
    gap: 14,
  },
  spinnerWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
