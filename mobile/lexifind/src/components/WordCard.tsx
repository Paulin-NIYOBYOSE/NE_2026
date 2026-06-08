import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WordEntry } from '../types';
import { Colors } from '../constants/colors';
import AudioPlayer from './AudioPlayer';
import { extractAllPhonetics, extractPhoneticText } from '../utils/helpers';

interface Props {
  entries: WordEntry[];
  isDark?: boolean;
}

export default function WordCard({ entries, isDark = false }: Props) {
  if (!entries.length) return null;

  const primary = entries[0];
  const allPhonetics = extractAllPhonetics(entries);
  // Fallback text for when no phonetic has an audio URL
  const fallbackText = extractPhoneticText(entries);

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

        {allPhonetics.length === 0 ? (
          // No audio in response — show phonetic text with disabled button
          <AudioPlayer audioUrl={null} phoneticText={fallbackText} />
        ) : allPhonetics.length === 1 ? (
          // Single pronunciation — same as before
          <AudioPlayer audioUrl={allPhonetics[0].audio} phoneticText={allPhonetics[0].text} />
        ) : (
          // Multiple pronunciations — labeled and numbered
          <View style={styles.phoneticsStack}>
            <Text style={styles.phoneticsLabel}>Pronunciations</Text>
            {allPhonetics.map((p, i) => (
              <View key={i} style={styles.pronunciationRow}>
                <View style={styles.pronunciationBadge}>
                  <Text style={styles.pronunciationNum}>{i + 1}</Text>
                </View>
                <View style={styles.pronunciationPlayer}>
                  <AudioPlayer
                    audioUrl={p.audio}
                    phoneticText={p.text ?? `Variant ${i + 1}`}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

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
  phoneticsStack: {
    gap: 6,
  },
  phoneticsLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.50)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  pronunciationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pronunciationBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pronunciationNum: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  pronunciationPlayer: {
    flex: 1,
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
