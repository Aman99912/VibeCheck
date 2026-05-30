/**
 * map.cache.js
 * Caching configuration module for Map screen.
 * On Android, we utilize the native WebView LOAD_CACHE_ELSE_NETWORK mode to avoid CORS errors.
 */
export const MAP_CACHE_SCRIPT = `
  console.log("Map tile caching initialized via native WebView cache mode (LOAD_CACHE_ELSE_NETWORK).");
`;
