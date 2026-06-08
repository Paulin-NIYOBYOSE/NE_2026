import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { DrawerParamList, RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';

type Nav = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, 'Search'>,
  DrawerNavigationProp<DrawerParamList>
>;

interface Props {
  navigation: Nav;
  route: RouteProp<RootStackParamList, 'Search'>;
}

const SUGGESTIONS = [
  'ephemeral',
  'serendipity',
  'melancholy',
  'ubiquitous',
  'eloquent',
  'resilient',
];

export default function SearchScreen({ navigation, route }: Props) {
  const { state, searchWord } = useApp();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const lastSearchRef = useRef('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const bg = isDark ? '#0F0E17' : '#F5F6FF';
  const chipBg = isDark ? '#1E1B2E' : '#FFFFFF';
  const chipBorder = isDark ? 'rgba(91,79,233,0.3)' : 'rgba(91,79,233,0.25)';
  const sectionLabelColor = isDark ? '#6B6B8A' : '#9498B0';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSearch = useCallback(
    async (word: string) => {
      const trimmed = word.trim();
      if (!trimmed) return;
      Keyboard.dismiss();
      lastSearchRef.current = trimmed;
      const entries = await searchWord(trimmed);
      if (entries) {
        navigation.navigate('WordDetail', { entries, word: trimmed });
      }
    },
    [navigation, searchWord],
  );

  useEffect(() => {
    const paramWord = route.params?.word;
    if (paramWord && paramWord !== lastSearchRef.current) {
      setQuery(paramWord);
      handleSearch(paramWord);
    }
  }, [route.params?.word, handleSearch]);

  const handleRefresh = useCallback(async () => {
    if (!lastSearchRef.current) return;
    setRefreshing(true);
    const entries = await searchWord(lastSearchRef.current);
    if (entries) {
      navigation.navigate('WordDetail', { entries, word: lastSearchRef.current });
    }
    setRefreshing(false);
  }, [navigation, searchWord]);

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const isIdle = state.status === 'idle';

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: bg }]}>
      {/* Gradient header */}
      <LinearGradient
        colors={isDark ? ['#4038C4', '#2A2480'] : [Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />

        {/* Menu button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.headerTitle}>LexiFind</Text>
          <Text style={styles.headerSubtitle}>Your pocket dictionary</Text>
        </Animated.View>

        {/* Search bar */}
        <View style={styles.searchBarWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSearch={handleSearch}
            loading={isLoading}
            isDark={isDark}
          />
        </View>
      </LinearGradient>

      {/* Body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          lastSearchRef.current ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          ) : undefined
        }
      >
        {isLoading && <LoadingSpinner message={`Looking up "${query}"…`} isDark={isDark} />}

        {isError && state.error && (
          <ErrorView
            error={state.error}
            onRetry={() => lastSearchRef.current && handleSearch(lastSearchRef.current)}
            isDark={isDark}
          />
        )}

        {isIdle && (
          <EmptyState
            icon="book-outline"
            title="Search a Word"
            subtitle="Type any English word above to explore its definitions, pronunciation, and usage examples."
            isDark={isDark}
          />
        )}

        {isIdle && (
          <View style={styles.suggestionsSection}>
            <Text style={[styles.suggestionsLabel, { color: sectionLabelColor }]}>
              Try searching for…
            </Text>
            <View style={styles.suggestionsRow}>
              {SUGGESTIONS.map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[
                    styles.chip,
                    { backgroundColor: chipBg, borderColor: chipBorder },
                  ]}
                  onPress={() => {
                    setQuery(w);
                    handleSearch(w);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipText}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  circleTopRight: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -60,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: -30,
  },
  menuButton: {
    alignSelf: 'flex-start',
    padding: 4,
    marginTop: 12,
    marginBottom: 8,
  },
  headerContent: { marginBottom: 16 },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '500',
    marginTop: 2,
  },
  searchBarWrap: { marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 40,
  },
  suggestionsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
