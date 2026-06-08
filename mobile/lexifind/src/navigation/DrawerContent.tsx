import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import HistoryItem from '../components/HistoryItem';
import { Colors } from '../constants/colors';

const NAV_ITEMS = [
  {
    key: 'MainStack',
    label: 'Dictionary',
    icon: 'book-outline' as const,
    activeIcon: 'book' as const,
  },
  {
    key: 'Settings',
    label: 'Settings',
    icon: 'settings-outline' as const,
    activeIcon: 'settings' as const,
  },
] as const;

export default function DrawerContent(props: DrawerContentComponentProps) {
  const { state, clearHistory } = useApp();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [clearing, setClearing] = useState(false);

  const currentRoute = props.state.routes[props.state.index]?.name ?? '';

  const bg = isDark ? '#0F0E17' : '#F5F6FF';
  const surfaceBg = isDark ? '#1E1B2E' : '#FFFFFF';
  const borderColor = isDark ? '#2E2B44' : '#E4E6F1';
  const textPrimary = isDark ? '#F5F5FF' : '#1A1D2E';
  const textMuted = isDark ? '#6B6B8A' : '#9498B0';
  const activeNavBg = isDark ? 'rgba(91,79,233,0.18)' : Colors.primaryLight;

  const handleHistoryPress = (word: string) => {
    props.navigation.closeDrawer();
    props.navigation.navigate('MainStack', {
      screen: 'Search',
      params: { word },
    });
  };

  const handleClearHistory = () => {
    if (state.history.length === 0) return;
    Alert.alert(
      'Clear History',
      'Remove all search history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await clearHistory();
            setClearing(false);
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {/* Gradient header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.decorCircle} />
        <View style={styles.logoRow}>
          <View style={styles.logoIconWrap}>
            <Ionicons name="book" size={26} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.appName}>LexiFind</Text>
            <Text style={styles.appTagline}>DICTIONARY</Text>
          </View>
        </View>
        <View style={styles.statsBadge}>
          <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.7)" />
          <Text style={styles.statsText}>
            {state.history.length} word{state.history.length !== 1 ? 's' : ''} searched
          </Text>
        </View>
      </LinearGradient>

      {/* Nav items */}
      <View style={[styles.navSection, { borderBottomColor: borderColor }]}>
        {NAV_ITEMS.map((item) => {
          const active = currentRoute === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.navItem,
                active && { backgroundColor: activeNavBg },
              ]}
              onPress={() => props.navigation.navigate(item.key as never)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.navIconWrap,
                  { backgroundColor: active ? Colors.primary : (isDark ? '#272438' : '#F5F6FF') },
                ]}
              >
                <Ionicons
                  name={active ? item.activeIcon : item.icon}
                  size={20}
                  color={active ? '#fff' : textMuted}
                />
              </View>
              <Text
                style={[
                  styles.navLabel,
                  { color: active ? Colors.primary : textPrimary },
                  active && styles.navLabelActive,
                ]}
              >
                {item.label}
              </Text>
              {active && <View style={styles.navActiveDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* History section header */}
      <View style={[styles.sectionHeader, { borderBottomColor: borderColor }]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="time" size={17} color={Colors.primary} />
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Recent Searches</Text>
        </View>
        {state.history.length > 0 && (
          <TouchableOpacity
            onPress={handleClearHistory}
            style={[styles.clearBtn, { backgroundColor: isDark ? '#2E1A22' : '#FFF1F2' }]}
            disabled={clearing}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color="#E11D48" />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* History list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {state.history.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIconWrap, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="search-outline" size={30} color={Colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No history yet</Text>
            <Text style={[styles.emptySub, { color: textMuted }]}>
              Words you search will appear here.
            </Text>
          </View>
        ) : (
          state.history.map((item) => (
            <HistoryItem
              key={`${item.word}-${item.timestamp}`}
              item={item}
              onPress={handleHistoryPress}
              isDark={isDark}
            />
          ))
        )}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: borderColor,
            paddingBottom: insets.bottom + 12,
            backgroundColor: surfaceBg,
          },
        ]}
      >
        <Text style={[styles.footerText, { color: textMuted }]}>
          LexiTech Solutions Ltd © 2025
        </Text>
        <Text style={[styles.footerSub, { color: textMuted }]}>
          Powered by Free Dictionary API
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -50,
    right: -50,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  logoIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.4,
  },
  appTagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '600',
    letterSpacing: 1.6,
    marginTop: 1,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  navSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
  },
  navIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  navLabelActive: {
    fontWeight: '700',
  },
  navActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  clearText: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '600',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: 6, paddingHorizontal: 4, flexGrow: 1 },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  footerText: { fontSize: 11, fontWeight: '500' },
  footerSub: { fontSize: 11, marginTop: 2 },
});
