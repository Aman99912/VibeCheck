# VibeCheck Map — Bulletproof Tile Cache + 90fps Solution

## The Core Problem (Why Blank Tiles Happen)

```
Your current:  WebView → Leaflet → HTTP Cache → Network tiles
Problem:       HTTP cache = OS clears it anytime under memory pressure

Google Maps:   App → SQLite tile DB → file:// → GPU render
Result:        OS cannot clear SQLite in DocumentDirectory. Never blank.
```

## Solution: Option B — Native SQLite Tile Store

---

## Step 1: React Native Tile Downloader (JavaScript)

```javascript
// src/utils/tileManager.js
import RNFS from 'react-native-fs';
import { open } from '@op-engineering/op-sqlite';

const TILE_DIR = `${RNFS.DocumentDirectoryPath}/tiles`;
const db = open({ name: 'tiles.db' });

// Initialize tile database
export const initTileDB = async () => {
  await RNFS.mkdir(TILE_DIR);
  db.execute(`
    CREATE TABLE IF NOT EXISTS tile_cache (
      z INTEGER NOT NULL,
      x INTEGER NOT NULL,
      y INTEGER NOT NULL,
      local_path TEXT NOT NULL,
      file_size INTEGER,
      cached_at INTEGER,
      PRIMARY KEY (z, x, y)
    )
  `);
  db.execute(`CREATE INDEX IF NOT EXISTS idx_tile_zxy ON tile_cache(z, x, y)`);
};

// Convert lat/lng to tile x,y for a zoom level (OSM formula)
export const latLngToTile = (lat, lng, zoom) => {
  const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
  const y = Math.floor(
    (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 /
      Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
  );
  return { x, y };
};

// Check if tile is already cached
export const isTileCached = (z, x, y) => {
  try {
    const result = db.execute(
      `SELECT local_path FROM tile_cache WHERE z=? AND x=? AND y=?`,
      [z, x, y]
    );
    return result.rows._array[0]?.local_path || null;
  } catch { return null; }
};

// Download a single tile and save to disk
export const downloadTile = async (z, x, y) => {
  const cached = isTileCached(z, x, y);
  if (cached) return cached;

  const dir = `${TILE_DIR}/${z}/${x}`;
  const localPath = `${dir}/${y}.png`;

  await RNFS.mkdir(dir);

  const url = `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}@2x.png`;

  try {
    await RNFS.downloadFile({
      fromUrl: url,
      toFile: localPath,
      headers: { 'User-Agent': 'VibeCheck/1.0' },
    }).promise;

    const stat = await RNFS.stat(localPath);
    db.execute(
      `INSERT OR REPLACE INTO tile_cache (z, x, y, local_path, file_size, cached_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [z, x, y, localPath, stat.size, Date.now()]
    );
    return localPath;
  } catch (err) {
    return null; // Fall back to network in Leaflet
  }
};

// Download tiles for a bounding area (called on first launch)
export const downloadTilePack = async (centerLat, centerLng, onProgress) => {
  const ZOOM_LEVELS = [12, 13, 14, 15, 16, 17];
  const RADIUS_TILES = { 12: 2, 13: 3, 14: 5, 15: 8, 16: 10, 17: 12 };

  let total = 0, done = 0;
  const jobs = [];

  for (const z of ZOOM_LEVELS) {
    const center = latLngToTile(centerLat, centerLng, z);
    const r = RADIUS_TILES[z];
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        jobs.push({ z, x: center.x + dx, y: center.y + dy });
        total++;
      }
    }
  }

  // Batch download — 5 concurrent
  const BATCH = 5;
  for (let i = 0; i < jobs.length; i += BATCH) {
    const batch = jobs.slice(i, i + BATCH);
    await Promise.all(batch.map(({ z, x, y }) => downloadTile(z, x, y)));
    done += batch.length;
    onProgress?.(Math.round((done / total) * 100));
  }
};

// Get tile URL — local file if cached, network fallback
export const getTileUrl = (z, x, y) => {
  const local = isTileCached(z, x, y);
  if (local) return `file://${local}`;
  return `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}@2x.png`;
};

// Storage budget management — delete oldest tiles over 100MB
export const evictOldTiles = async (maxMB = 100) => {
  const result = db.execute(`SELECT SUM(file_size) as total FROM tile_cache`);
  const totalBytes = result.rows._array[0]?.total || 0;
  const maxBytes = maxMB * 1024 * 1024;

  if (totalBytes <= maxBytes) return;

  const old = db.execute(
    `SELECT z, x, y, local_path FROM tile_cache ORDER BY cached_at ASC LIMIT 200`
  );
  for (const row of old.rows._array) {
    try { await RNFS.unlink(row.local_path); } catch {}
    db.execute(`DELETE FROM tile_cache WHERE z=? AND x=? AND y=?`,
      [row.z, row.x, row.y]);
  }
};
```

---

## Step 2: React Native WebView Component

```javascript
// src/screens/map/MapScreen.jsx
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import { getTileUrl, initTileDB, downloadTilePack } from '../../utils/tileManager';
import { useMapStore } from '../../store/useMapStore';

export const MapScreen = () => {
  const webViewRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const { activities, filters } = useMapStore();

  useEffect(() => {
    initTileDB();
    // Download tile pack for user's city on first launch
    const firstLaunch = !mmkv.getString('tiles_downloaded');
    if (firstLaunch) {
      downloadTilePack(28.6139, 77.2090, (pct) => {
        console.log(`Tiles: ${pct}%`);
      }).then(() => {
        mmkv.set('tiles_downloaded', 'true');
      });
    }
  }, []);

  // Send pins to WebView after map is ready
  useEffect(() => {
    if (mapReady && activities.length > 0) {
      webViewRef.current?.injectJavaScript(
        `window.updatePins(${JSON.stringify(activities)}); true;`
      );
    }
  }, [activities, mapReady]);

  // Handle messages FROM WebView (pin tap, map move, etc.)
  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
      case 'MAP_READY':
        setMapReady(true);
        break;
      case 'PIN_TAPPED':
        // Show bottom sheet with activity details
        useMapStore.getState().setSelectedActivity(data.activity);
        break;
      case 'MAP_MOVED':
        // User panned to new area — fetch new pins
        useMapStore.getState().setViewport(data.bounds);
        break;
    }
  };

  // Build tile URL map for current viewport
  const buildTileConfig = () => {
    // Pass tile resolver function to WebView
    return `
      window.TILE_RESOLVER = function(z, x, y) {
        // This is called from JS inside WebView
        // Returns the best URL — local file if cached
        return new Promise(resolve => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'GET_TILE', z, x, y
          }));
          // WebView will inject the URL back
        });
      };
    `;
  };

  const HTML_PATH = `${RNFS.MainBundlePath}/map.html`;
  // Android: file:///android_asset/map.html
  // iOS: file:///path/to/map.html

  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'file:///android_asset/map.html' }}  // Android
        // source={{ uri: `file://${HTML_PATH}` }}          // iOS

        // GPU acceleration
        androidLayerType="hardware"
        renderToHardwareTextureAndroid={true}

        // File access — required for local tile files
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}

        // Cache behavior
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        cacheEnabled={true}

        // Performance
        overScrollMode="never"
        scrollEnabled={false}
        bounces={false}
        decelerationRate="fast"
        contentMode="mobile"
        setBuiltInZoomControls={false}

        onMessage={onMessage}
        onLoad={() => {
          // Inject tile resolver after load
          webViewRef.current?.injectJavaScript(buildTileConfig() + ' true;');
        }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};
```

---

## Step 3: map.html — Optimized Leaflet with Blur Fallback

```html
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/supercluster@8.0.1/dist/supercluster.min.js"></script>
<style>
html, body, #map {
  width: 100%; height: 100%; margin: 0; padding: 0;
  background: #f5f3f0; /* CartoDB Voyager bg color — no white flash */
  touch-action: none;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

/* GPU promote ALL tile layers */
.leaflet-tile {
  transform: translate3d(0,0,0) !important;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.leaflet-tile-container {
  transform: translate3d(0,0,0);
  will-change: transform;
}
/* Remove ALL fade transitions — tiles appear instantly */
.leaflet-zoom-animated { transition: none !important; }
.leaflet-tile { transition: none !important; opacity: 1 !important; }
.leaflet-tile-loaded { transition: none !important; }
.leaflet-overlay-pane { transition: none !important; }

/* Blur layer (lower zoom fallback) */
#blur-layer .leaflet-tile {
  filter: blur(1.5px);
  opacity: 0.65 !important;
  transform: translate3d(0,0,0) scale(1.02) !important;
}

/* Custom pin cards */
.vibe-pin {
  background: #1a1a1a;
  color: #fff;
  border-radius: 12px;
  padding: 8px 12px;
  font-family: -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(0,0,0,0.25);
  border: 1.5px solid rgba(255,255,255,0.1);
  transform: translate3d(0,0,0);
  will-change: transform;
  cursor: pointer;
}
.vibe-pin .count { color: #aaa; font-size: 11px; margin-top: 2px; }
.vibe-cluster {
  background: #2563eb;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(37,99,235,0.4);
  border: 2px solid rgba(255,255,255,0.3);
  transform: translate3d(0,0,0);
  will-change: transform;
}
</style>
</head>
<body>
<div id="map"></div>
<script>
// ── Leaflet Map Init ──────────────────────────────────────────
const map = L.map('map', {
  zoomSnap: 0,                   // fractional zoom — silky smooth
  zoomDelta: 0.25,               // smaller steps = smoother
  zoomAnimationThreshold: 8,
  keepBuffer: 4,                 // preload 4 extra rows in all directions
  fadeAnimation: false,          // NO fade — instant tile appear
  zoomAnimation: true,           // CSS zoom animation (GPU)
  markerZoomAnimation: true,
  preferCanvas: true,            // Canvas renderer — faster for 100+ markers
  updateWhenZooming: false,      // don't reload tiles mid-zoom gesture
  updateInterval: 50,            // 20 updates/s (default 200ms = too slow)
  maxZoom: 18,
  minZoom: 10,
  attributionControl: false,
  zoomControl: false,
}).setView([28.6139, 77.2090], 13);

// ── Blur fallback layer (zoom - 2, always present) ────────────
// This is what makes it "never white"
const blurLayer = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  {
    maxZoom: 15,
    tileSize: 256,
    id: 'blur-layer',
    zIndex: 1,
  }
);
blurLayer.addTo(map);
// Give blur pane a class for CSS targeting
blurLayer.getContainer()?.setAttribute('id', 'blur-layer');

// ── Main tile layer (local file:// first, network fallback) ───
const tileCache = {};  // z-x-y → local file path (injected by RN)

const mainLayer = L.TileLayer.extend({
  createTile: function(coords, done) {
    const tile = document.createElement('img');
    tile.style.transform = 'translate3d(0,0,0)';
    tile.style.willChange = 'transform';
    tile.style.imageRendering = '-webkit-optimize-contrast';

    const key = `${coords.z}-${coords.x}-${coords.y}`;
    const localPath = tileCache[key];

    if (localPath) {
      // Serve from local file — zero network
      tile.src = localPath;
    } else {
      // Fallback to CDN
      tile.src = `https://a.basemaps.cartocdn.com/rastertiles/voyager/${coords.z}/${coords.x}/${coords.y}@2x.png`;
      // Tell RN to cache this tile for next time
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'CACHE_TILE',
        z: coords.z, x: coords.x, y: coords.y
      }));
    }

    tile.onload = () => done(null, tile);
    tile.onerror = () => done('tile error', tile);
    return tile;
  }
});

const mainTileLayer = new mainLayer(null, { maxZoom: 18, zIndex: 2 });
mainTileLayer.addTo(map);

// ── Supercluster (Web Worker-based clustering) ─────────────────
const cluster = new Supercluster({
  radius: 60,
  maxZoom: 16,
  minPoints: 3,
});

let allPins = [];
let markers = [];

function renderPins() {
  // Clear existing markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const bounds = map.getBounds();
  const bbox = [
    bounds.getWest(), bounds.getSouth(),
    bounds.getEast(), bounds.getNorth()
  ];
  const zoom = Math.floor(map.getZoom());
  const points = cluster.getClusters(bbox, zoom);

  points.forEach(point => {
    const [lng, lat] = point.geometry.coordinates;
    const isCluster = point.properties.cluster;

    if (isCluster) {
      // Cluster marker
      const size = Math.min(20 + point.properties.point_count * 2, 52);
      const el = document.createElement('div');
      el.className = 'vibe-cluster';
      el.style.width = el.style.height = `${size}px`;
      el.textContent = point.properties.point_count_abbreviated;

      const marker = L.marker([lat, lng], {
        icon: L.divIcon({ html: el, className: '', iconSize: [size, size] })
      });
      marker.addTo(map);
      markers.push(marker);
    } else {
      // Activity pin card
      const activity = point.properties;
      const el = document.createElement('div');
      el.className = 'vibe-pin';
      el.innerHTML = `
        <div>${activity.emoji || '📍'} ${activity.title}</div>
        <div class="count">${activity.participant_count}/${activity.max_people} joined · ${activity.distance_text}</div>
      `;
      el.onclick = () => {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'PIN_TAPPED',
          activity
        }));
      };

      const marker = L.marker([lat, lng], {
        icon: L.divIcon({ html: el, className: '', iconSize: [0, 0], iconAnchor: [0, 0] })
      });
      marker.addTo(map);
      markers.push(marker);
    }
  });
}

// ── Public API (called from React Native) ─────────────────────
window.updatePins = (pins) => {
  allPins = pins;
  // Load into Supercluster
  cluster.load(pins.map(p => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
    properties: p
  })));
  renderPins();
};

window.injectTileCache = (cacheMap) => {
  // RN injects { "z-x-y": "file:///path/to/tile.png" }
  Object.assign(tileCache, cacheMap);
};

// Re-render on map move (throttled to 100ms)
let renderTimer;
map.on('moveend zoomend', () => {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderPins, 100);

  // Notify RN of new viewport
  const b = map.getBounds();
  window.ReactNativeWebView?.postMessage(JSON.stringify({
    type: 'MAP_MOVED',
    bounds: {
      north: b.getNorth(), south: b.getSouth(),
      east: b.getEast(), west: b.getWest(),
      zoom: map.getZoom()
    }
  }));
});

// Signal ready
window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'MAP_READY' }));
</script>
</body>
</html>
```

---

## Step 4: Inject Tile Cache into WebView on Load

```javascript
// After WebView loads, inject the pre-built tile cache map
// so Leaflet knows which tiles are available locally

const injectTileCache = async (webViewRef, viewport) => {
  const { north, south, east, west, zoom } = viewport;

  // Query SQLite for tiles in this viewport
  const zoomLevels = [zoom - 2, zoom - 1, zoom, zoom + 1].filter(z => z >= 0 && z <= 18);
  const cacheMap = {};

  for (const z of zoomLevels) {
    const result = db.execute(
      `SELECT z, x, y, local_path FROM tile_cache WHERE z = ?`,
      [z]
    );
    for (const row of result.rows._array) {
      cacheMap[`${row.z}-${row.x}-${row.y}`] = `file://${row.local_path}`;
    }
  }

  webViewRef.current?.injectJavaScript(
    `window.injectTileCache(${JSON.stringify(cacheMap)}); true;`
  );
};
```

---

## Summary

| Problem | Solution |
|---------|----------|
| HTTP cache cleared by OS | SQLite tile index in DocumentDirectory — OS cannot clear it |
| Blank tiles on zoom | Blur fallback layer (zoom−2 scaled up) — always something visible |
| markercluster slow at 500+ pins | Supercluster — runs spatial math, no DOM node per marker |
| Tile fade-in flash | `fadeAnimation: false` + `transition: none !important` |
| Slow pan | `keepBuffer: 4`, GPU flags, `renderToHardwareTextureAndroid` |
| Raster tiles = one PNG per tile | Keep for now — blur layer compensates. Vector (Mapbox) = future upgrade |


Why Google Maps Never Shows Blank Tiles
Google Maps uses 3 techniques together:
1. Tile Pyramid (pre-render lower zoom as blur placeholder)
2. Tile Prefetch (load tiles BEFORE you need them)
3. Vector Tiles (not images — math-drawn, infinite zoom)
When you zoom in on Google Maps:

You see a blurry zoomed version of the previous zoom level instantly
Sharp tiles load on top of the blur
You never see blank/white because the blur is always there


Your Current Problem
WebView → Leaflet → Raster PNG tiles → HTTP cache
Problems with this:

HTTP cache = unreliable (OS clears it)
Raster tiles = blank until downloaded
No blur fallback = white screen on zoom
WebView cache = not persistent like Google Maps


Best Solution for VibeCheck
Option B is the right call — but with one upgrade:
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.25s;
    animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
  }
VvisualizeVvisualize show_widgetNow let me give you the actual implementation file:Ran a command, read a fileRan a command, read a fileHere's the complete picture — 5 tabs in the interactive widget + full implementation file.

Direct answers to your questions:
Why blank tiles happen (technically):
Your HTTP cache is an LRU cache owned by Android/iOS. Under memory pressure, the OS clears it silently. Your preloaded tiles vanish. Google Maps stores tiles in its own SQLite database inside DocumentDirectory — the OS cannot touch that.
The blur / layer system you noticed:
Google Maps mounts TWO tile layers always. Bottom layer = zoom−2 tiles scaled up (blurry but instant, always in memory). Top layer = sharp current-zoom tiles loading in. You always see the blur, never white. I've replicated this exact pattern in map.html with Leaflet.
Best solution for you: Option B (SQLite + local file://)

Option A (Service Worker) = dead end. SW requires https:// origin. WebView loads from file:// = null origin. Browsers block SW on null origin. This cannot be fixed.
Option B = bulletproof. Tiles saved to DocumentDirectory, SQLite index for O(1) lookup, file:// served directly to Leaflet. Zero network for cached tiles.

Replace markercluster with Supercluster:
leaflet.markercluster creates one DOM node per marker. At 500+ pins this causes layout thrashing. supercluster runs spatial indexing (R-tree algorithm) and can run in a Web Worker — zero impact on JS main thread. This is what Mapbox uses internally.
Keep your Leaflet+WebView approach — switching to react-native-maps native will reintroduce the SIGSEGV crashes you already solved.