import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { DrawerParamList, RootStackParamList, WordEntry } from '../types';
import { Colors } from '../constants/colors';
import WordCard from '../components/WordCard';
import MeaningCard from '../components/MeaningCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';

type Nav = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, 'WordDetail'>,
  DrawerNavigationProp<DrawerParamList>
>;

interface Props {
  navigation: Nav;
  route: RouteProp<RootStackParamList, 'WordDetail'>;
}

export default function WordDetailScreen({ navigation, route }: Props) {
  const { state, searchWord } = useApp();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<WordEntry[]>(route.params.entries);
  const [word, setWord] = useState(route.params.word);
  const [inlineQuery, setInlineQuery] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const bg = isDark ? '#0F0E17' : '#F5F6FF';
  const barBg = isDark ? '#1E1B2E' : '#FFFFFF';
  const barBorder = isDark ? '#2E2B44' : '#E4E6F1';
  const textPrimary = isDark ? '#F5F5FF' : '#1A1D2E';
  const textMuted = isDark ? '#6B6B8A' : '#9498B0';
  const inputBg = isDark ? '#272438' : '#F5F6FF';
  const inputBorder = isDark ? '#3A3658' : '#E4E6F1';
  const dividerColor = isDark ? '#2E2B44' : '#E4E6F1';
  const sourceMuted = isDark ? '#6B6B8A' : '#9498B0';

  useEffect(() => {
    setEntries(route.params.entries);
    setWord(route.params.word);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [route.params, fadeAnim]);

  const handleSearchAnother = useCallback(
    async (newWord: string) => {
      const trimmed = newWord.trim();
      if (!trimmed) {
        setInlineError('Please enter a word.');
        return;
      }
      if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
        setInlineError('Enter a valid English word.');
        return;
      }
      setInlineError('');
      Keyboard.dismiss();
      setInlineQuery('');
      const results = await searchWord(trimmed);
      if (results) {
        navigation.setParams({ entries: results, word: trimmed });
      }
    },
    [navigation, searchWord],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const results = await searchWord(word);
    if (results) {
      navigation.setParams({ entries: results, word });
    }
    setRefreshing(false);
  }, [word, searchWord, navigation]);

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: bg }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: barBg, borderBottomColor: barBorder }]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.topBarTitle, { color: textPrimary }]} numberOfLines={1}>
          {word}
        </Text>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.openDrawer()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="menu" size={24} color={textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Inline search */}
      <View
        style={[
          styles.inlineBar,
          { backgroundColor: barBg, borderBottomColor: barBorder },
        ]}
      >
        <View
          style={[
            styles.inlineInput,
            { backgroundColor: inputBg, borderColor: inputBorder },
          ]}
        >
          <Ionicons name="search-outline" size={17} color={textMuted} />
          <TextInput
            style={[styles.inlineTextField, { color: textPrimary }]}
            value={inlineQuery}
            onChangeText={(t) => {
              setInlineQuery(t);
              if (inlineError) setInlineError('');
            }}
            placeholder="Search another word…"
            placeholderTextColor={textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => handleSearchAnother(inlineQuery)}
          />
          {inlineQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setInlineQuery('');
                setInlineError('');
              }}
            >
              <Ionicons name="close-circle" size={17} color={textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.inlineSearchBtn}
          onPress={() => handleSearchAnother(inlineQuery)}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {inlineError ? (
        <Text style={styles.inlineError}>{inlineError}</Text>
      ) : null}

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner message={`Searching "${state.currentWord}"…`} isDark={isDark} />
      ) : isError && state.error ? (
        <ErrorView error={state.error} onRetry={handleRefresh} isDark={isDark} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <WordCard entries={entries} isDark={isDark} />

            {entries.map((entry, ei) => (
              <React.Fragment key={ei}>
                {entries.length > 1 && (
                  <View style={styles.entryDivider}>
                    <View style={[styles.entryLine, { backgroundColor: dividerColor }]} />
                    <Text style={[styles.entryLabel, { color: textMuted }]}>
                      Entry {ei + 1}
                    </Text>
                    <View style={[styles.entryLine, { backgroundColor: dividerColor }]} />
                  </View>
                )}
                {entry.meanings?.map((meaning, mi) => (
                  <MeaningCard
                    key={`${ei}-${mi}`}
                    meaning={meaning}
                    index={ei === 0 ? mi : mi + 1}
                    onWordPress={handleSearchAnother}
                    isDark={isDark}
                  />
                ))}
              </React.Fragment>
            ))}

            {entries[0]?.sourceUrls?.length > 0 && (
              <View style={styles.sourceRow}>
                <Ionicons name="link-outline" size={13} color={sourceMuted} />
                <Text
                  style={[styles.sourceText, { color: sourceMuted }]}
                  numberOfLines={1}
                >
                  {entries[0].sourceUrls[0]}
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  iconBtn: { padding: 4 },
  topBarTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
    textTransform: 'capitalize',
  },
  inlineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  inlineInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1.5,
  },
  inlineTextField: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  inlineSearchBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineError: {
    fontSize: 12,
    color: '#E11D48',
    marginLeft: 20,
    marginTop: 4,
    marginBottom: 4,
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  entryDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  entryLine: { flex: 1, height: 1 },
  entryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  sourceText: {
    flex: 1,
    fontSize: 11,
  },
});
