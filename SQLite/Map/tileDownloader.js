/**
 * tileDownloader.js
 * Downloads CartoDB Voyager map tiles to device storage using react-native-fs.
 * Tiles are saved to DocumentDirectoryPath/map_tiles/{z}/{x}/{y}.png
 * and indexed in SQLite for instant access.
 */
import RNFS from 'react-native-fs';
import { isTileCached, insertTile, getCachedTileCount } from './tileDB';

const TILE_DIR = `${RNFS.DocumentDirectoryPath}/map_tiles`;
const TILE_CDN = 'https://a.basemaps.cartocdn.com/rastertiles/voyager';

/**
 * Convert lat/lng to OSM slippy map tile coordinates.
 * Standard OSM formula for raster tile grids.
 */
export const latLngToTile = (lat, lng, zoom) => {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const y = Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) +
          1 / Math.cos((lat * Math.PI) / 180),
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom),
  );
  return {x, y};
};

/**
 * Ensure the base tile directory exists on disk.
 */
const ensureTileDir = async () => {
  try {
    const exists = await RNFS.exists(TILE_DIR);
    if (!exists) {
      await RNFS.mkdir(TILE_DIR);
    }
  } catch (err) {
    console.warn('[TileDownloader] mkdir error:', err);
  }
};

/**
 * Download a single tile and save to disk + SQLite index.
 * Returns local path on success, null on failure.
 * Skips download if tile is already cached.
 */
export const downloadTile = async (z, x, y) => {
  // Check SQLite cache first — O(1) lookup
  const cached = isTileCached(z, x, y);
  if (cached) return cached;

  const dir = `${TILE_DIR}/${z}/${x}`;
  const localPath = `${dir}/${y}.png`;

  // Ensure directory exists
  try {
    await RNFS.mkdir(dir);
  } catch {}

  const url = `${TILE_CDN}/${z}/${x}/${y}@2x.png`;

  try {
    const result = await RNFS.downloadFile({
      fromUrl: url,
      toFile: localPath,
      headers: {'User-Agent': 'VibeCheck/1.0'},
      connectionTimeout: 10000,
      readTimeout: 10000,
    }).promise;

    if (result.statusCode === 200) {
      const stat = await RNFS.stat(localPath);
      insertTile(z, x, y, localPath, parseInt(stat.size, 10));
      return localPath;
    }

    return null;
  } catch (err) {
    // Network error — tile will load from CDN at runtime
    return null;
  }
};

/**
 * Download a pack of tiles centered around a lat/lng.
 * Called on first app launch to pre-populate the cache.
 * Downloads zoom levels 12-17 with appropriate radius per zoom.
 *
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {function} onProgress - Callback with percentage (0-100)
 */
export const downloadTilePack = async (centerLat, centerLng, onProgress) => {
  await ensureTileDir();

  // Skip if we already have a substantial cache
  const existing = getCachedTileCount();
  if (existing > 100) {
    console.log(
      `[TileDownloader] Already have ${existing} tiles cached, skipping bulk download`,
    );
    onProgress?.(100);
    return;
  }

  // Zoom level → tile radius around center
  // Reduced to prevent network/memory flooding and OOM crashes
  const ZOOM_CONFIG = [
    {z: 11, r: 1}, //   9 tiles — wide area
    {z: 12, r: 2}, //  25 tiles — city overview
    {z: 13, r: 2}, //  25 tiles — district level
    {z: 14, r: 2}, //  25 tiles — neighborhood
  ]; // Total 84 tiles

  const jobs = [];

  for (const {z, r} of ZOOM_CONFIG) {
    const center = latLngToTile(centerLat, centerLng, z);
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        jobs.push({z, x: center.x + dx, y: center.y + dy});
      }
    }
  }

  let done = 0;
  const total = jobs.length;
  // Strictly limit concurrent downloads to 2 to prevent OOM/network choking
  const BATCH_SIZE = 2; 

  console.log(`[TileDownloader] Starting download of ${total} tiles...`);

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(({z, x, y}) => downloadTile(z, x, y)));
    // Add a tiny delay between batches to let the OS network stack breathe
    await new Promise(resolve => setTimeout(resolve, 100));
    done += batch.length;
    onProgress?.(Math.round((done / total) * 100));
  }

  console.log(`[TileDownloader] Complete. ${total} tiles processed.`);
};
