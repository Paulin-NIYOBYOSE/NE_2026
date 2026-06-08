# LexiFind — Dictionary Mobile App

> **Built by:** LexiTech Solutions Ltd, Kigali City, Rwanda
> **Platform:** React Native + Expo (Android & iOS)
> **API:** [Free Dictionary API](https://api.dictionaryapi.dev/api/v2/entries/en/)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [All Implemented Features](#all-implemented-features)
3. [Project Structure](#project-structure)
4. [Architecture Overview](#architecture-overview)
5. [Diagrams](#diagrams)
6. [Tech Stack](#tech-stack)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Step 1 — navigate into the project
cd lexifind

# Step 2 — install dependencies
npm install

# Step 3 — start the Expo development server
npx expo start

# Optional: target a specific platform
npx expo start --android
npx expo start --ios
```

> Install **Expo Go** on your phone, scan the QR code displayed, and the app loads instantly. You can also press `a` for Android emulator or `i` for iOS simulator.

---

## All Implemented Features

### Activity 1 — Word Search & API Integration

| # | Feature | Implementation details |
|---|---|---|
| 1 | **Search screen UI** | `SearchScreen.tsx` — gradient header, full-width search bar, suggestion chips |
| 2 | **Input validation** | `SearchBar.tsx` — rejects empty input AND non-alphabetic characters (regex `/^[a-zA-Z\s'-]+$/`); shows inline error message below the bar |
| 3 | **Shake animation on invalid input** | `SearchBar.tsx` — `Animated.sequence` drives a 5-step horizontal shake when validation fails |
| 4 | **Dynamic API URL construction** | `dictionaryApi.ts` — URL built as `` `${BASE_URL}/${encodeURIComponent(trimmedWord)}` `` so spaces and accents are safe |
| 5 | **HTTP GET via Axios** | `dictionaryApi.ts` — dedicated Axios instance with 15 s timeout; `fetchWord()` exported and used by AppContext |
| 6 | **Loading indicator** | `LoadingSpinner.tsx` — `ActivityIndicator` inside a coloured circle, shown while `state.status === 'loading'` |
| 7 | **JSON parsing** | `dictionaryApi.ts` — response typed as `WordEntry[]`; defensive check rejects empty arrays or objects missing `word`/`meanings` |
| 8 | **Temporary result storage** | `AppContext.tsx` — entries returned from `searchWord()` are passed as React Navigation params to `WordDetailScreen`; no global result state needed |

---

### Activity 2 — Display Word Details

| # | Feature | Implementation details |
|---|---|---|
| 1 | **Extract word / phonetics / meanings / definitions** | `helpers.ts` — `extractPhoneticText()` and `extractAudioUrl()` iterate all entries & phonetics arrays |
| 2 | **Word displayed prominently** | `WordCard.tsx` — rendered in the hero gradient card at 32 px extra-bold, white on indigo |
| 3 | **Phonetic spelling** | `AudioPlayer.tsx` — phonetic text displayed in italic next to the audio button inside the hero card |
| 4 | **Part of speech badges** | `MeaningCard.tsx` — each card header shows a colour-coded pill (noun = blue, verb = green, adjective = amber, adverb = purple, …12 colours total from `colors.ts`) |
| 5 | **Definitions listed** | `MeaningCard.tsx` — bullet-pointed list, one definition per row with coloured bullet matching the POS colour |
| 6 | **Example sentences** | `MeaningCard.tsx` — displayed in a tinted quote box below each definition when `def.example` is present |
| 7 | **Multiple meanings** | `WordDetailScreen.tsx` — `entries.map(…meanings.map(…))` renders every meaning across every API entry; multiple entries get "Entry N" dividers |
| 8 | **Consistent styling & spacing** | `theme.ts` defines `Spacing`, `FontSize`, `FontWeight`, `BorderRadius`, `Shadow`; used everywhere |

---

### Activity 3 — Audio Pronunciation

| # | Feature | Implementation details |
|---|---|---|
| 1 | **Detect audio URL in response** | `helpers.ts → extractAudioUrl()` — iterates every phonetics entry looking for a non-empty `audio` field |
| 2 | **Speaker icon displayed** | `AudioPlayer.tsx` — `Ionicons volume-high-outline` shown in the hero card next to the phonetic text |
| 3 | **Load audio from URL** | `useAudio.ts → playAudio()` — calls `Audio.Sound.createAsync({ uri: url })` from Expo AV |
| 4 | **Play on tap** | `AudioPlayer.tsx` — `onPress` calls `playAudio(audioUrl)` |
| 5 | **Pause / Stop support** | `AudioPlayer.tsx` — if `status === 'playing'`, tapping the button calls `stopAudio()` which stops and unloads the sound |
| 6 | **Icon changes by state** | `AudioPlayer.tsx` — `volume-high-outline` (idle) → `hourglass-outline` (loading) → `stop-circle` (playing) → `alert-circle-outline` (error) |
| 7 | **Disabled when no audio** | `AudioPlayer.tsx` — `disabled={!audioUrl \|\| status === 'loading'}` + visual opacity reduction |
| 8 | **Prevent overlapping playback** | `useAudio.ts` — existing sound is always unloaded before a new one starts |
| 9 | **Pulse animation while playing** | `AudioPlayer.tsx` — `Animated.loop` scales the button 1→1.18→1 while `status === 'playing'` |
| 10 | **Cleanup on unmount** | `useAudio.ts` — `useEffect` return function calls `unloadAsync()` so audio stops if you navigate away |
| 11 | **Silent-mode on iOS** | `useAudio.ts` — `Audio.setAudioModeAsync({ playsInSilentModeIOS: true })` called before every playback |

---

### Activity 4 — Drawer Navigation & Search History

| # | Feature | Implementation details |
|---|---|---|
| 1 | **Drawer navigation implemented** | `AppNavigator.tsx` — `createDrawerNavigator` wraps the entire stack; swipe-to-open from left edge, slide animation |
| 2 | **History data structure** | `types/index.ts` — `SearchHistoryItem { word: string; timestamp: number }` |
| 3 | **Word added on successful search** | `AppContext.tsx` — after `fetchWord()` succeeds, `addToHistory(entries[0].word)` is awaited before dispatching success |
| 4 | **History list in drawer** | `DrawerContent.tsx` — renders `state.history` as a scrollable list of `HistoryItem` rows |
| 5 | **Tap to re-search** | `DrawerContent.tsx → handleHistoryPress()` — closes drawer, navigates to `Search` screen with `params: { word }` |
| 6 | **Auto-search from params** | `SearchScreen.tsx` — `useEffect` watching `route.params?.word` triggers `handleSearch()` automatically when the param changes |
| 7 | **WordDetail refreshed** | `SearchScreen.tsx` — after search succeeds it `navigation.navigate('WordDetail', { entries, word })` |
| 8 | **No duplicate entries** | `storage.ts → addToHistory()` — filters out any existing entry with the same word (case-insensitive) before prepending the new one |
| 9 | **AsyncStorage persistence** | `storage.ts` — `@react-native-async-storage/async-storage` with key `@lexifind:history`; survives app restarts |
| 10 | **Max 50 history items** | `storage.ts` — `[newItem, ...filtered].slice(0, 50)` |
| 11 | **Clear history with confirmation** | `DrawerContent.tsx` — `Alert.alert` with Cancel / "Clear All" (destructive) before calling `clearAllHistory()` |
| 12 | **Timestamps shown** | `HistoryItem.tsx` — `formatTimestamp()` converts epoch ms to "Just now / 5m ago / 2h ago / 3d ago" |

---

### Activity 5 — Error Handling & User Feedback

| # | Feature | Implementation details |
|---|---|---|
| 1 | **404 — word not found** | `dictionaryApi.ts` — `axiosErr.response?.status === 404` → `AppError { type: 'not_found' }` |
| 2 | **User-friendly "Word not found" message** | `ErrorView.tsx` — displays "Word Not Found" title + descriptive message + a search-outline icon |
| 3 | **Network connectivity errors** | `dictionaryApi.ts` — `!axiosErr.response \|\| axiosErr.code === 'ERR_NETWORK'` → `{ type: 'network' }` with WiFi icon |
| 4 | **Request timeout** | `dictionaryApi.ts` — `axiosErr.code === 'ECONNABORTED'` (Axios 15 s timeout) → `{ type: 'timeout' }` with clock icon |
| 5 | **Server 5xx errors** | `dictionaryApi.ts` — `status >= 500` → `{ type: 'unknown' }` |
| 6 | **Malformed / empty responses** | `dictionaryApi.ts` — checks `Array.isArray(data) && data.length > 0` and filters entries missing `word`/`meanings` |
| 7 | **Loading indicator hidden on error** | `AppContext.tsx` — `SEARCH_ERROR` dispatch sets `status: 'error'`; screens only render `LoadingSpinner` when `status === 'loading'` |
| 8 | **App crash prevention** | Every `AsyncStorage` call is wrapped in `try/catch`; audio unload errors are silently swallowed; optional chaining (`?.`) used throughout rendering |
| 9 | **Retry button** | `ErrorView.tsx` — "Try Again" button calls `onRetry()` prop; both `SearchScreen` and `WordDetailScreen` pass the correct retry handler |
| 10 | **Empty state messages** | `EmptyState.tsx` — shown on the home screen before any search, with icon, title, and subtitle |
| 11 | **Inline validation errors** | `SearchBar.tsx` (empty/invalid input) and `WordDetailScreen.tsx` inline search bar both show red error text |

---

### Additional Features (beyond the 5 activities)

| Feature | Where |
|---|---|
| **Pull-to-refresh** | Both `SearchScreen` and `WordDetailScreen` use `RefreshControl` to re-fetch the last word |
| **Suggestion chips** | `SearchScreen` shows 6 example words as tappable chips on the empty state |
| **Synonyms & antonyms** | `MeaningCard.tsx` — merged from meaning-level and definition-level fields, deduplicated, rendered as tappable `SynonymChip` components |
| **Synonym tap → new search** | `SynonymChip` calls `handleSearchAnother()` which triggers a fresh API call and updates the screen via `navigation.setParams` |
| **Inline search on WordDetail** | `WordDetailScreen.tsx` has a second search bar so users never need to go back to search another word |
| **Collapsible meaning cards** | `MeaningCard.tsx` — first card starts expanded, others collapsed; toggled with chevron |
| **Multiple API entries** | When the API returns multiple entries for a word, they are all shown with "Entry N" dividers |
| **Definition count badge** | Hero card shows total meanings and definitions as a stat strip |
| **Source URL** | Bottom of `WordDetailScreen` shows the API source URL from `sourceUrls[0]` |
| **Entry animation** | `SearchScreen` header title fades in and slides up on mount |
| **Fade animation on new word** | `WordDetailScreen` fades new content in every time `route.params` changes |
| **Consistent POS colour map** | 12 parts of speech each have a unique background + text colour pair |

---

## Project Structure

```
lexifind/
├── App.tsx                         # Root: GestureHandler + SafeArea + AppProvider + NavigationContainer
├── app.json                        # Expo config (name, slug, orientation, plugins)
├── package.json                    # Dependencies
├── babel.config.js                 # babel-preset-expo + reanimated plugin (must be last)
├── tsconfig.json                   # Extends expo/tsconfig.base, strict mode
├── README.md                       # This file
├── diagrams/                       # Mermaid diagram source files
│   ├── 01_data_flow_diagram.md
│   ├── 02_architecture.md
│   ├── 03_screen_flow.md
│   ├── 04_api_flow.md
│   ├── 05_component_hierarchy.md
│   └── 06_state_machine.md
└── src/
    ├── types/
    │   └── index.ts                # All TS interfaces: WordEntry, Meaning, Definition, AppState, NavParams
    ├── constants/
    │   ├── colors.ts               # Color palette + getPartOfSpeechColor()
    │   └── theme.ts                # Spacing, FontSize, FontWeight, BorderRadius, Shadow
    ├── services/
    │   └── dictionaryApi.ts        # Axios client, fetchWord(), normalised AppError
    ├── utils/
    │   ├── helpers.ts              # extractAudioUrl, extractPhoneticText, dedupeStrings, formatTimestamp
    │   └── storage.ts              # AsyncStorage: loadHistory, addToHistory, clearAllHistory
    ├── context/
    │   └── AppContext.tsx          # useReducer state, searchWord(), clearHistory(), useApp() hook
    ├── hooks/
    │   └── useAudio.ts             # Expo AV: playAudio, stopAudio, status, mount-safe cleanup
    ├── navigation/
    │   ├── AppNavigator.tsx        # Drawer > Stack composition
    │   └── DrawerContent.tsx       # History list, clear button, branding footer
    ├── components/
    │   ├── SearchBar.tsx           # Validated input, shake animation, clear button
    │   ├── WordCard.tsx            # Gradient hero: word + phonetic + audio stats
    │   ├── AudioPlayer.tsx         # Play/stop button with pulse animation
    │   ├── MeaningCard.tsx         # Collapsible POS card: definitions + examples + chips
    │   ├── SynonymChip.tsx         # Tappable synonym (blue) or antonym (red) badge
    │   ├── HistoryItem.tsx         # Single drawer history row with timestamp
    │   ├── LoadingSpinner.tsx      # ActivityIndicator + optional message
    │   ├── EmptyState.tsx          # Icon + title + subtitle for empty screens
    │   └── ErrorView.tsx           # Typed error card with retry button
    └── screens/
        ├── SearchScreen.tsx        # Gradient header, SearchBar, suggestion chips, pull-to-refresh
        └── WordDetailScreen.tsx    # WordCard, MeaningCards, inline search, pull-to-refresh
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                    App.tsx                       │
│  GestureHandlerRootView                          │
│    SafeAreaProvider                              │
│      AppProvider (Context + useReducer)          │
│        NavigationContainer                       │
│          AppNavigator                            │
│            DrawerNavigator ─── DrawerContent    │
│              StackNavigator                      │
│                SearchScreen                      │
│                WordDetailScreen                  │
└─────────────────────────────────────────────────┘

State layer:    AppContext  (status | currentWord | error | history)
Service layer:  dictionaryApi  (Axios → Free Dictionary API)
Storage layer:  AsyncStorage   (@lexifind:history)
Audio layer:    useAudio hook  (Expo AV)
```

---

## Diagrams

All diagrams are in `diagrams/` as Mermaid markdown files.

| File | Diagram type |
|---|---|
| `01_data_flow_diagram.md` | Level-0 and Level-1 DFD |
| `02_architecture.md` | Application layer architecture |
| `03_screen_flow.md` | Screen navigation flow |
| `04_api_flow.md` | API request/response sequence |
| `05_component_hierarchy.md` | React component tree |
| `06_state_machine.md` | AppContext state machine |

Render them at **[mermaid.live](https://mermaid.live)** — paste any file's code block content.

---

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | React Native | 0.74.5 |
| Dev platform | Expo SDK | 51 |
| Language | TypeScript | ~5.3 |
| Navigation | React Navigation v6 | Drawer + Stack |
| HTTP client | Axios | ^1.7 |
| Audio | Expo AV | ~14.0 |
| Gradients | Expo Linear Gradient | ~13.0 |
| Storage | AsyncStorage | 1.23 |
| State | Context API + useReducer | (built-in) |
| Icons | @expo/vector-icons (Ionicons) | ^14.0 |
| Gestures | react-native-gesture-handler | ~2.16 |
| Animations | react-native-reanimated | ~3.10 |
| Safe area | react-native-safe-area-context | 4.10.5 |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Metro bundler fails to start` | Delete `node_modules/` → run `npm install` → `npx expo start --clear` |
| `Reanimated plugin error` | Confirm `babel.config.js` lists `'react-native-reanimated/plugin'` as the **last** plugin, then clear the cache |
| `Audio silent on iOS device` | Ensure `expo-av` is in the `plugins` array in `app.json`. The hook already calls `playsInSilentModeIOS: true` |
| `Word not found for a valid word` | The API only accepts base/dictionary forms. Try the infinitive (e.g. "run" not "ran") |
| `History not persisting` | AsyncStorage requires a physical device or simulator; it does not work in Expo Web |
| `Drawer not opening` | Make sure `GestureHandlerRootView` is the outermost wrapper in `App.tsx` |
| `TypeScript errors after adding files` | Run `node node_modules/typescript/bin/tsc --noEmit` to see full diagnostics |

---

*LexiTech Solutions Ltd © 2025 — Powered by the Free Dictionary API*
