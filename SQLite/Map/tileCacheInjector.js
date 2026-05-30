/**
 * tileCacheInjector.js
 * Bridges the native SQLite tile cache with the Leaflet WebView.
 * Builds a { "z-x-y": "file:///path" } map and injects it into the WebView
 * so the custom TileLayer can serve tiles from local disk.
 */
import { getAllCachedTilesForZoom } from './tileDB';

/**
 * Build a cache map object for given zoom levels.
 * Returns { "12-1234-567": "file:///data/.../12/1234/567.png", ... }
 */
export const buildTileCacheMap = (zoomLevels) => {
  const cacheMap = {};

  for (const z of zoomLevels) {
    if (z < 0 || z > 20) continue;
    const tiles = getAllCachedTilesForZoom(z);
    for (const row of tiles) {
      cacheMap[`${row.z}-${row.x}-${row.y}`] = `file://${row.local_path}`;
    }
  }

  return cacheMap;
};

/**
 * Inject the tile cache map into the WebView.
 * The WebView's custom TileLayer checks this map before hitting the network.
 *
 * @param {object} webViewRef - React ref to the WebView component
 * @param {number} currentZoom - Current map zoom level (caches ±3 zoom levels)
 */
export const injectTileCacheIntoWebView = (webViewRef, currentZoom = 14) => {
  // Build cache for zoom levels around the current view
  const zoomLevels = [];
  for (
    let z = Math.max(0, currentZoom - 3);
    z <= Math.min(20, currentZoom + 3);
    z++
  ) {
    zoomLevels.push(z);
  }

  const cacheMap = buildTileCacheMap(zoomLevels);
  const tileCount = Object.keys(cacheMap).length;

  if (tileCount > 0) {
    webViewRef.current?.injectJavaScript(
      `window.injectTileCache(${JSON.stringify(cacheMap)}); true;`,
    );
    console.log(
      `[TileCache] Injected ${tileCount} cached tile paths into WebView`,
    );
  } else {
    console.log('[TileCache] No cached tiles to inject');
  }
};
