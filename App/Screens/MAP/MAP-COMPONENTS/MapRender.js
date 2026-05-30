import React, {useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle} from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {
  initTileDB,
  downloadTilePack,
  downloadTile,
  injectTileCacheIntoWebView,
} from '../../../../SQLite/Map';

// ── Tile Download Queue (prevents OOM/network crash) ──────────────
const downloadQueue = [];
let activeDownloads = 0;
const MAX_CONCURRENT = 2; // Reduced to 2 to prevent OOM
const pendingKeys = new Set();

const processDownloadQueue = () => {
  if (activeDownloads >= MAX_CONCURRENT || downloadQueue.length === 0) return;
  
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

// Dummy data for pins (centered in Koramangala / HSR Layout area)
const DUMMY_PINS = [
  {
    id: '1',
    lat: 12.9305,
    lng: 77.6225,
    title: 'Football Match',
    people: '18 people',
    dist: '0.5 km',
    icon: 'sports_soccer',
    color: '#00F2FE',
    gradient:
      'linear-gradient(135deg, rgba(8, 38, 48, 0.95), rgba(4, 19, 24, 0.95))',
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop',
    ],
  },
  {
    id: '2',
    lat: 12.9225,
    lng: 77.6305,
    title: 'Cafe Meetup',
    people: '6 people',
    dist: '0.3 km',
    icon: 'local_cafe',
    color: '#EF4444',
    gradient:
      'linear-gradient(135deg, rgba(42, 10, 16, 0.95), rgba(21, 5, 8, 0.95))',
    avatars: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&fit=crop',
    ],
  },
  {
    id: '3',
    lat: 12.929,
    lng: 77.6325,
    title: 'Live Music',
    people: '24 people',
    dist: '1.1 km',
    icon: 'music_note',
    color: '#C084FC',
    gradient:
      'linear-gradient(135deg, rgba(30, 12, 45, 0.95), rgba(15, 6, 22, 0.95))',
    avatars: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop',
    ],
  },
  {
    id: '4',
    lat: 12.9255,
    lng: 77.6205,
    title: 'Basketball',
    people: '12 people',
    dist: '0.7 km',
    icon: 'sports_basketball',
    color: '#FB923C',
    gradient:
      'linear-gradient(135deg, rgba(42, 20, 8, 0.95), rgba(21, 10, 4, 0.95))',
    avatars: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&fit=crop',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&fit=crop',
    ],
  },
];

const MapRender = forwardRef((props, ref) => {
  const webViewRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useImperativeHandle(ref, () => ({
    recenterToUser: () => {
      if (webViewRef.current && mapReady) {
        // Fly to default "user location" for now
        webViewRef.current.injectJavaScript(
          `if (window.map) { window.map.flyTo([12.9279, 77.6271], 14, { duration: 1 }); } true;`
        );
      }
    }
  }));

  // ── Initialize SQLite tile DB + start background tile download ──
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // 1. Initialize SQLite database
        initTileDB();
        console.log('[MapRender] TileDB initialized');

        // 2. Start background tile download for user's area
        // Uses Bangalore center (12.9279, 77.6271) — replace with user's location
        downloadTilePack(12.9279, 77.6271, pct => {
          if (isMounted) {
            console.log(`[MapRender] Tile download: ${pct}%`);
          }
        });
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

  // ── When map signals ready, inject cache + pins ─────────────────
  useEffect(() => {
    if (mapReady && webViewRef.current) {
      // Inject SQLite tile cache paths into WebView
      injectTileCacheIntoWebView(webViewRef, 14);

      // Inject pin data
      webViewRef.current.injectJavaScript(
        `window.updatePins(${JSON.stringify(DUMMY_PINS)}); true;`,
      );
    }
  }, [mapReady]);

  // ── Handle messages from WebView ────────────────────────────────
  const handleMessage = useCallback(event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'MAP_READY':
          console.log('[MapRender] WebView map ready');
          setMapReady(true);
          break;

        case 'MARKER_PRESS':
          console.log('[MapRender] Pin pressed:', data.pinId);
          // TODO: open activity bottom sheet
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
          // Removed mass cache injection to prevent JS lag/freezes.
          // Single tiles are injected dynamically via CACHE_TILE now.
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
        // GPU acceleration — hardware compositing for 90fps
        androidLayerType="hardware"
        renderToHardwareTextureAndroid={true}
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
          console.warn(
            '[MapRender] WebView HTTP error:',
            syntheticEvent.nativeEvent,
          );
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0', // Match Voyager land bg — no flash
  },
  map: {
    flex: 1,
  },
});

export default MapRender;
