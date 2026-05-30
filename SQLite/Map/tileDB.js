/**
 * tileDB.js
 * SQLite-backed tile cache database using @op-engineering/op-sqlite v16.
 * Tiles stored on disk, indexed in SQLite for O(1) lookups.
 * OS cannot clear DocumentDirectory — tiles persist across sessions.
 */
import { open } from '@op-engineering/op-sqlite';

let db = null;

/**
 * Initialize the tile cache database.
 * Creates the table and index if they don't exist.
 * Safe to call multiple times — no-op after first init.
 */
export const initTileDB = () => {
  if (db) return db;

  db = open({ name: 'map_tiles.db' });

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS tile_cache (
      z INTEGER NOT NULL,
      x INTEGER NOT NULL,
      y INTEGER NOT NULL,
      local_path TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      cached_at INTEGER NOT NULL,
      PRIMARY KEY (z, x, y)
    )
  `);

  db.executeSync(
    'CREATE INDEX IF NOT EXISTS idx_tile_zoom ON tile_cache(z)',
  );

  console.log('[TileDB] Database initialized');
  return db;
};

/**
 * Get the database instance (auto-inits if needed).
 */
export const getDB = () => {
  if (!db) initTileDB();
  return db;
};

/**
 * Check if a tile is cached. Returns local file path or null.
 * Uses executeSync for zero-latency lookups (no async overhead).
 */
export const isTileCached = (z, x, y) => {
  try {
    const result = getDB().executeSync(
      'SELECT local_path FROM tile_cache WHERE z=? AND x=? AND y=?',
      [z, x, y],
    );
    // op-sqlite v16: result.rows is a plain array of objects
    return result.rows?.[0]?.local_path || null;
  } catch {
    return null;
  }
};

/**
 * Insert or update a tile entry in the cache.
 */
export const insertTile = (z, x, y, localPath, fileSize) => {
  try {
    getDB().executeSync(
      `INSERT OR REPLACE INTO tile_cache (z, x, y, local_path, file_size, cached_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [z, x, y, localPath, fileSize || 0, Date.now()],
    );
  } catch (err) {
    console.warn('[TileDB] Insert error:', err);
  }
};

/**
 * Get all cached tile paths for a given zoom level.
 * Returns array of { z, x, y, local_path }.
 */
export const getAllCachedTilesForZoom = (zoomLevel) => {
  try {
    const result = getDB().executeSync(
      'SELECT z, x, y, local_path FROM tile_cache WHERE z=?',
      [zoomLevel],
    );
    return result.rows || [];
  } catch {
    return [];
  }
};

/**
 * Get total number of cached tiles.
 */
export const getCachedTileCount = () => {
  try {
    const result = getDB().executeSync(
      'SELECT COUNT(*) as count FROM tile_cache',
    );
    return result.rows?.[0]?.count || 0;
  } catch {
    return 0;
  }
};

/**
 * Evict oldest tiles when storage exceeds maxMB.
 * Deletes files from disk and removes entries from SQLite.
 */
export const evictOldTiles = async (maxMB = 150) => {
  try {
    const result = getDB().executeSync(
      'SELECT SUM(file_size) as total FROM tile_cache',
    );
    const totalBytes = result.rows?.[0]?.total || 0;
    const maxBytes = maxMB * 1024 * 1024;

    if (totalBytes <= maxBytes) return;

    console.log(
      `[TileDB] Cache size ${Math.round(totalBytes / 1024 / 1024)}MB exceeds ${maxMB}MB, evicting old tiles...`,
    );

    const RNFS = require('react-native-fs').default;
    const old = getDB().executeSync(
      'SELECT z, x, y, local_path FROM tile_cache ORDER BY cached_at ASC LIMIT 200',
    );

    for (const row of old.rows || []) {
      try {
        await RNFS.unlink(row.local_path);
      } catch {}
      getDB().executeSync(
        'DELETE FROM tile_cache WHERE z=? AND x=? AND y=?',
        [row.z, row.x, row.y],
      );
    }

    console.log('[TileDB] Eviction complete');
  } catch (err) {
    console.warn('[TileDB] Eviction error:', err);
  }
};
