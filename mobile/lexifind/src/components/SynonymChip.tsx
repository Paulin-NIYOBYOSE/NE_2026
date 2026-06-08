import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  word: string;
  onPress?: (word: string) => void;
  variant?: 'synonym' | 'antonym';
  isDark?: boolean;
}

export default function SynonymChip({
  word,
  onPress,
  variant = 'synonym',
  isDark = false,
}: Props) {
  const isSynonym = variant === 'synonym';

  const bg = isSynonym
    ? isDark
      ? 'rgba(91,79,233,0.18)'
      : Colors.primaryLight
    : isDark
    ? 'rgba(225,29,72,0.15)'
    : '#FFF1F2';

  const border = isSynonym
    ? isDark
      ? 'rgba(91,79,233,0.3)'
      : Colors.primary + '40'
    : isDark
    ? 'rgba(225,29,72,0.3)'
    : '#E11D48' + '40';

  const textColor = isSynonym ? Colors.primary : '#E11D48';

  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: bg, borderColor: border }]}
      onPress={() => onPress?.(word)}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Text style={[styles.text, { color: textColor }]}>{word}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
