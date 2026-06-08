# LexiFind — Dictionary Mobile App

> **Built by:** LexiTech Solutions Ltd, Kigali City, Rwanda
> **Platform:** React Native + Expo SDK 51 (Android & iOS)
> **API:** [Free Dictionary API](https://api.dictionaryapi.dev/api/v2/entries/en/)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npx expo start
```

| Key | Action |
|-----|--------|
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator |
| `w` | Open in web browser |

Scan the QR code with **Expo Go** to run on a physical device.

> **Android emulator tip:** run `adb reverse tcp:8081 tcp:8081` once if the emulator can't reach Metro.

---

## Running on Web

```bash
npx expo start --web --clear
```

Opens at `http://localhost:8081` in your default browser.

---

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | React Native | 0.74.5 |
| Dev platform | Expo SDK | 51 |
| Language | TypeScript | ~5.3 |
| Styling | NativeWind + Tailwind CSS | 4.0.36 / ^3.4 |
| Navigation | React Navigation v6 | Drawer + Stack |
| HTTP client | Axios | ^1.7 |
| Audio | Expo AV | ~14.0 |
| Gradients | Expo Linear Gradient | ~13.0 |
| Storage | AsyncStorage | 1.23 |
| State | Context API + useReducer | built-in |
| Icons | Ionicons (@expo/vector-icons) | ^14.0 |
| Gestures | react-native-gesture-handler | ~2.16 |
| Animations | react-native-reanimated | ~3.10 |
| Safe area | react-native-safe-area-context | 4.10.5 |

---

## Designs & Diagrams

**Figma:** [LexiFind UI Design](https://www.figma.com/design/Xd2oEHbjKM5Alb67NuTkBs/LexiFind?node-id=0-1&t=8bAS6BuROP9yK9DF-1)

Mermaid diagram source files are in `diagrams/`. Render them at [mermaid.live](https://mermaid.live).

| File | Diagram |
|---|---|
| `01_data_flow_diagram.md` | Data flow diagram (DFD) |
| `02_architecture_diagram.md` | Application layer architecture |
| `03_endpoints_and_pages.md` | API endpoints & screen specification |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Metro fails to start | `npm install` → `npx expo start --clear` |
| Reanimated plugin error | `'react-native-reanimated/plugin'` must be the **last** plugin in `babel.config.js` |
| TailwindCSS CLI error | `metro.config.js` must override `cliCommand` to `'./node_modules/.bin/tailwindcss'` |
| Emulator can't connect | `adb reverse tcp:8081 tcp:8081` |
| Web bundle fails on NativeWind | `npx expo start --web --clear` — the custom resolver in `metro.config.js` handles the rest |
| Audio silent on iOS | `expo-av` must be listed in `app.json` plugins |

---

*LexiTech Solutions Ltd © 2025 — Powered by the Free Dictionary API*
