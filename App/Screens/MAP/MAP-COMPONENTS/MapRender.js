import React, {useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle} from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {
  initTileDB,
  downloadTilePack,
  downloadTile,
  injectTileCacheIntoWebView,
} from '../../../../SQLite/Map';

// ── Tile Download Queue (priority-sorted by zoom, higher zoom = higher priority) ─
// FIX P3: MAX_CONCURRENT 2→4, priority sort, dedup via pendingKeys
const downloadQueue = [];
let activeDownloads = 0;
const MAX_CONCURRENT = 4; // FIX P3: was 2 — 4 parallel downloads, still safe
const pendingKeys = new Set();

const processDownloadQueue = () => {
  if (activeDownloads >= MAX_CONCURRENT || downloadQueue.length === 0) return;
  
  // FIX P3: priority sort — download higher zoom tiles first (user sees zoom 14+ most)
  downloadQueue.sort((a, b) => b.z - a.z);
  
  const item = downloadQueue.shift();
  activeDownloads++;
  pendingKeys.delete(`${item.z}-${item.x}-${item.y}`);
  
  downloadTile(item.z, item.x, item.y)
    .then(localPath => {
      if (localPath && item.webViewRef.current) {
        item.webViewRef.current.injectJavaScript(
          `window.injectTileCache({"${item.z}-${item.x}-${item.y}": "file://${localPath}"}); true;`
        );
      }
    })
    .catch(() => {})
    .finally(() => {
      activeDownloads--;
      processDownloadQueue();
    });
};

// Dummy data for pins — brand colors match the new design system
export const DUMMY_PINS = [
  {
    id: '1',
    lat: 28.4105,
    lng: 77.3125,
    title: 'Football Match',
    people: '12 people',
    dist: '0.4 km',
    icon: 'sports_soccer',
    color: '#1A5C2E',   // deep forest green
    gradient: 'linear-gradient(135deg, rgba(26,92,46,0.95), rgba(13,46,23,0.95))',
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop',
    ],
    durationMins: 93,
    hostName: 'Rahul Singh',
    locationName: 'Sector 15 Ground, Faridabad',
    dateStr: 'Today, 5:00 PM',
    description: 'Friendly football match — all skill levels welcome! Bring your boots and some water.',
    tags: ['Sports', 'Outdoor'],
    isHost: true,
  },
  {
    id: '2',
    lat: 28.4025,
    lng: 77.3205,
    title: 'Cafe Meetup',
    people: '6 people',
    dist: '0.6 km',
    icon: 'local_cafe',
    color: '#6B3D1E',   // rich espresso brown
    gradient: 'linear-gradient(135deg, rgba(107,61,30,0.95), rgba(53,30,15,0.95))',
    avatars: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&fit=crop',
    ],
    durationMins: 55,
    hostName: 'Priya Mehta',
    locationName: 'Brew & Chill Cafe, Faridabad',
    dateStr: 'Today, 4:30 PM',
    description: 'Casual coffee chat for people who enjoy good conversations and great espresso. Remote-workers & freelancers especially welcome!',
    tags: ['Social', 'Chill'],
  },
  {
    id: '3',
    lat: 28.4150,
    lng: 77.3255,
    title: 'Live Music',
    people: '15 people',
    dist: '0.3 km',
    icon: 'music_note',
    color: '#4A1D6E',   // deep purple-violet
    gradient: 'linear-gradient(135deg, rgba(74,29,110,0.95), rgba(37,14,55,0.95))',
    avatars: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop',
    ],
    durationMins: 150,
    hostName: 'Dev Anand',
    locationName: 'The Sound Garden, Faridabad',
    dateStr: 'Today, 7:00 PM',
    description: 'Acoustic live session with indie artists. Bring a blanket, bring good vibes. Entry is free — love is the ticket.',
    tags: ['Music', 'Nightlife'],
  },
  {
    id: '4',
    lat: 28.4055,
    lng: 77.3055,
    title: 'Basketball',
    people: '10 people',
    dist: '0.7 km',
    icon: 'sports_basketball',
    color: '#B84900',   // burnt orange
    gradient: 'linear-gradient(135deg, rgba(184,73,0,0.95), rgba(92,36,0,0.95))',
    avatars: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&fit=crop',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&fit=crop',
    ],
    durationMins: 75,
    hostName: 'Vikram Nair',
    locationName: 'NIT Court, Faridabad',
    dateStr: 'Today, 6:30 PM',
    description: '3v3 pickup basketball. Competitive but friendly. Show up, lace up, run it.',
    tags: ['Sports', 'Competitive'],
  },
  {
    id: '5',
    lat: 28.4010,
    lng: 77.3300,
    title: 'Gaming Zone',
    people: '6 people',
    dist: '1.2 km',
    icon: 'sports_gaming',
    color: '#1E3A6E',   // deep navy
    gradient: 'linear-gradient(135deg, rgba(30,58,110,0.95), rgba(15,29,55,0.95))',
    avatars: [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop',
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&fit=crop',
    ],
    durationMins: 120,
    hostName: 'Gaurav Khanna',
    locationName: 'Level Up Zone, Faridabad',
    dateStr: 'Today, 8:00 PM',
    description: 'Board games + console gaming session. FIFA, Chess, Catan — we have it all. Snacks provided.',
    tags: ['Gaming', 'Indoor'],
  },
];

const MapRender = forwardRef(({ userLocation, isModalOpen, onMapMoved, onMapDragStart, onMarkerPress, onMapPress, showPins = true, showCenterPin = false, activeFilter = 'all' }, ref) => {
  const webViewRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useImperativeHandle(ref, () => ({
    recenterToUser: () => {
      if (webViewRef.current && mapReady && userLocation) {
        webViewRef.current.injectJavaScript(
          `if (window.flyToWithOffset) { window.flyToWithOffset(${userLocation.lat}, ${userLocation.lng}, 14, 1); } true;`
        );
      }
    }
  }));

  // Auto-recenter + update user location dot when location is fetched
  useEffect(() => {
    if (webViewRef.current && mapReady && userLocation) {
      webViewRef.current.injectJavaScript(
        `if (window.updateUserLocation) { window.updateUserLocation(${userLocation.lat}, ${userLocation.lng}); }
         if (window.flyToWithOffset) { window.flyToWithOffset(${userLocation.lat}, ${userLocation.lng}, 14, 1); } true;`
      );
    }
  }, [mapReady, userLocation]);

  // ── Initialize SQLite tile DB + start background tile download ──
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // 1. Initialize SQLite database
        initTileDB();
        console.log('[MapRender] TileDB initialized');

        // 2. Start background tile download for user's area
        // Commented out to prevent Native/JSI OOM crash on older Androids
        /*
        downloadTilePack(12.9279, 77.6271, pct => {
          if (isMounted) {
            console.log(`[MapRender] Tile download: ${pct}%`);
          }
        });
        */
      } catch (err) {
        console.warn('[MapRender] Init error:', err);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── 150ms mount delay for Fabric transition crash prevention ────
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // ── When map signals ready, inject cache + pins + center pin ────
  useEffect(() => {
    if (mapReady && webViewRef.current) {
      // FIX P3: inject 4 zoom levels on ready — blur/mid/main/detail all pre-warmed
      // Order: low→high so high-zoom (user-visible) tiles overwrite sooner
      injectTileCacheIntoWebView(webViewRef, 10); // blur layer
      injectTileCacheIntoWebView(webViewRef, 12); // intermediate
      injectTileCacheIntoWebView(webViewRef, 14); // main visible zoom
      injectTileCacheIntoWebView(webViewRef, 15); // detail zoom

      // Only inject activity pins if showPins is true
      if (showPins) {
        // Filter pins based on activeFilter
        let filteredPins = DUMMY_PINS;
        if (activeFilter !== 'all') {
          const filterMap = { sports: 'Sports', music: 'Music', cafe: 'Social', gaming: 'Gaming' };
          const tagToMatch = filterMap[activeFilter];
          if (tagToMatch) {
            filteredPins = DUMMY_PINS.filter(p => p.tags.includes(tagToMatch));
          }
        }

        // Place pins relative to user location so they're always visible
        const baseLat = userLocation ? userLocation.lat : 28.4089;
        const baseLng = userLocation ? userLocation.lng : 77.3178;
        const pinsToInject = filteredPins.map((pin, i) => ({
          ...pin,
          lat: baseLat + pin.lat - 28.4089,
          lng: baseLng + pin.lng - 77.3178,
        }));
        webViewRef.current.injectJavaScript(
          `window.updatePins(${JSON.stringify(pinsToInject)}); true;`,
        );
      }

      // Show center pin overlay inside WebView if requested
      if (showCenterPin) {
        webViewRef.current.injectJavaScript(
          `if (window.showCenterPin) { window.showCenterPin(true); } true;`,
        );
      }
    }
  }, [mapReady, showPins, showCenterPin, userLocation, activeFilter]);

  // ── Notify map about modal state ────────────────────────────────
  useEffect(() => {
    if (mapReady && webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `if (window.setModalOpen) { window.setModalOpen(${isModalOpen ? 'true' : 'false'}); } true;`
      );
    }
  }, [mapReady, isModalOpen]);

  // ── Handle messages from WebView ────────────────────────────────
  const handleMessage = useCallback(event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'MAP_READY':
          console.log('[MapRender] WebView map ready');
          setMapReady(true);
          break;

        case 'MAP_PRESS':
          console.log('[MapRender] Map pressed');
          if (onMapPress) onMapPress();
          break;

        case 'MARKER_PRESS':
          console.log('[MapRender] Pin pressed:', data.pinId);
          if (onMarkerPress) {
            const baseLat = userLocation ? userLocation.lat : 28.4089;
            const baseLng = userLocation ? userLocation.lng : 77.3178;
            const pinObj = DUMMY_PINS.find(p => p.id === data.pinId);
            if (pinObj) {
              const mappedPinObj = {
                ...pinObj,
                lat: baseLat + pinObj.lat - 28.4089,
                lng: baseLng + pinObj.lng - 77.3178,
              };
              onMarkerPress(mappedPinObj);
            }
          }
          break;

        case 'CACHE_TILES':
          // Process a batch of tiles needed by the WebView using a concurrency queue
          if (data.tiles && Array.isArray(data.tiles)) {
            data.tiles.forEach(t => {
              const key = `${t.z}-${t.x}-${t.y}`;
              if (!pendingKeys.has(key)) {
                pendingKeys.add(key);
                downloadQueue.push({ z: t.z, x: t.x, y: t.y, webViewRef });
              }
            });
            processDownloadQueue();
          }
          break;

        case 'MAP_MOVED':
          if (onMapMoved && data.center) {
            onMapMoved(data.center);
          }
          break;

        case 'MAP_DRAG_START':
          if (onMapDragStart) {
            onMapDragStart();
          }
          break;

        default:
          break;
      }
    } catch (e) {
      console.warn('[MapRender] Message parse error:', e);
    }
  }, []);

  // ── Render ──────────────────────────────────────────────────────

  if (!isReady) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={require('./map.html')}
        style={styles.map}
        onMessage={handleMessage}
        onConsoleMessage={event => console.log('[WebView Console]', event.nativeEvent.message)}
        // Storage & JS
        domStorageEnabled={true}
        javaScriptEnabled={true}
        // Cache — serve from disk first
        cacheEnabled={true}
        cacheMode={'LOAD_CACHE_ELSE_NETWORK'}
        // File access — required for loading local tile images via file://
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        // FIX P6: GPU acceleration — force hardware compositing on Android
        androidLayerType="hardware"
        renderToHardwareTextureAndroid={true}
        androidHardwareAccelerationDisabled={false}
        // FIX P6: extra WebView props for stability + performance
        mixedContentMode="always"
        geolocationEnabled={true}
        setSupportMultipleWindows={false}
        nestedScrollEnabled={false}
        mediaPlaybackRequiresUserAction={false}
        // Scroll behavior
        overScrollMode="never"
        scrollEnabled={false}
        bounces={false}
        // Callbacks
        onLoadStart={() => console.log('[MapRender] WebView load start')}
        onLoadEnd={() => console.log('[MapRender] WebView load end')}
        onError={syntheticEvent => {
          console.warn('[MapRender] WebView error:', syntheticEvent.nativeEvent);
        }}
        onHttpError={syntheticEvent => {
          console.warn('[MapRender] WebView HTTP error:', syntheticEvent.nativeEvent);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E4D9', // Match map beige — zero flash on load
  },
  map: {
    flex: 1,
    opacity: 0.99, // FIX P6: forces Android to promote WebView to its own GPU
                   // compositor layer — eliminates jank between JS + render threads
  },
});

export default MapRender;
