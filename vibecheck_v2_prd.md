# VibeCheck V2 — Production Frontend PRD
## React Native CLI · JavaScript · Lean Architecture
### Updated App Flow — Activity Discovery Platform (Not Social Media)

---

# WHAT CHANGED FROM V1

| Removed | Why |
|---------|-----|
| Friends system | Not needed — "People I Met" replaces it |
| Reels / Stories / Snaps | Content-first is NOT the goal |
| Permanent chats | Chat only exists while activity lives |
| Follow / followers | Anti-social-media by design |
| Reputation / ratings | DigiLocker trust replaces gamification |

**New additions:**
- DigiLocker verification (mandatory)
- Highlights (post-activity memories only)
- People I Met (passive, no follow/friend)
- Activity lifecycle (scheduled → active → ended → archived)

---

# CORE PHILOSOPHY

```
Activity is the product.
Content exists only because an activity happened.
Chat exists only while activity is alive.
Identity is verified, not performed.
```

---

# TABLE OF CONTENTS

1. Stack Decision
2. Folder Structure
3. Navigation Architecture
4. Screen-by-Screen: Library + Approach
5. State Management (Zustand)
6. Local Storage Strategy (MMKV + SQLite)
7. Map Architecture
8. Activity Chat — Lifecycle + Offline
9. Highlights — Upload + Feed
10. DigiLocker Verification Flow
11. Socket Architecture
12. Cache Strategy
13. Performance Rules
14. Library Master Table
15. Full User Flow (Code Level)

---

# 1. STACK DECISION

```
React Native CLI         → App shell, UI, navigation
JavaScript               → Business logic (no TypeScript overhead for MVP)
Zustand                  → Global state (simple, no boilerplate)
React Query v5           → Server state, caching, retry
Axios                    → HTTP client with interceptors
SQLite (op-sqlite)       → Offline chat + activity data
MMKV                     → Fast key-value (token, prefs, cache)
Socket.IO client         → Realtime chat + activity events
React Navigation v7      → Navigation (native stack)
Kotlin (Android)         → Map, camera, compression, background
Swift (iOS)              → Map, camera, compression, background
```

## Why NOT TypeScript for MVP?

- Faster iteration speed
- Less setup time
- Team can focus on features not type errors
- Can migrate to TS in V2 production

## Why NOT Redux Toolkit?

```
Redux:   Action → Reducer → Store → Selector → Component
Zustand: Store → Component

For VibeCheck scale: Zustand is enough.
Redux only needed at 50+ store slices.
```

---

# 2. FOLDER STRUCTURE

```
vibecheck/
│
├── android/
│   └── app/src/main/java/com/vibecheck/
│       ├── map/
│       │   ├── MapModule.kt              ← Google Maps native rendering
│       │   └── ClusteringModule.kt       ← Native pin clustering
│       ├── location/
│       │   ├── LocationModule.kt         ← Precise GPS + background
│       │   └── GeofenceModule.kt         ← Activity radius trigger
│       ├── media/
│       │   ├── CameraModule.kt           ← CameraX for highlights
│       │   ├── CompressionModule.kt      ← FFmpeg video/image compress
│       │   └── UploadService.kt          ← Background upload foreground svc
│       └── socket/
│           └── SocketOptimizer.kt        ← Native socket thread management
│
├── ios/
│   └── VibeCheck/
│       ├── MapModule.swift
│       ├── LocationModule.swift
│       ├── CameraModule.swift
│       └── CompressionModule.swift
│
└── src/
    ├── api/
    │   ├── client.js                     ← Axios + JWT interceptor + retry
    │   ├── auth.js                       ← OTP endpoints
    │   ├── activities.js                 ← CRUD activity
    │   ├── highlights.js                 ← Upload/fetch highlights
    │   ├── chat.js                       ← Chat history fetch
    │   └── verification.js              ← DigiLocker endpoints
    │
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.jsx
    │   │   ├── OTPScreen.jsx
    │   │   └── VerificationScreen.jsx
    │   ├── map/
    │   │   └── MapScreen.jsx
    │   ├── activity/
    │   │   ├── ActivityDetailScreen.jsx
    │   │   ├── CreateActivityScreen.jsx
    │   │   ├── MyActivityScreen.jsx
    │   │   └── ActivityChatScreen.jsx
    │   ├── highlights/
    │   │   ├── HighlightsFeedScreen.jsx
    │   │   ├── UploadHighlightScreen.jsx
    │   │   └── HighlightDetailScreen.jsx
    │   ├── profile/
    │   │   ├── ProfileScreen.jsx
    │   │   ├── EditProfileScreen.jsx
    │   │   ├── PeopleIMetScreen.jsx
    │   │   ├── PrivacyScreen.jsx
    │   │   └── NotificationSettingsScreen.jsx
    │   └── shared/
    │       ├── SplashScreen.jsx
    │       └── ErrorScreen.jsx
    │
    ├── components/
    │   ├── map/
    │   │   ├── ActivityPin.jsx            ← Custom pin marker
    │   │   ├── PinCluster.jsx
    │   │   └── ActivityBottomSheet.jsx    ← Tap pin → bottom sheet
    │   ├── chat/
    │   │   ├── MessageBubble.jsx
    │   │   ├── TypingIndicator.jsx
    │   │   ├── ChatInput.jsx
    │   │   └── ChatStatusBanner.jsx       ← "Chat closes in 10 min"
    │   ├── activity/
    │   │   ├── ActivityCard.jsx
    │   │   ├── ParticipantAvatars.jsx
    │   │   └── ActivityTimer.jsx          ← Countdown to start/end
    │   ├── highlights/
    │   │   ├── HighlightCard.jsx
    │   │   ├── HighlightUploader.jsx
    │   │   └── MediaPicker.jsx
    │   └── shared/
    │       ├── Avatar.jsx
    │       ├── Skeleton.jsx               ← Loading placeholders
    │       ├── BottomSheet.jsx
    │       ├── Toast.jsx
    │       └── VerifiedBadge.jsx
    │
    ├── store/
    │   ├── useAuthStore.js               ← user, token, verified status
    │   ├── useMapStore.js                ← pins, viewport, filters
    │   ├── useActivityStore.js           ← current, upcoming, past
    │   ├── useChatStore.js               ← messages, typing, online
    │   └── useHighlightStore.js          ← highlights feed
    │
    ├── db/
    │   ├── sqlite.js                     ← op-sqlite instance + init
    │   ├── schema.sql                    ← table definitions
    │   ├── chatQueries.js
    │   ├── activityQueries.js
    │   └── pendingQueries.js             ← offline upload queue
    │
    ├── socket/
    │   ├── socketClient.js               ← init + auth
    │   ├── socketEvents.js               ← event constants
    │   └── socketListeners.js            ← wire events to Zustand
    │
    ├── hooks/
    │   ├── useSocket.js
    │   ├── useLocation.js
    │   ├── useActivityLifecycle.js       ← chat open/close timer
    │   ├── useOfflineSync.js
    │   └── usePermissions.js
    │
    ├── navigation/
    │   ├── RootNavigator.jsx
    │   ├── AuthStack.jsx
    │   ├── MainStack.jsx
    │   └── TabNavigator.jsx
    │
    ├── utils/
    │   ├── mmkv.js                       ← MMKV instance (singleton)
    │   ├── cacheManager.js
    │   ├── geoUtils.js                   ← H3 sector, distance
    │   └── timeUtils.js                  ← activity countdown
    │
    └── constants/
        ├── socketEvents.js
        ├── categories.js                 ← activity categories
        └── config.js                     ← API URLs, timeouts
```

---

# 3. NAVIGATION ARCHITECTURE

## Library: `@react-navigation/native` v7 + `@react-navigation/native-stack`

```
RootNavigator
│
├── AuthStack          (no token in MMKV)
│   ├── LoginScreen
│   ├── OTPScreen
│   └── VerificationScreen   ← DigiLocker (mandatory)
│
└── MainStack          (token + verified = true)
    │
    ├── TabNavigator (Bottom Tabs)
    │   ├── Tab 1: MapScreen
    │   ├── Tab 2: HighlightsFeedScreen
    │   ├── Tab 3: CreateActivityScreen   ← center + button
    │   ├── Tab 4: MyActivityScreen
    │   └── Tab 5: ProfileScreen
    │
    └── Stack Screens (over tabs, no tab bar)
        ├── ActivityDetailScreen
        ├── ActivityChatScreen
        ├── UploadHighlightScreen
        ├── HighlightDetailScreen
        ├── EditProfileScreen
        ├── PeopleIMetScreen
        ├── PrivacyScreen
        └── NotificationSettingsScreen
```

## Key Navigation Rules

```javascript
// 1. Always native stack — hardware accelerated
import { createNativeStackNavigator }
  from '@react-navigation/native-stack';

// 2. Freeze inactive tabs — prevents background re-renders
import { enableFreeze } from 'react-native-screens';
enableFreeze(true);

// 3. Tab screens are lazy — don't mount until first visit
<Tab.Screen options={{ lazy: true }} />

// 4. Chat screen: disable swipe back (accidental exit)
<Stack.Screen
  name="ActivityChat"
  options={{ gestureEnabled: false }}
/>
```

---

# 4. SCREEN-BY-SCREEN: LIBRARY + APPROACH

---

## LOGIN SCREEN

**Goal:** Single screen, phone number + OTP. No friction.

| Task | Library | Why |
|------|---------|-----|
| Phone input | `react-native-phone-number-input` | Country code + auto-format |
| OTP input | `react-native-otp-entry` | Smooth 6-box input, paste support |
| Keyboard handling | `react-native-keyboard-controller` | Smoother than KeyboardAvoidingView |
| Form logic | `react-hook-form` + `zod` | Minimal re-renders, type-safe |
| Token storage | `react-native-mmkv` | Encrypted, synchronous |
| API | `axios` + `@tanstack/react-query` | Retry, loading, error states |
| Splash | `react-native-bootsplash` | Native splash, no white flash |

```javascript
// OTP auto-submit on 6th digit
<OtpInput
  numberOfDigits={6}
  onFilled={(code) => verifyOTP(code)}  // auto-submit
  focusOnLoad
  theme={{ pinCodeContainerStyle: styles.otpBox }}
/>
```

---

## VERIFICATION SCREEN (DigiLocker)

**Goal:** Mandatory identity check before any activity.

| Task | Library | Why |
|------|---------|-----|
| WebView for DigiLocker OAuth | `react-native-webview` | DigiLocker uses browser-based OAuth |
| Deep link callback | `react-native-linking` | Handle OAuth redirect back |
| Loading state | Custom Skeleton + Reanimated | Smooth wait UI |
| Status storage | MMKV: `is_verified: true/false` | Checked on every gate |

```javascript
// Verification gate — checked before create/join
const useVerificationGate = () => {
  const isVerified = useAuthStore(s => s.isVerified);
  const navigate = useNavigation();

  const checkAndProceed = useCallback((action) => {
    if (!isVerified) {
      navigate('VerificationScreen');
      return false;
    }
    action();
    return true;
  }, [isVerified]);

  return { checkAndProceed };
};
```

---

## MAP SCREEN

**Goal:** Core of the app. Fast pin rendering, no lag, realtime updates.

| Task | Library | Why |
|------|---------|-----|
| Map rendering | `react-native-maps` | Google Maps on Android, Apple Maps on iOS |
| Pin clustering | `react-native-map-clustering` | Native clustering, not JS math |
| Custom markers | React Native View (memoized) | Lightweight custom UI pins |
| Bottom sheet (pin tap) | `@gorhom/bottom-sheet` | Runs on UI thread via Reanimated |
| Location | `react-native-geolocation-service` | More accurate, background capable |
| Filter sheet | `@gorhom/bottom-sheet` | Same component, different snap points |
| Search in map | Custom debounced input | MMKV-cached results |
| Geo math | `geolib` | Distance, H3 sector hash |
| Animations | `react-native-reanimated` v3 | Pin appear/disappear animation |
| Activity categories filter | Zustand + local filter | No API call for filter |

### Pin Marker — Performance Critical

```javascript
// CRITICAL: tracksViewChanges={false} prevents re-render on map move
// CRITICAL: React.memo prevents re-render when other pins update

const ActivityPin = React.memo(({ activity, onPress }) => {
  return (
    <Marker
      coordinate={{
        latitude: activity.latitude,
        longitude: activity.longitude
      }}
      onPress={() => onPress(activity)}
      tracksViewChanges={false}   // ← most important perf flag
    >
      <View style={[styles.pin, { backgroundColor: getCategoryColor(activity.category) }]}>
        <Text style={styles.pinEmoji}>{getCategoryEmoji(activity.category)}</Text>
        <Text style={styles.pinCount}>{activity.participant_count}</Text>
      </View>
    </Marker>
  );
}, (prev, next) =>
  prev.activity.id === next.activity.id &&
  prev.activity.participant_count === next.activity.participant_count
);
```

### Map Data Flow

```
App opens → GPS permission check
    ↓
Get lat/lng (react-native-geolocation-service)
    ↓
Hash to H3 sector (geolib)
    ↓
MMKV cache check: geo:activities:{sector}
    ↓
HIT (< 30s) → render immediately
MISS → GET /activities/nearby?lat=&lng=&radius=5000
    ↓
Store in MMKV with 30s TTL
    ↓
Render pins (memoized markers)
    ↓
socket.join('geo:{sector_id}')
    ↓
ACTIVITY_CREATED → addPin to Zustand + invalidate cache
ACTIVITY_EXPIRED → removePin from Zustand + invalidate cache
```

---

## CREATE ACTIVITY SCREEN

**Goal:** Fast form, minimal fields, clear UX.

| Task | Library | Why |
|------|---------|-----|
| Form | `react-hook-form` | Uncontrolled, minimal re-renders |
| Validation | `zod` | Schema-based, clear error messages |
| Location picker | `react-native-maps` inline | Tap to pick location on mini map |
| Date/time picker | `@react-native-community/datetimepicker` | Native OS picker, no custom JS |
| Category selector | Custom horizontal scroll | Lightweight, no library needed |
| Submit | React Query mutation | Handles loading/error/retry |

```javascript
// Verification gate on create
const handleCreate = () => {
  checkAndProceed(() => {
    // proceed to form
  });
};
```

---

## ACTIVITY DETAIL SCREEN

**Goal:** Clear info, one big CTA (Accept & Join / Full / Expired).

| Task | Library | Why |
|------|---------|-----|
| Participant avatars | Custom + FastImage | Stack overlapping avatars |
| Map preview (location) | `react-native-maps` (static, non-interactive) | Just shows pin, no gesture |
| Join button state | React Query + Zustand | Disabled when full/expired |
| Share activity | `react-native-share` | Native share sheet |
| Countdown to start | Custom hook + `date-fns` | "Starts in 2h 30m" |

```javascript
// Activity state machine
const ACTIVITY_STATES = {
  UPCOMING:  'upcoming',   // joinable
  ACTIVE:    'active',     // chat open
  ENDED:     'ended',      // highlights available
  CANCELLED: 'cancelled',  // host cancelled
  FULL:      'full',       // participant limit reached
};

// Join button logic
const JoinButton = ({ activity }) => {
  const state = getActivityState(activity);

  if (state === 'full')      return <DisabledButton label="Activity Full" />;
  if (state === 'expired')   return <DisabledButton label="Activity Ended" />;
  if (state === 'cancelled') return <DisabledButton label="Cancelled" />;

  return <PrimaryButton label="Accept & Join" onPress={handleJoin} />;
};
```

---

## ACTIVITY CHAT SCREEN

**Goal:** Temporary chat, lifecycle-aware, offline-capable.

| Task | Library | Why |
|------|---------|-----|
| Message list | `@shopify/flash-list` | Virtualized, 60fps, inverted |
| Realtime | `socket.io-client` | WebSocket |
| Offline storage | `@op-engineering/op-sqlite` | Fastest SQLite for RN |
| Keyboard | `react-native-keyboard-controller` | Smooth keyboard tracking |
| Image messages | `@d11/react-native-fast-image` | Cached, native decode |
| Haptics on send | `react-native-haptic-feedback` | Native feel |
| Timer banner | Custom + `date-fns` | "Chat closes in 15 min" warning |
| Input | Custom TextInput | Keep it simple |

### Chat Lifecycle (Critical)

```javascript
// src/hooks/useActivityLifecycle.js

export const useActivityLifecycle = (activity) => {
  const navigation = useNavigation();

  useEffect(() => {
    const now = Date.now();
    const endsAt = new Date(activity.ends_at).getTime();
    const timeLeft = endsAt - now;

    if (timeLeft <= 0) {
      // Activity already ended — close chat
      handleChatClose();
      return;
    }

    // Show warning banner 10 min before close
    const warningTime = timeLeft - (10 * 60 * 1000);
    const warningTimer = warningTime > 0
      ? setTimeout(() => showClosingWarning(), warningTime)
      : null;

    // Auto-close chat when activity ends
    const closeTimer = setTimeout(() => {
      handleChatClose();
    }, timeLeft);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(closeTimer);
    };
  }, [activity.ends_at]);

  const handleChatClose = () => {
    // Archive messages in SQLite (read-only after this)
    archiveChatMessages(activity.id);
    // Navigate to highlights prompt
    navigation.replace('MyActivity', {
      screen: 'Past',
      prompt: 'uploadHighlight'
    });
  };
};
```

### Offline Message Queue

```javascript
// Send message — offline-first
const sendMessage = async (text) => {
  const message = {
    id: uuid.v4(),          // client-generated UUID
    activity_id: activityId,
    sender_id: myUserId,
    message: text,
    created_at: Date.now(),
    is_pending: true,
  };

  // 1. Add to UI immediately (Zustand)
  useChatStore.getState().addMessage(activityId, message);

  // 2. Insert to SQLite as pending
  insertMessage(message);

  // 3. Emit via socket
  const socket = getSocket();
  socket.emit('ACTIVITY_MESSAGE', message, (ack) => {
    if (ack?.success) {
      // Server confirmed — mark as sent
      markMessageSent(message.id);
      useChatStore.getState().updateMessageStatus(message.id, 'sent');
    }
  });
};
```

---

## MY ACTIVITY SCREEN

**Goal:** 3 tabs — Current / Upcoming / Past. Simple list views.

| Task | Library | Why |
|------|---------|-----|
| Tab UI | `react-native-tab-view` | Swipeable tabs, lazy rendered |
| Activity list | `@shopify/flash-list` | Fast list |
| Countdown | Custom timer hook | "Starts in 2h" |
| Pull to refresh | React Query refetch | Built-in |

---

## HIGHLIGHTS SCREEN

**Goal:** Post-activity media feed. NOT social media — activity-anchored content only.

| Task | Library | Why |
|------|---------|-----|
| Feed list | `@shopify/flash-list` | Virtualized cards |
| Images | `@d11/react-native-fast-image` | Cached, fast |
| Video playback | `react-native-video` | Simple playback (not reel-style) |
| Upload picker | `react-native-image-picker` | Native gallery/camera |
| Upload progress | React Query mutation + progress | Show % progress |
| Compression (before upload) | `react-native-image-resizer` | Reduce image size before send |
| Video compression | FFmpegKit (native) | Compress before upload |
| Like | React Query mutation + optimistic | Instant UI update |
| Comments | `@gorhom/bottom-sheet` + FlashList | Sheet slides up |
| Share | `react-native-share` | Native share sheet |

### Highlight Upload Flow

```javascript
// src/components/highlights/HighlightUploader.jsx

const uploadHighlight = async (mediaUri, caption, activityId) => {
  // 1. Compress media first (native module)
  const compressed = await compressMedia(mediaUri);

  // 2. Insert into pending_uploads SQLite table
  const pendingId = insertPendingUpload({
    type: 'highlight',
    local_uri: compressed.uri,
    metadata: JSON.stringify({ caption, activityId }),
  });

  // 3. Upload with progress
  const formData = new FormData();
  formData.append('file', {
    uri: compressed.uri,
    type: compressed.type,
    name: compressed.name,
  });
  formData.append('caption', caption);
  formData.append('activity_id', activityId);

  try {
    await api.post('/highlights', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        setProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    // Remove from pending queue
    deletePendingUpload(pendingId);
  } catch (err) {
    // Stays in pending — retry on next open
    console.error('Upload failed, queued for retry');
  }
};
```

---

## PROFILE SCREEN

**Goal:** Identity-first (not follower-first). Stats = activities, not followers.

| Task | Library | Why |
|------|---------|-----|
| Profile photo | `@d11/react-native-fast-image` | Cached |
| Stats display | Custom (3 numbers) | No library needed |
| Menu list | `@shopify/flash-list` | Smooth settings list |
| Edit form | `react-hook-form` | Minimal re-renders |
| Image picker | `react-native-image-picker` | Native picker |
| Verified badge | Custom SVG component | DigiLocker tick |

---

## PEOPLE I MET SCREEN

**Goal:** Passive record of activity co-participants. No social actions.

| Task | Library | Why |
|------|---------|-----|
| List | `@shopify/flash-list` | Standard list |
| Avatars | `@d11/react-native-fast-image` | Cached |
| Data source | SQLite (local) + API sync | Offline readable |

```javascript
// No follow, no chat, no friend request
// Just: name, activities together, last met date
// This is a memory, not a social graph
```

---

# 5. STATE MANAGEMENT (ZUSTAND)

## Store Structure

```javascript
// src/store/useAuthStore.js
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isVerified: false,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    mmkv.set('jwt_token', token);
    set({ token });
  },
  setVerified: (val) => {
    mmkv.set('is_verified', val ? 'true' : 'false');
    set({ isVerified: val });
  },
  reset: () => {
    mmkv.clearAll();
    set({ user: null, token: null, isVerified: false });
  },
}));

// src/store/useMapStore.js
export const useMapStore = create((set, get) => ({
  activities: [],          // visible pins on map
  filters: {
    category: null,
    radius: 5000,
    dateRange: null,
  },
  viewport: null,          // current map region

  addActivity: (activity) => set(s => ({
    activities: [...s.activities, activity]
  })),
  removeActivity: (id) => set(s => ({
    activities: s.activities.filter(a => a.id !== id)
  })),
  setFilter: (key, val) => set(s => ({
    filters: { ...s.filters, [key]: val }
  })),
}));

// src/store/useChatStore.js
export const useChatStore = create(
  subscribeWithSelector((set, get) => ({
    // Keyed by activity_id
    rooms: {},
    typing: {},

    addMessage: (activityId, message) => set(s => ({
      rooms: {
        ...s.rooms,
        [activityId]: {
          ...s.rooms[activityId],
          messages: [
            ...(s.rooms[activityId]?.messages || []),
            message
          ]
        }
      }
    })),

    removeRoom: (activityId) => set(s => {
      const next = { ...s.rooms };
      delete next[activityId];
      return { rooms: next };
    }),

    setTyping: (activityId, userId, isTyping) => set(s => ({
      typing: {
        ...s.typing,
        [`${activityId}:${userId}`]: isTyping
      }
    })),
  }))
);

// src/store/useActivityStore.js
export const useActivityStore = create((set) => ({
  current: null,     // one active activity at a time
  upcoming: [],
  past: [],

  setCurrent: (activity) => set({ current: activity }),
  addPast: (activity) => set(s => ({
    past: [activity, ...s.past]
  })),
}));
```

---

# 6. LOCAL STORAGE STRATEGY

## Decision Table

| Data | MMKV | SQLite | Why |
|------|------|--------|-----|
| JWT token | ✅ | ❌ | Fast sync read on every request |
| is_verified | ✅ | ❌ | Checked on every gate |
| User preferences | ✅ | ❌ | Simple key-value |
| Nearby activity cache | ✅ JSON | ❌ | 30s TTL, fast read |
| Chat messages | ❌ | ✅ | Queryable, paginated, offline |
| Pending uploads | ❌ | ✅ | Retry queue needs query |
| People I met | ❌ | ✅ | Relational, searchable |
| Notification history | ❌ | ✅ | Needs pagination |
| Activity archive | ❌ | ✅ | Completed activities reference |

**Rule: Key-value = MMKV. Anything that needs a query = SQLite.**

## SQLite Schema

```sql
-- Activity chat messages
CREATE TABLE IF NOT EXISTS activity_messages (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT,
  sender_photo TEXT,
  message TEXT,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  is_pending INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_activity_messages
  ON activity_messages(activity_id, created_at DESC);

-- Cached activities (map + my activity list)
CREATE TABLE IF NOT EXISTS cached_activities (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  status TEXT,
  cached_at INTEGER,
  expires_at INTEGER
);

-- People I Met
CREATE TABLE IF NOT EXISTS people_met (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  photo TEXT,
  last_met INTEGER,
  activities_together INTEGER DEFAULT 1,
  UNIQUE(user_id)
);

-- Pending uploads (retry queue)
CREATE TABLE IF NOT EXISTS pending_uploads (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  local_uri TEXT NOT NULL,
  metadata TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Notification history
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT,
  body TEXT,
  is_read INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
```

## MMKV Instance (Singleton)

```javascript
// src/utils/mmkv.js
import { MMKV } from 'react-native-mmkv';

export const mmkv = new MMKV({
  id: 'vibecheck-storage',
  encryptionKey: 'vc-secret-key'  // encrypted storage
});
```

---

# 7. MAP ARCHITECTURE (DETAIL)

## Filter Logic (No extra API call)

```javascript
// Filters applied locally on cached data — no API call on filter change
const useFilteredActivities = () => {
  const { activities, filters } = useMapStore();

  return useMemo(() => {
    return activities.filter(a => {
      if (filters.category && a.category !== filters.category) return false;
      if (filters.radius) {
        const dist = getDistance(
          { latitude: myLat, longitude: myLng },
          { latitude: a.latitude, longitude: a.longitude }
        );
        if (dist > filters.radius) return false;
      }
      return true;
    });
  }, [activities, filters]);
};
```

## Location Update Strategy (Battery-conscious)

```javascript
// NOT continuous tracking — only on significant movement
// This also prevents stalking behavior

const useLocation = () => {
  useEffect(() => {
    // Watch with 200m minimum displacement
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newSector = getH3Sector(latitude, longitude);
        const prevSector = useMapStore.getState().currentSector;

        // Only re-fetch if user moved to a different sector
        if (newSector !== prevSector) {
          useMapStore.getState().setCurrentSector(newSector);
          refetchNearbyActivities({ latitude, longitude });
        }
      },
      (error) => console.error(error),
      {
        distanceFilter: 200,     // only trigger on 200m+ movement
        interval: 10000,         // check every 10s
        fastestInterval: 5000,
        accuracy: { android: 'balanced', ios: 'hundredMeters' }
      }
    );
    return () => Geolocation.clearWatch(watchId);
  }, []);
};
```

---

# 8. ACTIVITY CHAT — LIFECYCLE + OFFLINE

## Chat State Machine

```
ACTIVITY CREATED
    ↓
UPCOMING: Chat not available
    ↓
ACTIVITY STARTS (at start_time)
    ↓ [socket: ACTIVITY_STARTED]
ACTIVE: Chat opens automatically
    ↓
Chat warning at -10 min (banner in UI)
    ↓
ACTIVITY ENDS (at end_time)
    ↓ [socket: ACTIVITY_ENDED]
Chat closes — archived to SQLite (read-only)
    ↓
Prompt: "Upload Highlights"
    ↓
PAST: Chat readable, not writable
```

## Offline Sync Hook

```javascript
// src/hooks/useOfflineSync.js
// Runs on socket reconnect and app foreground

export const useOfflineSync = () => {
  const socket = getSocket();

  useEffect(() => {
    const handleReconnect = async () => {
      const pending = getPendingMessages();
      for (const msg of pending) {
        socket.emit('ACTIVITY_MESSAGE', msg, (ack) => {
          if (ack?.success) markMessageSent(msg.id);
        });
        // Small delay to avoid flooding
        await sleep(100);
      }
    };

    socket.on('connect', handleReconnect);
    return () => socket.off('connect', handleReconnect);
  }, []);
};
```

---

# 9. SOCKET ARCHITECTURE

## Events Reference

```javascript
// src/constants/socketEvents.js

export const SOCKET_EVENTS = {
  // Activity lifecycle
  ACTIVITY_CREATED:   'ACTIVITY_CREATED',
  ACTIVITY_STARTED:   'ACTIVITY_STARTED',
  ACTIVITY_ENDED:     'ACTIVITY_ENDED',
  ACTIVITY_CANCELLED: 'ACTIVITY_CANCELLED',
  ACTIVITY_FULL:      'ACTIVITY_FULL',
  PARTICIPANT_JOINED: 'PARTICIPANT_JOINED',
  PARTICIPANT_LEFT:   'PARTICIPANT_LEFT',

  // Chat
  ACTIVITY_MESSAGE:   'ACTIVITY_MESSAGE',
  TYPING_START:       'TYPING_START',
  TYPING_STOP:        'TYPING_STOP',
  READ_RECEIPT:       'READ_RECEIPT',

  // Highlights
  HIGHLIGHT_POSTED:   'HIGHLIGHT_POSTED',

  // Notifications
  NOTIFICATION_PUSH:  'NOTIFICATION_PUSH',

  // System
  HEARTBEAT:          'HEARTBEAT',
};
```

## Socket Listeners → Zustand

```javascript
// src/socket/socketListeners.js

export const initSocketListeners = (socket) => {

  // ─── MAP / ACTIVITY EVENTS ────────────────────────────
  socket.on(SOCKET_EVENTS.ACTIVITY_CREATED, (activity) => {
    useMapStore.getState().addActivity(activity);
    mmkv.delete(`geo:activities:${activity.sector_id}`);
  });

  socket.on(SOCKET_EVENTS.ACTIVITY_CANCELLED, ({ activity_id }) => {
    useMapStore.getState().removeActivity(activity_id);
    // Show toast if user was a participant
    const current = useActivityStore.getState().current;
    if (current?.id === activity_id) {
      showToast('Activity cancelled by host');
      useActivityStore.getState().setCurrent(null);
    }
  });

  socket.on(SOCKET_EVENTS.ACTIVITY_STARTED, ({ activity_id }) => {
    useActivityStore.getState().setActivityStarted(activity_id);
    // Chat room opens automatically for participants
  });

  socket.on(SOCKET_EVENTS.ACTIVITY_ENDED, ({ activity_id }) => {
    useActivityStore.getState().setActivityEnded(activity_id);
    useChatStore.getState().archiveRoom(activity_id);
  });

  socket.on(SOCKET_EVENTS.PARTICIPANT_JOINED, ({ activity_id, user, count }) => {
    useMapStore.getState().updateParticipantCount(activity_id, count);
  });

  // ─── CHAT EVENTS ──────────────────────────────────────
  socket.on(SOCKET_EVENTS.ACTIVITY_MESSAGE, (message) => {
    useChatStore.getState().addMessage(message.activity_id, message);
    insertMessage({ ...message, is_pending: 0 });
  });

  socket.on(SOCKET_EVENTS.TYPING_START, ({ activity_id, user_id }) => {
    useChatStore.getState().setTyping(activity_id, user_id, true);
    setTimeout(() => {
      useChatStore.getState().setTyping(activity_id, user_id, false);
    }, 3000);
  });

  // ─── HIGHLIGHTS ───────────────────────────────────────
  socket.on(SOCKET_EVENTS.HIGHLIGHT_POSTED, (highlight) => {
    useHighlightStore.getState().prependHighlight(highlight);
  });

  // ─── NOTIFICATIONS ────────────────────────────────────
  socket.on(SOCKET_EVENTS.NOTIFICATION_PUSH, (notif) => {
    insertNotification(notif);
    showToast(notif.title);
  });
};
```

---

# 10. CACHE STRATEGY — COMPLETE

| Data | Storage | TTL | Cleared when |
|------|---------|-----|-------------|
| JWT token | MMKV | Permanent | Logout |
| is_verified | MMKV | Permanent | Re-verification |
| Nearby activities (map) | MMKV JSON | 30 seconds | ACTIVITY_CREATED / ENDED socket |
| Current user profile | MMKV | 30 minutes | Profile update |
| Activity detail | MMKV JSON | 5 minutes | Manual refetch |
| Search results | MMKV JSON | 60 seconds | Auto-expire |
| Chat messages (active) | Zustand | Session | Activity ends |
| Chat messages (archived) | SQLite | 7 days | Auto-purge |
| Pending uploads | SQLite | Until sent | On success |
| People I Met | SQLite | Permanent | Logout |
| Notification history | SQLite | 7 days | Auto-purge |
| Profile images | FastImage disk | 30 days | Profile update |
| Activity images | FastImage disk | 7 days | Auto (LRU) |

## Cache Clear Functions

```javascript
// src/utils/cacheManager.js

// Called when activity ends (socket event)
export const clearActivityCache = (activityId, sectorId) => {
  useChatStore.getState().archiveRoom(activityId);
  mmkv.delete(`geo:activities:${sectorId}`);
  mmkv.delete(`activity:${activityId}`);
};

// Called on logout
export const clearOnLogout = () => {
  mmkv.clearAll();
  db.execute(`DELETE FROM activity_messages WHERE is_archived = 0`);
  db.execute(`DELETE FROM notifications`);
  FastImage.clearDiskCache();
  FastImage.clearMemoryCache();
  useAuthStore.getState().reset();
  useMapStore.getState().reset();
  useChatStore.getState().reset();
  useActivityStore.getState().reset();
  useHighlightStore.getState().reset();
};

// Called on app open (cleanup)
export const runStartupCleanup = () => {
  const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
  db.execute(`DELETE FROM notifications WHERE created_at < ?`, [cutoff]);
  db.execute(`DELETE FROM activity_messages
    WHERE is_archived = 1 AND created_at < ?`, [cutoff]);
};
```

---

# 11. PERFORMANCE RULES

## Render Budget

```
Target: 60fps (16ms per frame)
Stretch: 90fps on capable devices (9ms per frame)

JS Thread budget:    < 8ms per frame
UI Thread budget:    < 8ms per frame (Reanimated animations)
Native Thread:       unlimited (video, map, camera, compression)
```

## Rules

```
❌ NEVER on JS thread:
   - Map clustering calculations
   - Video/image compression
   - Camera frame processing
   - GPS background polling
   - Heavy list virtualization (FlashList handles this)

❌ NEVER use:
   - AsyncStorage (synchronous-blocking)
   - Animated API from React Native (use Reanimated)
   - FlatList for large lists (use FlashList)
   - inline styles in list items (new object every render)
   - anonymous functions as props in list renderItem

✅ ALWAYS:
   - React.memo for list items
   - tracksViewChanges={false} on map markers
   - InteractionManager.runAfterInteractions for heavy load
   - useCallback for event handlers passed as props
   - useMemo for expensive computations
   - keyExtractor returns stable string IDs
```

## InteractionManager Pattern

```javascript
// Never load heavy data during screen transition
useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    loadChatHistory();  // runs AFTER screen animation completes
  });
  return () => task.cancel();
}, []);
```

---

# 12. LIBRARY MASTER TABLE

## Final Production Library List

| Category | Library | Version | Purpose | Why This One |
|----------|---------|---------|---------|-------------|
| **Navigation** | `@react-navigation/native` | v7 | Core router | Industry standard |
| | `@react-navigation/native-stack` | v7 | Stack navigation | Hardware-accelerated |
| | `@react-navigation/bottom-tabs` | v7 | Tab bar | Native tabs |
| | `react-native-screens` | latest | Native screen containers | enableFreeze support |
| | `react-native-safe-area-context` | latest | Safe areas | Required by RN Nav |
| **State** | `zustand` | v4 | Global state | Simple, no boilerplate |
| | `@tanstack/react-query` | v5 | Server state + cache | Retry, refetch, loading |
| **Storage** | `react-native-mmkv` | v2 | Fast key-value | 10x faster than AsyncStorage, encrypted |
| | `@op-engineering/op-sqlite` | latest | SQLite | Fastest SQLite binding for RN |
| **Networking** | `axios` | v1 | HTTP client | Interceptors, retry |
| | `socket.io-client` | v4 | WebSocket | Matches backend |
| **Animation** | `react-native-reanimated` | v3 | Animations | Runs on UI thread |
| | `react-native-gesture-handler` | v2 | Gestures | Native recognizer |
| **Lists** | `@shopify/flash-list` | v1 | All lists | Recycled cells, 60fps |
| **Images** | `@d11/react-native-fast-image` | v8 | Image rendering | Native cache, fast decode |
| **Map** | `react-native-maps` | latest | Map rendering | Google/Apple Maps bridge |
| | `react-native-map-clustering` | latest | Pin clustering | Native clustering, not JS |
| | `react-native-geolocation-service` | latest | GPS | More accurate than Expo |
| | `geolib` | v3 | Geo math | Distance, H3 sector |
| **Bottom Sheet** | `@gorhom/bottom-sheet` | v4 | All sheets | UI thread, Reanimated-based |
| **Keyboard** | `react-native-keyboard-controller` | latest | Keyboard UX | Smoother than RN built-in |
| **Forms** | `react-hook-form` | v7 | Forms | Uncontrolled, minimal renders |
| | `zod` | v3 | Validation | Schema-based, clear errors |
| **Auth** | `react-native-otp-entry` | latest | OTP input | Smooth, paste support |
| | `react-native-phone-number-input` | latest | Phone input | Country code, format |
| | `react-native-webview` | latest | DigiLocker OAuth | Browser-based OAuth |
| **Media** | `react-native-image-picker` | latest | Gallery/camera pick | Native picker |
| | `react-native-image-resizer` | latest | Image compress | Before upload |
| | `ffmpeg-kit-react-native` | latest | Video compress | Hardware compress |
| | `react-native-video` | v6 | Highlight playback | Standard video player |
| **Tabs** | `react-native-tab-view` | v3 | My Activity tabs | Swipeable, lazy |
| **Notifications** | `@react-native-firebase/messaging` | v18 | FCM push | Official Firebase |
| | `react-native-push-notification` | latest | Local notifications | Activity reminders |
| **Haptics** | `react-native-haptic-feedback` | latest | Tactile feedback | Native feel |
| **Permissions** | `react-native-permissions` | v4 | All permissions | Unified API |
| **File System** | `react-native-fs` | latest | File access | Upload + cleanup |
| **Splash** | `react-native-bootsplash` | latest | Splash screen | No white flash |
| **Date/Time** | `@react-native-community/datetimepicker` | latest | Date picker | Native OS picker |
| | `date-fns` | v3 | Date formatting | Lightweight, tree-shakeable |
| **Share** | `react-native-share` | latest | Share sheet | Native share |
| **UUID** | `react-native-uuid` | latest | Client IDs | Offline message IDs |
| **Utilities** | `lodash` (debounce only) | v4 | Debounce search | Just import debounce |

---

# 13. FULL USER FLOW (CODE LEVEL)

```
1. APP LAUNCH
   react-native-bootsplash → native splash
   Check MMKV: jwt_token exists?
   Check MMKV: is_verified = 'true'?
   → Both: navigate to MainStack (TabNavigator)
   → Token only (not verified): navigate to VerificationScreen
   → Neither: navigate to AuthStack

2. LOGIN
   Enter phone → react-native-phone-number-input
   POST /auth/otp → OTP sent (rate limited by Redis on server)
   react-native-otp-entry → auto-submit on 6 digits
   POST /auth/verify → JWT received
   MMKV.set('jwt_token', jwt)
   New user? → VerificationScreen
   Existing verified user? → MapScreen

3. VERIFICATION
   WebView opens DigiLocker OAuth URL
   User completes DigiLocker flow
   Deep link callback: vibecheck://verify?status=success
   POST /auth/verify-digilocker
   MMKV.set('is_verified', 'true')
   useAuthStore.setVerified(true)
   Navigate → MapScreen

4. MAP (Main loop)
   useLocation() → GPS (react-native-geolocation-service)
   H3 sector from lat/lng (geolib)
   MMKV cache check (30s TTL)
   HIT → render pins from cache
   MISS → GET /activities/nearby → cache → render
   socket.join('geo:{sector_id}')
   Realtime pin updates via ACTIVITY_CREATED/ENDED events

5. JOIN ACTIVITY
   Tap pin → @gorhom/bottom-sheet
   View ActivityDetailScreen
   checkVerificationGate() → verified? proceed : show gate
   Already in active activity? → show error toast
   Activity full? → button disabled
   POST /activities/:id/join
   useActivityStore.setCurrent(activity)
   socket.join('activity:{activity_id}')
   Wait for ACTIVITY_STARTED event

6. ACTIVITY CHAT
   ACTIVITY_STARTED socket event
   Chat unlocks automatically
   FlashList inverted message list
   Offline-first: SQLite pending → socket → ACK → synced
   Typing: debounced TYPING_START/STOP
   Timer banner: "Chat closes in X min" (useActivityLifecycle)
   ACTIVITY_ENDED socket event
   Chat archived to SQLite
   Navigate to highlight prompt

7. HIGHLIGHTS
   Upload: react-native-image-picker
   Compress: react-native-image-resizer / FFmpegKit
   Pending upload → SQLite queue
   POST /highlights (with progress)
   On fail → stays in pending queue → retry on next open
   Feed: FlashList of HighlightCards
   Like: optimistic update (React Query mutation)
   Comment: @gorhom/bottom-sheet

8. PROFILE
   Load from MMKV cache (30min TTL)
   Stats: activities joined, hosted, highlights shared
   Edit: react-hook-form + zod validation
   Photo: react-native-image-picker → compress → upload

9. LOGOUT
   socket.disconnect()
   clearOnLogout():
     mmkv.clearAll()
     SQLite: clear messages, notifications
     FastImage: clearDiskCache + clearMemoryCache
     Reset all Zustand stores
   Navigate to AuthStack → LoginScreen
```

---

# ARCHITECTURE SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│                    VIBECHECK FRONTEND                       │
├─────────────────┬───────────────────┬───────────────────────┤
│   React Native  │     Zustand       │   SQLite (op-sqlite)  │
│   Screens / UI  │   In-memory state │   Offline data store  │
├─────────────────┼───────────────────┼───────────────────────┤
│   Navigation    │     MMKV          │   Pending uploads     │
│   React Nav v7  │  Fast key-value   │   Chat archive        │
│   Native Stack  │  Token, prefs,    │   People I Met        │
│   enableFreeze  │  geo cache        │   Notifications       │
├─────────────────┼───────────────────┼───────────────────────┤
│   FlashList     │  React Query      │   Socket.IO           │
│   All lists     │  Server state     │   Realtime events     │
│   60fps         │  Retry / cache    │   Activity lifecycle  │
├─────────────────┼───────────────────┼───────────────────────┤
│   NATIVE (Kotlin / Swift)           │   FastImage           │
│   Maps, clustering, GPS             │   All images          │
│   Camera, FFmpeg compression        │   Disk cache 30 days  │
│   Background upload service         │                       │
└─────────────────────────────────────┴───────────────────────┘

CORE RULE:
"If it's heavy → native thread.
 If it's state → Zustand.
 If it needs a query → SQLite.
 If it's fast key-value → MMKV.
 If it's server state → React Query.
 Never use AsyncStorage."
```

---

*VibeCheck V2 Frontend PRD — Updated App Flow*
*React Native CLI · JavaScript · Activity-First · Not Social Media*
*Production ready for 10M+ users*
