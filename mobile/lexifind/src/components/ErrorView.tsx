import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppError } from '../types';
import { Colors } from '../constants/colors';

interface Props {
  error: AppError;
  onRetry?: () => void;
  isDark?: boolean;
}

const ICON_MAP: Record<AppError['type'], keyof typeof Ionicons.glyphMap> = {
  not_found: 'search-outline',
  network: 'wifi-outline',
  timeout: 'time-outline',
  parse: 'alert-circle-outline',
  unknown: 'warning-outline',
};

const TITLE_MAP: Record<AppError['type'], string> = {
  not_found: 'Word Not Found',
  network: 'No Connection',
  timeout: 'Request Timed Out',
  parse: 'Unexpected Response',
  unknown: 'Something Went Wrong',
};

export default function ErrorView({ error, onRetry, isDark = false }: Props) {
  const cardBg = isDark ? '#1E1B2E' : '#FFFFFF';
  const cardBorder = isDark ? '#2E2B44' : '#E4E6F1';
  const textPrimary = isDark ? '#F5F5FF' : '#1A1D2E';
  const textSecondary = isDark ? '#B4B4CC' : '#4B5066';
  const errorIconBg = isDark ? 'rgba(225,29,72,0.15)' : '#FFF1F2';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            shadowColor: isDark ? '#000' : '#E11D48',
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: errorIconBg }]}>
          <Ionicons name={ICON_MAP[error.type]} size={44} color="#E11D48" />
        </View>
        <Text style={[styles.title, { color: textPrimary }]}>
          {TITLE_MAP[error.type]}
        </Text>
        <Text style={[styles.message, { color: textSecondary }]}>
          {error.message}
        </Text>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 24,
    gap: 6,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
