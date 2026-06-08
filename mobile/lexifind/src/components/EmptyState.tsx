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
  const iconBg = isDark ? 'rgba(217,119,6,0.18)' : Colors.amberLight;
  const textPrimary = isDark ? '#F5F5FF' : '#1A1D2E';
  const textSecondary = isDark ? '#B4B4CC' : '#4B5066';

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={52} color={Colors.amber} />
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
    paddingHorizontal: 28,
    paddingVertical: 56,
  },
  iconWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
});
