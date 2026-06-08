import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  isDark?: boolean;
}

export default function EmptyState({
  icon = 'book-outline',
  title,
  subtitle,
  isDark = false,
}: Props) {
  const iconBg = isDark ? 'rgba(91,79,233,0.18)' : Colors.primaryLight;
  const textPrimary = isDark ? '#F5F5FF' : '#1A1D2E';
  const textSecondary = isDark ? '#B4B4CC' : '#4B5066';

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={52} color={Colors.primary} />
      </View>
      <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
