import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { DrawerParamList } from '../types';
import { Colors } from '../constants/colors';

type Nav = DrawerNavigationProp<DrawerParamList, 'Settings'>;

interface Props {
  navigation: Nav;
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
  { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme, isDark, setTheme, soundEnabled, setSoundEnabled } = useTheme();
  const { state, clearHistory } = useApp();

  const bg = isDark ? '#0F0E17' : '#F5F6FF';
  const cardBg = isDark ? '#1E1B2E' : '#FFFFFF';
  const cardBorder = isDark ? '#2E2B44' : '#E4E6F1';
  const textPrimary = isDark ? '#F5F5FF' : '#1A1D2E';
  const textSecondary = isDark ? '#B4B4CC' : '#4B5066';
  const textMuted = isDark ? '#6B6B8A' : '#9498B0';
  const sectionLabel = isDark ? '#6B6B8A' : '#9498B0';

  const handleClearHistory = () => {
    if (state.history.length === 0) {
      Alert.alert('No History', 'Your search history is already empty.');
      return;
    }
    Alert.alert(
      'Clear History',
      `Remove all ${state.history.length} searched word${state.history.length !== 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ],
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.decorCircle} />
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MainStack')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>Appearance & Preferences</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: sectionLabel }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {THEME_OPTIONS.map((opt, i) => {
            const active = theme === opt.mode;
            return (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  styles.themeRow,
                  i < THEME_OPTIONS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: cardBorder,
                  },
                ]}
                onPress={() => setTheme(opt.mode)}
                activeOpacity={0.7}
              >
                <View style={[styles.themeIcon, { backgroundColor: active ? Colors.primaryLight : (isDark ? '#272438' : '#F5F6FF') }]}>
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={active ? Colors.primary : textMuted}
                  />
                </View>
                <Text style={[styles.themeLabel, { color: active ? Colors.primary : textPrimary }]}>
                  {opt.label}
                </Text>
                <View style={[styles.radio, { borderColor: active ? Colors.primary : cardBorder }]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionLabel, { color: sectionLabel }]}>PREFERENCES</Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.themeIcon, { backgroundColor: isDark ? '#272438' : '#F5F6FF' }]}>
                <Ionicons name="volume-high-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: textPrimary }]}>Sound Effects</Text>
                <Text style={[styles.rowSub, { color: textSecondary }]}>Audio pronunciation playback</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: isDark ? '#2E2B44' : '#E4E6F1', true: Colors.primaryLight }}
              thumbColor={soundEnabled ? Colors.primary : (isDark ? '#6B6B8A' : '#9498B0')}
            />
          </View>
        </View>

        {/* Data */}
        <Text style={[styles.sectionLabel, { color: sectionLabel }]}>DATA</Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <TouchableOpacity style={styles.dataRow} onPress={handleClearHistory} activeOpacity={0.7}>
            <View style={[styles.themeIcon, { backgroundColor: '#FFF1F2' }]}>
              <Ionicons name="trash-outline" size={20} color="#E11D48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: '#E11D48' }]}>Clear Search History</Text>
              <Text style={[styles.rowSub, { color: textSecondary }]}>
                {state.history.length} word{state.history.length !== 1 ? 's' : ''} stored
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={textMuted} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, { color: sectionLabel }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.aboutHeader}>
            <View style={styles.aboutIconWrap}>
              <Ionicons name="book" size={30} color={Colors.primary} />
            </View>
            <View>
              <Text style={[styles.aboutName, { color: textPrimary }]}>LexiFind</Text>
              <Text style={[styles.aboutVersion, { color: textMuted }]}>Version 1.0.0</Text>
            </View>
          </View>
          <View style={[styles.aboutDivider, { backgroundColor: cardBorder }]} />
          <Text style={[styles.aboutDesc, { color: textSecondary }]}>
            A modern, production-ready dictionary app built with React Native and Expo. Look up
            definitions, hear pronunciations, and explore word meanings anywhere, anytime.
          </Text>
          <View style={[styles.aboutDivider, { backgroundColor: cardBorder }]} />
          {[
            { icon: 'globe-outline' as const, label: 'Powered by', value: 'Free Dictionary API' },
            { icon: 'code-slash-outline' as const, label: 'Built with', value: 'React Native + Expo SDK 51' },
            { icon: 'business-outline' as const, label: 'Developer', value: 'LexiTech Solutions Ltd' },
          ].map((item) => (
            <View key={item.label} style={styles.aboutRow}>
              <Ionicons name={item.icon} size={16} color={textMuted} />
              <Text style={[styles.aboutRowLabel, { color: textMuted }]}>{item.label}</Text>
              <Text style={[styles.aboutRowValue, { color: textSecondary }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -40,
    right: -40,
  },
  backBtn: { marginBottom: 12 },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    marginBottom: 10,
    marginLeft: 4,
    marginTop: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  themeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  toggleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12, marginTop: 2 },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
  },
  aboutIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  aboutVersion: {
    fontSize: 12,
    marginTop: 2,
  },
  aboutDivider: { height: 1, marginHorizontal: 16 },
  aboutDesc: {
    fontSize: 14,
    lineHeight: 22,
    padding: 18,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  aboutRowLabel: { fontSize: 13, width: 90 },
  aboutRowValue: { fontSize: 13, fontWeight: '500', flex: 1 },
});
