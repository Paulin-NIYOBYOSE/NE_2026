import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WordEntry } from '../types';
import { Colors } from '../constants/colors';
import AudioPlayer from './AudioPlayer';
import { extractAudioUrl, extractPhoneticText } from '../utils/helpers';

interface Props {
  entries: WordEntry[];
  isDark?: boolean;
}

export default function WordCard({ entries, isDark = false }: Props) {
  if (!entries.length) return null;

  const primary = entries[0];
  const audioUrl = extractAudioUrl(entries);
  const phoneticText = extractPhoneticText(entries);

  const totalMeanings = entries.reduce(
    (acc, e) => acc + (e.meanings?.length ?? 0),
    0,
  );
  const totalDefinitions = entries.reduce(
    (acc, e) =>
      acc +
      (e.meanings?.reduce((a, m) => a + (m.definitions?.length ?? 0), 0) ?? 0),
    0,
  );

  return (
    <LinearGradient
      colors={isDark ? ['#4038C4', '#2A2480'] : [Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      <View style={styles.content}>
        <Text style={styles.word}>{primary.word}</Text>

        <AudioPlayer audioUrl={audioUrl} phoneticText={phoneticText} />

        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>{totalMeanings}</Text>
            <Text style={styles.statLabel}>
              {totalMeanings === 1 ? 'meaning' : 'meanings'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>{totalDefinitions}</Text>
            <Text style={styles.statLabel}>
              {totalDefinitions === 1 ? 'definition' : 'definitions'}
            </Text>
          </View>
          {entries.length > 1 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statBadge}>
                <Text style={styles.statValue}>{entries.length}</Text>
                <Text style={styles.statLabel}>entries</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  circleTopRight: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -50,
    right: -50,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -35,
    left: -25,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  word: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statBadge: { alignItems: 'center' },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginHorizontal: 20,
  },
});
