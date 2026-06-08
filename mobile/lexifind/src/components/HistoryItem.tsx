import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchHistoryItem } from '../types';
import { Colors } from '../constants/colors';
import { formatTimestamp } from '../utils/helpers';

interface Props {
  item: SearchHistoryItem;
  onPress: (word: string) => void;
  isDark?: boolean;
}

export default function HistoryItem({ item, onPress, isDark = false }: Props) {
  const textPrimary = isDark ? '#F5F5FF' : '#1A1D2E';
  const textMuted = isDark ? '#6B6B8A' : '#9498B0';
  const iconBg = isDark ? 'rgba(217,119,6,0.18)' : Colors.amberLight;
  const rowBg = isDark ? 'transparent' : 'transparent';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: rowBg }]}
      onPress={() => onPress(item.word)}
      activeOpacity={0.65}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name="time-outline" size={17} color={Colors.amber} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.word, { color: textPrimary }]}>{item.word}</Text>
        <Text style={[styles.time, { color: textMuted }]}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={15} color={textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1 },
  word: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  time: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '400',
  },
});
