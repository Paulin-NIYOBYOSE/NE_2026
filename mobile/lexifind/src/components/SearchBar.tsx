import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (word: string) => void;
  loading?: boolean;
  placeholder?: string;
  isDark?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  onSearch,
  loading = false,
  placeholder = 'Search for a word...',
  isDark = false,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 9, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -9, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const validate = (text: string): string => {
    const trimmed = text.trim();
    if (!trimmed) return 'Please enter a word to search.';
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return 'Please enter a valid English word.';
    return '';
  };

  const handleSearch = () => {
    const validationError = validate(value);
    if (validationError) {
      setError(validationError);
      shake();
      return;
    }
    setError('');
    onSearch(value.trim());
  };

  const borderColor = error
    ? '#E11D48'
    : focused
    ? Colors.primary
    : 'transparent';

  return (
    <View>
      <Animated.View
        style={[
          styles.container,
          { borderColor, transform: [{ translateX: shakeAnim }] },
        ]}
      >
        <Ionicons
          name="search"
          size={22}
          color={focused ? Colors.primary : 'rgba(255,255,255,0.6)'}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(t) => {
            onChangeText(t);
            if (error) setError('');
          }}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.5)"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={!loading}
        />
        {value.length > 0 && !loading && (
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              setError('');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.searchBtn, loading && styles.searchBtnLoading]}
          onPress={handleSearch}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={styles.loadingDot} />
          ) : (
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </Animated.View>

      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#FFB3C1" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    borderWidth: 1.5,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 5,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    paddingVertical: 10,
    letterSpacing: 0.1,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  searchBtnLoading: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    opacity: 0.7,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#FFB3C1',
    fontWeight: '500',
  },
});
