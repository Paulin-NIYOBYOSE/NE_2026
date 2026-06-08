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

const CHIP_PALETTE = [
  { bg: '#F5F3FF', text: '#7C3AED', border: 'rgba(124,58,237,0.30)',  darkBg: 'rgba(124,58,237,0.18)', darkText: '#A78BFA', darkBorder: 'rgba(124,58,237,0.40)' },
  { bg: '#FFFBEB', text: '#D97706', border: 'rgba(217,119,6,0.30)',   darkBg: 'rgba(217,119,6,0.18)',  darkText: '#FCD34D', darkBorder: 'rgba(217,119,6,0.40)'  },
  { bg: '#EFF6FF', text: '#2563EB', border: 'rgba(37,99,235,0.30)',   darkBg: 'rgba(37,99,235,0.18)',  darkText: '#93C5FD', darkBorder: 'rgba(37,99,235,0.40)'  },
  { bg: '#F0FDFA', text: '#0D9488', border: 'rgba(13,148,136,0.30)',  darkBg: 'rgba(13,148,136,0.18)', darkText: '#5EEAD4', darkBorder: 'rgba(13,148,136,0.40)' },
  { bg: '#FFF1F2', text: '#E11D48', border: 'rgba(225,29,72,0.30)',   darkBg: 'rgba(225,29,72,0.18)',  darkText: '#FDA4AF', darkBorder: 'rgba(225,29,72,0.40)'  },
  { bg: '#F0FDF4', text: '#16A34A', border: 'rgba(22,163,74,0.30)',   darkBg: 'rgba(22,163,74,0.18)',  darkText: '#86EFAC', darkBorder: 'rgba(22,163,74,0.40)'  },
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

  const bg = isDark ? '#0F0E17' : Colors.background;
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
              {SUGGESTIONS.map((w, i) => {
                const cp = CHIP_PALETTE[i % CHIP_PALETTE.length];
                return (
                  <TouchableOpacity
                    key={w}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isDark ? cp.darkBg : cp.bg,
                        borderColor: isDark ? cp.darkBorder : cp.border,
                      },
                    ]}
                    onPress={() => {
                      setQuery(w);
                      handleSearch(w);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, { color: isDark ? cp.darkText : cp.text }]}>
                      {w}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
    paddingHorizontal: 20,
    paddingBottom: 28,
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
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '500',
    marginTop: 4,
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
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 26,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
