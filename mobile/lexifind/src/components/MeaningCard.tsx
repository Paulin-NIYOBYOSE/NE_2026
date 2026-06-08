import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Meaning } from '../types';
import { getPartOfSpeechColor } from '../constants/colors';
import SynonymChip from './SynonymChip';
import { dedupeStrings } from '../utils/helpers';

interface Props {
  meaning: Meaning;
  index: number;
  onWordPress?: (word: string) => void;
  isDark?: boolean;
}

export default function MeaningCard({
  meaning,
  index,
  onWordPress,
  isDark = false,
}: Props) {
  const [expanded, setExpanded] = useState(index === 0);
  const posColors = getPartOfSpeechColor(meaning.partOfSpeech);

  const synonyms = dedupeStrings([
    ...(meaning.synonyms ?? []),
    ...meaning.definitions.flatMap((d) => d.synonyms ?? []),
  ]).slice(0, 10);

  const antonyms = dedupeStrings([
    ...(meaning.antonyms ?? []),
    ...meaning.definitions.flatMap((d) => d.antonyms ?? []),
  ]).slice(0, 10);

  const cardBg = isDark ? '#1E1B2E' : '#FFFFFF';
  const cardBorder = isDark ? '#2E2B44' : '#E4E6F1';
  const textColor = isDark ? '#F5F5FF' : '#1A1D2E';
  const textMuted = isDark ? '#6B6B8A' : '#9498B0';
  const dividerColor = isDark ? '#272438' : '#EEF0F5';
  const exampleBg = isDark ? 'rgba(91,79,233,0.12)' : posColors.bg;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          shadowColor: isDark ? '#000' : '#5B4FE9',
        },
      ]}
    >
      {/* Card header / toggle */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((p) => !p)}
        activeOpacity={0.8}
      >
        <View style={[styles.badge, { backgroundColor: posColors.bg }]}>
          <Text style={[styles.badgeText, { color: posColors.text }]}>
            {meaning.partOfSpeech}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.defCount, { color: textMuted }]}>
            {meaning.definitions.length} def
            {meaning.definitions.length !== 1 ? 's' : ''}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={textMuted}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {meaning.definitions.map((def, i) => (
            <View key={i} style={styles.defBlock}>
              <View style={styles.defRow}>
                <View style={[styles.bullet, { backgroundColor: posColors.text }]} />
                <Text style={[styles.defText, { color: textColor }]}>
                  {def.definition}
                </Text>
              </View>
              {def.example ? (
                <View
                  style={[styles.exampleBox, { backgroundColor: exampleBg }]}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={13}
                    color={isDark ? 'rgba(91,79,233,0.8)' : posColors.text}
                    style={styles.exampleIcon}
                  />
                  <Text
                    style={[
                      styles.exampleText,
                      { color: isDark ? 'rgba(180,180,210,0.9)' : posColors.text },
                    ]}
                  >
                    &ldquo;{def.example}&rdquo;
                  </Text>
                </View>
              ) : null}
              {i < meaning.definitions.length - 1 && (
                <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              )}
            </View>
          ))}

          {synonyms.length > 0 && (
            <View style={[styles.chipsSection, { borderTopColor: dividerColor }]}>
              <Text style={[styles.chipsSectionTitle, { color: textMuted }]}>
                Synonyms
              </Text>
              <View style={styles.chipsRow}>
                {synonyms.map((s) => (
                  <SynonymChip
                    key={s}
                    word={s}
                    onPress={onWordPress}
                    variant="synonym"
                    isDark={isDark}
                  />
                ))}
              </View>
            </View>
          )}

          {antonyms.length > 0 && (
            <View style={[styles.chipsSection, { borderTopColor: dividerColor }]}>
              <Text style={[styles.chipsSectionTitle, { color: textMuted }]}>
                Antonyms
              </Text>
              <View style={styles.chipsRow}>
                {antonyms.map((a) => (
                  <SynonymChip
                    key={a}
                    word={a}
                    onPress={onWordPress}
                    variant="antonym"
                    isDark={isDark}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  defBlock: { marginBottom: 8 },
  defRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 7,
    flexShrink: 0,
  },
  defText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    marginLeft: 17,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  exampleIcon: { marginTop: 2, flexShrink: 0 },
  exampleText: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  divider: { height: 1, marginVertical: 8 },
  chipsSection: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  chipsSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
