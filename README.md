# bamboo1

A personalized interactive dashboard-style web homepage integrating dynamic backgrounds, weather visualization, music playback with lyrics, and configurable UI themes.

## 🌿 Core Architecture
| Feature | Component / File | Purpose |
|---------|------------------|---------|
| Root shell / state orchestration | `App.vue` + `app.js` | Global state, time/date display, mounts feature modules |
| Settings / side panel | `homeseting.vue` | (Assumed) background & theme configuration UI |
| Typing effect | `typewriter.vue` | Animated welcome / banner text |
| Tab system | `tabs/tab2.vue`, `tabs/tab3.vue` | Background preview & music playback switching |
| Radar / profile chart | `radarChart.vue` | Visual skill or attribute chart (inferred) |
| Lyrics display | `LyricsBox.vue` | Realtime synced lyric lines from player |
| Boot / page loading | `PageLoading.vue` | Startup splash & async asset preparation |
| Weather widget | `WeatherChart.vue` | OpenWeatherMap + Chart.js + Vuetify card |
| Global config | `config.js` | Theme, background, music provider settings, meta data |
| Common utilities | `utils/common.js` | Time/date formatting, meta tag injection, console banner |
| Cookie utilities | `utils/cookieUtils.js` | Persistence of user UI preferences |

## 🔑 Central Runtime Flow (`app.js`)
1. Load optional dynamic config from `VITE_CONFIG` env
2. Preload avatar + project card images (race with 2.5s timeout)
3. Inject document meta (title / description / favicon)
4. Resolve and apply background (image or video) per device breakpoint (`useDisplay().xs`)
5. Apply theme CSS custom properties from cookie fallback chain
6. Fetch music metadata via public Meting API (JSON list)
7. Initialize dual audio system (native `<audio>` + optional APlayer) with mutual–exclusion logic
8. Launch 1s interval clock updates
9. Prepare lyric synchronization loops when APlayer is active

## 🎧 Music Subsystem
| Aspect | Implementation |
|--------|----------------|
| Data source | `https://api.i-meto.com/meting/api` (server/type/id from config) |
| Player modes | Native `<audio>` or APlayer (flag: `useAPlayer`) |
| Track control | `previousTrack`, `nextTrack`, `skipForward/Back` on APlayer |
| State sync | `playlistIndex` + periodic `syncTimer` reconciliation |
| Lyric sync | Polling APlayer `lrc.current` & DOM (`.aplayer-lrc-current`) every 500ms |
| Conflict avoidance | Pauses the other engine when one starts playing |

## ☁️ Weather Module (`WeatherChart.vue`)
- Default city: Tokyo; GPS geolocation override
- Japanese language response (`lang=ja`) for localization
- Automatic refresh every 30 minutes + manual refresh button
- 24‑hour (3h step) dual–axis line chart: temperature + humidity
- 5‑day aggregation (today vs weekday labels)
- Graceful fallback with mock data on API key failure (401)
- Collapsible card (compact vs expanded) with double‑click and button toggle

## 🎨 Theming & Background
| Source | Mechanism |
|--------|-----------|
| Cookie `bamboo1data` | Stores theme color, blur, brightness |
| Cookie `bamboo1databackground` | Stores device-specific background (mobile / desktop) |
| CSS variables | Applied to `:root` for dynamic styling |
| Video fallback | When background type is `video` instead of `pic` |

## 🧠 State Categories
| Domain | Examples |
|--------|----------|
| UI lifecycle | `isloading`, `isAppBootLoading`, `isClearScreen` |
| Media control | `isPlaying`, `playlistIndex`, `videosrc` |
| Music metadata | `musicinfo`, `lyrics`, `currentPlayTime` |
| Interaction | `tabs`, `projectcards`, `showLyricsBox` |
| Weather | Isolated inside `WeatherChart.vue` (reactive refs) |

## 🔐 Persistence Strategy
Only lightweight UI preferences are persisted (cookies); volatile data like weather and music lists are kept in memory to avoid staleness.

| Data | Persistence | Notes |
|------|-------------|-------|
| Theme & visual tuning | Cookies | Immediate rehydrate on load |
| Background choice | Cookies | Device‑aware (mobile vs desktop) |
| Music list / weather | Runtime only | Always refetched |

## 🛡 Error & Resilience Patterns
| Scenario | Current Handling | Suggested Enhancement |
|----------|------------------|-----------------------|
| Weather API 401 | Switch to mock data | UI hint for entering new key / env separation |
| Geolocation denied | Localized error text | Add retry CTA & doc link |
| Music fetch failure | Console error | User‑visible toast notification |
| Background load timeout | Silent timeout | Fallback static image |
| Lyric sync drift | Polling only | MutationObserver / event based refactor |

## 🚀 Build & Run (assumed)
```bash
npm install
npm run dev
npm run build
```

## 🧪 Potential Improvements
- Move API keys & service endpoints to environment variables (`import.meta.env`)
- TypeScript migration for safer state & API model definitions
- Introduce SWR-style caching (stale‑while‑revalidate) for music & weather
- Replace polling lyric sync with observer pattern
- Implement user settings panel for weather units / language toggle
- Graceful offline mode (cache last successful weather snapshot)

## 📊 Weather Visualization Stack
| Layer | Tool |
|-------|------|
| UI | Vuetify (`v-card`, `v-row`, chips, buttons) |
| Chart | Chart.js (line + dual y-axis) |
| Data | OpenWeatherMap REST endpoints |

## 🔄 Concurrency & Timers
| Timer | Interval | Purpose |
|-------|----------|---------|
| Clock | 1s | UI time string refresh |
| Weather auto-refresh | 30m | Keep forecast fresh |
| Lyric polling | 500ms | Update current lyric line |
| APlayer sync | 1000ms | Align `playlistIndex` with internal list |

## 🧩 Integration Notes
- APlayer & native audio must never play concurrently (guard logic in `togglePlay`, `onAPlayerPlay`, `onAPlayerPause`)
- Weather chart is recreated on expansion to ensure canvas sizing accuracy (`nextTick` + destroy/rebuild)
- Background selection respects device breakpoint early in lifecycle

## 🧾 Localization
- Weather module fully Japanese (UI + tooltips + errors)
- Core UI tab labels & error strings also localized (JP focus)
- Potential future: i18n extraction for dual‑language runtime switching

## ✅ Summary
The project functions as a modular personal dashboard blending ambient visuals (dynamic backgrounds), contextual data (weather), and entertainment (music with lyrics). `app.js` orchestrates cross‑cutting concerns (theme, time, media, lifecycle), while feature components remain relatively self‑contained. The design emphasizes responsiveness, graceful degradation, and incremental enhancement via optional APlayer integration.

---
For a Japanese description of the architecture, see `README_JP.md`.