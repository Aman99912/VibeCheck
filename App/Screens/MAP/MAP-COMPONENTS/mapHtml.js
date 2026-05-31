export const mapHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #ffffff; /* Clean white bg — prevents any flash */
      touch-action: none;
      overscroll-behavior: none;
      -webkit-overflow-scrolling: touch;
    }

    .leaflet-tile {
      /* Subtle contrast only — no blur, no warm tones */
      filter: contrast(1.04) brightness(1.01) !important;
      /* No transition on tiles — avoids compositing cost during pan */
    }

    /* ── GPU Acceleration — force all map layers onto their own compositor layers ── */
    .leaflet-tile,
    .leaflet-marker-icon,
    .leaflet-marker-shadow,
    .leaflet-pane,
    .leaflet-map-pane {
      transform: translate3d(0, 0, 0);
      will-change: transform;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }

    /* ── Tile container: explicit GPU promotion — fixes zoom-out chunkiness ── */
    .leaflet-tile-container {
      will-change: transform;
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }

    /* ── Fallback layers: NO blur (GPU cost), FULL opacity (they ARE the fallback) ── */
    .blur-fallback,
    .mid-fallback {
      filter: none !important;                         /* Remove blur — halves GPU cost */
      opacity: 1 !important;                           /* Full opacity — cover blank moments */
      transform: translate3d(0, 0, 0) scale(1) !important; /* No scale — removes seam artifacts */
    }

    /* ── Clear Leaflet marker defaults ───────────────────── */
    .leaflet-div-icon {
      background: transparent !important;
      border: none !important;
    }

    /* ═══════════════════════════════════════════════════════════════
       PIN CARD — Floating Bubble (Snapchat / Zenly Style)
     ═══════════════════════════════════════════════════════════════ */
    .snap-marker-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: auto;
      min-width: 140px;
      max-width: 220px;
      position: relative;
      animation: snapBounce 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
      transform-origin: bottom center;
      will-change: transform, opacity;
      cursor: pointer;
    }

    /* Active press feedback */
    .snap-marker-container:active .floating-bubble {
      transform: scale(0.95);
    }

    /* ── The Bubble Shell ──────────────────────────────────── */
    .floating-bubble {
      background: #FFFFFF;
      border-radius: 32px; /* Perfectly rounded ends */
      padding: 6px 6px 6px 12px; /* Extra padding on left for emoji, right is tighter for avatars */
      box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.08),
        0 14px 28px rgba(0, 0, 0, 0.14),
        0 24px 48px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(0,0,0,0.03);
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      position: relative;
      z-index: 3;
      margin-bottom: 8px; /* space for the pointer */
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* Bubble pointer (down arrow) */
    .bubble-pointer {
      content: '';
      position: absolute;
      bottom: -7px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #FFFFFF;
      z-index: 3;
      /* Add slight drop shadow to arrow to blend with bubble */
      filter: drop-shadow(0 4px 3px rgba(0,0,0,0.1));
    }

    /* ── Inside the Bubble ─────────────────────────────────── */
    .bubble-left {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6px;
      flex: 1;
      overflow: hidden;
    }

    .bubble-emoji {
      font-size: 20px;
      line-height: 1;
      flex-shrink: 0;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .bubble-title {
      font-size: 13px;
      font-weight: 800;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 140px;
    }

    /* ── Host Bubble Styling (Black + Red + Blackberry) ── */
    .host-bubble {
      background: linear-gradient(135deg, #0F0F0F 0%, #5E001F 50%, #2B0033 100%);
      border: 1px solid #8B0032;
    }
    .host-bubble .bubble-title {
      color: #FFFFFF;
    }
    .host-bubble .bubble-pointer {
      border-top-color: #2B0033; /* Matches bottom of gradient */
    }

    /* ── Avatars inside bubble ─────────────────────────────── */
    .bubble-avatars {
      display: flex;
      flex-direction: row;
      align-items: center;
      background: #F4F5F7;
      border-radius: 20px;
      padding: 3px;
    }

    .bubble-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1.5px solid #F4F5F7;
      background: #E0E0E0;
      box-sizing: border-box;
      margin-left: -8px;
      object-fit: cover;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .bubble-avatar:first-child { margin-left: 0; }

    .bubble-avatar-count {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #2563EB;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 800;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: -8px;
      border: 1.5px solid #F4F5F7;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      box-sizing: border-box;
    }

    /* ── Map Ground Halo ───────────────────────────────────── */
    .vibe-halo {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1;
      animation: haloPulse 2.4s infinite ease-in-out;
      pointer-events: none;
    }

    @keyframes haloPulse {
      0%   { transform: translateX(-50%) scale(0.85); opacity: 0.6; }
      50%  { transform: translateX(-50%) scale(1.35); opacity: 0.9; }
      100% { transform: translateX(-50%) scale(0.85); opacity: 0.6; }
    }

     /* ── Cluster Badges ──────────────────────────────────── */
    .vibe-cluster {
      background: linear-gradient(135deg, #856CE2 0%, #6366F1 100%);
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 800;
      font-size: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 6px 16px rgba(133, 108, 226, 0.35);
      border-radius: 50%;
      transform: translate3d(0, 0, 0);
      will-change: transform;
      animation: clusterPulse 2.2s infinite ease-in-out;
    }

    @keyframes clusterPulse {
      0% { transform: scale(1); box-shadow: 0 6px 16px rgba(133, 108, 226, 0.3); }
      50% { transform: scale(1.05); box-shadow: 0 8px 24px rgba(133, 108, 226, 0.55); }
      100% { transform: scale(1); box-shadow: 0 6px 16px rgba(133, 108, 226, 0.3); }
    }

    /* ── User Location Glowing Gem ───────────────────────── */
    .user-location-marker {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 28px;
      height: 28px;
      position: relative;
    }
    
    .user-location-dot {
      width: 16px;
      height: 16px;
      background-color: #2563EB;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(37, 99, 235, 0.6);
      z-index: 2;
    }
    
    .user-location-pulse {
      position: absolute;
      width: 34px;
      height: 34px;
      background-color: rgba(37, 99, 235, 0.25);
      border-radius: 50%;
      z-index: 1;
      animation: pulse 2.5s infinite ease-in-out;
    }
    
    @keyframes pulse {
      0% {
        transform: scale(0.5);
        opacity: 0.85;
      }
      100% {
        transform: scale(2.2);
        opacity: 0;
      }
    }

    /* ── Center Pin (Rapido-style, hidden by default) ──── */
    .center-pin {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -100%);
      z-index: 9999;
      pointer-events: none;
      display: none;
      filter: drop-shadow(0 3px 8px rgba(0,0,0,0.35));
      transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
      will-change: transform;
    }
    .center-pin.visible { display: block; }
    .center-pin.lifting {
      transform: translate(-50%, -100%) translateY(-18px) scale(1.08);
    }
    .center-pin i {
      font-size: 52px;
      color: #EA4335;
    }
    .center-pin-dot {
      position: fixed;
      top: 50%;
      left: 50%;
      width: 12px;
      height: 5px;
      background: rgba(0,0,0,0.22);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 9998;
      pointer-events: none;
      display: none;
      transition: transform 0.22s ease-out, opacity 0.22s ease-out;
    }
    .center-pin-dot.visible { display: block; }
    .center-pin-dot.lifting {
      transform: translate(-50%, -50%) scaleX(0.4);
      opacity: 0.1;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <!-- Rapido-style center pin (toggled from React Native) -->
  <div id="centerPin" class="center-pin"><i class="material-icons">location_on</i></div>
  <div id="centerPinDot" class="center-pin-dot"></div>
  
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/supercluster@8.0.1/dist/supercluster.min.js"></script>
  
  <script>
    // ── Tile Cache (injected by React Native) ─────────────────────
    var tileCache = {};
    
    // Batch CACHE_TILE requests — reduced to 150ms for faster tile injection
    var pendingCacheTiles = [];
    var cacheTimer = null;
    function queueTileForCache(z, x, y) {
      pendingCacheTiles.push({ z: z, x: x, y: y });
      if (!cacheTimer) {
        cacheTimer = setTimeout(function() {
          if (window.ReactNativeWebView && pendingCacheTiles.length > 0) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'CACHE_TILES',
              tiles: pendingCacheTiles
            }));
            pendingCacheTiles = [];
          }
          cacheTimer = null;
        }, 150); // FIX P3: 150ms (was 500ms) — tiles injected 3x faster
      }
    }

    // ── Custom TileLayer: local file:// first, CDN fallback ───────
    var CachedTileLayer = L.TileLayer.extend({
      createTile: function(coords, done) {
        var key = coords.z + '-' + coords.x + '-' + coords.y;
        var localPath = tileCache[key];

        var tile = document.createElement('img');
        // FIX P4: GPU compositing + async off-main-thread decode
        tile.style.transform    = 'translate3d(0,0,0)';
        tile.style.willChange   = 'transform';
        tile.decoding           = 'async';  // decode image off main thread
        tile.loading            = 'eager';  // no lazy-load hesitation
        
        var cdnUrl = L.TileLayer.prototype.getTileUrl.call(this, coords);

        L.DomEvent.on(tile, 'load', L.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', function() {
           if (tile.src !== cdnUrl) {
             tile.src = cdnUrl;
           } else {
             done('error', tile);
           }
         });

        if (this.options.crossOrigin) {
          tile.crossOrigin = '';
        }
        tile.alt = '';
        tile.setAttribute('role', 'presentation');

        if (localPath) {
          tile.src = localPath;
        } else {
          tile.src = cdnUrl;
          queueTileForCache(coords.z, coords.x, coords.y);
        }
        return tile;
      }
    });

    // ── Leaflet Map Init ─────────────────────────────────────────────────────
    // FIX P1: tuned options for 90fps zoom-in AND zoom-out
    var map = L.map('map', {
      zoomSnap: 0,                    // Fractional zoom — silky smooth
      zoomDelta: 0.5,                 // FIX P1: 0.25→0.5, fewer redraws per pinch step
      zoomAnimationThreshold: 8,
      keepBuffer: 4,                  // FIX P1: 1→4, wider prefetch ring
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true,
      preferCanvas: true,
      updateWhenZooming: true,        // Fetch tiles DURING zoom pinch, not after
      updateWhenIdle: false,          // FIX P4: render during movement, not just after stop
      updateInterval: 50,             // FIX P1: 100→50ms, tiles refresh 2× faster
      wheelPxPerZoomLevel: 120,       // FIX P1: prevents tile thrashing on trackpad/pinch
      worldCopyJump: false,           // FIX P1: prevents needless tile re-requests on wrap
      maxZoom: 19,
      minZoom: 3,
      attributionControl: false,
      zoomControl: false,
      inertia: true,
      inertiaDeceleration: 2000,
      inertiaMaxSpeed: 2500,
      easeLinearity: 0.08,
      bounceAtZoomLimits: false
    }).setView([28.4089, 77.3178], 14);

    // ── 3-LAYER TILE SANDWICH — zero blank moments at any zoom ───────────────
    // Layer 1 (bottom): zoom10 tiles scaled up — covers all zooms, always ready
    // Layer 2 (middle): zoom14 tiles — crisp mid-zoom coverage
    // Layer 3 (top):    zoom18 tiles — full detail, main visible layer
    // At any zoom level, at least one layer always has pre-loaded tiles.

    // Layer 1 — Blur/base (zoom10 max, full opacity, no blur filter)
    map.createPane('blurTiles');
    map.getPane('blurTiles').style.zIndex = 190;

    var blurLayer = new CachedTileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      {
        pane: 'blurTiles',
        maxNativeZoom: 10,   // FIX P2: 12→10, zoom10 tiles scale more smoothly
        maxZoom: 19,
        subdomains: 'ab',    // FIX P8: 'abcd'→'ab', fewer DNS lookups
        detectRetina: false, // skip retina on fallback — saves bandwidth
        keepBuffer: 6,       // FIX P2: 4→6, aggressively pre-fill wide area
        opacity: 1,          // FIX P2: full opacity — this IS the safety net
        className: 'blur-fallback'
      }
    );
    blurLayer.addTo(map);

    // Layer 2 — Mid (zoom14 native max, fills gap between blur and main)
    map.createPane('midTiles');
    map.getPane('midTiles').style.zIndex = 195;

    var midLayer = new CachedTileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      {
        pane: 'midTiles',
        maxNativeZoom: 14,   // covers zoom 14 natively, upscales for 15-19
        maxZoom: 19,
        subdomains: 'ab',    // FIX P8: fewer DNS lookups
        detectRetina: false, // skip retina on mid layer — saves bandwidth
        keepBuffer: 4,
        opacity: 1,
        className: 'mid-fallback'
      }
    );
    midLayer.addTo(map);

    // Layer 3 — Main (zoom18 native, full detail)
    var mainTileLayer = new CachedTileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        maxNativeZoom: 18,   // CDN goes to 18, Leaflet upscales for 19
        keepBuffer: 4,       // FIX P4: 3→4
        subdomains: 'ab',    // FIX P8: 'abcd'→'ab'
        detectRetina: false, // FIX P4: disable retina — halves tile count, doubles speed
        updateWhenIdle: false,
        tileSize: 256,
        opacity: 1
      }
    );
    mainTileLayer.addTo(map);

    // ── Supercluster (spatial indexing — replaces markercluster) ───
    var cluster = new Supercluster({
      radius: 60,
      maxZoom: 16,
      minPoints: 2
    });

    var activeMarkers = [];
    var lastPins = [];
    var currentUserLocation = null;
    window.lastSelectedPinLatLng = null;

    // Helper to map Material icon names to gorgeous Emojis for the Snapchat speech bubble
    function getEmojiForIcon(iconName) {
      switch (iconName) {
        case 'sports_soccer':     return '⚽';
        case 'local_cafe':        return '☕';
        case 'music_note':        return '🎵';
        case 'sports_basketball': return '🏀';
        case 'sports_gaming':     return '🎮';
        case 'sports_tennis':     return '🎾';
        case 'restaurant':        return '🍔';
        case 'movie':             return '🎬';
        case 'shopping_bag':      return '🛍️';
        case 'party_mode':        return '🎉';
        case 'location_on':
        default:
          return '📍';
      }
    }

    function buildPinHtml(pin) {
      var activityEmoji = getEmojiForIcon(pin.icon);
      var accentColor   = pin.color || '#2563EB';
      var isHostClass   = pin.isHost ? ' host-bubble' : '';

      // ── Avatars inside the bubble ───────────────────────────
      var avatarsHtml = '';
      if (pin.avatars && pin.avatars.length > 0) {
        avatarsHtml += '<div class="bubble-avatars">';
        var showCount = Math.min(pin.avatars.length, 3);
        for (var i = 0; i < showCount; i++) {
          avatarsHtml += '<img src="' + pin.avatars[i] + '" class="bubble-avatar" />';
        }
        if (pin.avatars.length > 3) {
          avatarsHtml += '<div class="bubble-avatar-count">+' + (pin.avatars.length - 3) + '</div>';
        }
        avatarsHtml += '</div>';
      }

      return (
        '<div class="snap-marker-container">' +
          // Ground glow halo matching pin color
          '<div class="vibe-halo" style="background: radial-gradient(circle, ' + accentColor + '77 0%, transparent 70%);"></div>' +

          // ── The Floating Bubble ────────────────────────────────────
          '<div class="floating-bubble' + isHostClass + '">' +
            
            // Left: Emoji + Title
            '<div class="bubble-left">' +
              '<span class="bubble-emoji">' + activityEmoji + '</span>' +
              '<span class="bubble-title">' + pin.title + '</span>' +
            '</div>' +

            // Right: Avatars (only if present)
            avatarsHtml +

            // Bottom Pointer (down arrow)
            '<div class="bubble-pointer"></div>' +

          '</div>' +
        '</div>'
      );
    }

    function reloadSupercluster() {
      var features = [];

      // 1. Convert all activity pins to GeoJSON features
      lastPins.forEach(function(p) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [p.lng, p.lat]
          },
          properties: Object.assign({}, p, { isUserLocation: false })
        });
      });

      // 2. Convert user location to a GeoJSON feature (so it clusters with the activities!)
      if (currentUserLocation) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [currentUserLocation.lng, currentUserLocation.lat]
          },
          properties: {
            isUserLocation: true,
            id: 'user-loc-pin',
            color: '#856CE2',
            title: 'Me'
          }
        });
      }

      cluster.load(features);
      renderPins();
    }

    function renderPins() {
      // Clear existing markers
      activeMarkers.forEach(function(m) { map.removeLayer(m); });
      activeMarkers = [];

      var bounds = map.getBounds();
      var bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
      ];
      var zoom = Math.floor(map.getZoom());
      var points = cluster.getClusters(bbox, zoom);

      points.forEach(function(point) {
        var lng = point.geometry.coordinates[0];
        var lat = point.geometry.coordinates[1];
        var isCluster = point.properties.cluster;

        if (isCluster) {
          // Cluster badge (contains user count if user location is in the cluster!)
          var count = point.properties.point_count;
          var size = Math.min(30 + count * 2, 52);
          var icon = L.divIcon({
            className: 'leaflet-div-icon',
            html: '<div class="vibe-cluster" style="width:' + size + 'px;height:' + size + 'px;">' +
              point.properties.point_count_abbreviated + '</div>',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          var marker = L.marker([lat, lng], { icon: icon });
          marker.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            // Zoom into cluster
            var expansionZoom = cluster.getClusterExpansionZoom(point.id);
            if (window.flyToWithOffset) {
              window.flyToWithOffset(lat, lng, Math.min(expansionZoom, 18), 0.4);
            } else {
              map.flyTo([lat, lng], Math.min(expansionZoom, 18), { duration: 0.4 });
            }
          });
          marker.addTo(map);
          activeMarkers.push(marker);
        } else {
          if (point.properties.isUserLocation) {
            // Render User location dot if not clustered
            var userIcon = L.divIcon({
              className: 'leaflet-div-icon',
              html: '<div class="user-location-marker"><div class="user-location-dot"></div><div class="user-location-pulse"></div></div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            var marker = L.marker([lat, lng], { 
              icon: userIcon,
              zIndexOffset: 1000
            }).addTo(map);
            activeMarkers.push(marker);
          } else {
            // Snapchat style bubble activity pin
            var pin = point.properties;
            var icon = L.divIcon({
              className: 'leaflet-div-icon',
              html: buildPinHtml(pin),
              iconSize: [160, 105],
              iconAnchor: [80, 105]
            });

            var marker = L.marker([lat, lng], { icon: icon });
            marker.on('click', function(e) {
              L.DomEvent.stopPropagation(e);
              window.lastSelectedPinLatLng = { lat: lat, lng: lng };
              
              if (!window.isModalOpen) {
                window.preModalMapState = {
                  center: map.getCenter(),
                  zoom: map.getZoom()
                };
              }
              
              if (window.flyToWithOffset) {
                // Pass true for forceOffset because clicking a pin will always open the modal
                window.flyToWithOffset(lat, lng, Math.max(map.getZoom(), 14), 0.5, true);
              } else {
                map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.5 });
              }

              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'MARKER_PRESS',
                  pinId: pin.id
                }));
              }
            });
            marker.addTo(map);
            activeMarkers.push(marker);
          }
        }
      });
    }

    // ── Public APIs (called from React Native) ────────────────────

    /**
     * Inject the SQLite tile cache map.
     * Format: { "z-x-y": "file:///path/to/tile.png" }
     */
    window.injectTileCache = function(cacheMap) {
      Object.assign(tileCache, cacheMap);
    };

    // ── Global Offset API ─────────────────────────────────────────
    window.isModalOpen = false;
    window.preModalMapState = null;
    
    window.setModalOpen = function(open) {
      if (window.isModalOpen === true && open === false) {
        // Modal is closing! Revert to the exact original position before it opened.
        if (window.preModalMapState) {
          map.flyTo(window.preModalMapState.center, window.preModalMapState.zoom, { duration: 0.4 });
          window.preModalMapState = null;
        }
      }
      window.isModalOpen = open;
    };

    window.flyToWithOffset = function(lat, lng, zoom, duration, forceOffset, forceNoOffset) {
      var targetZoom = zoom || map.getZoom();
      var targetPoint = map.project([lat, lng], targetZoom);
      
      if ((window.isModalOpen || forceOffset) && !forceNoOffset) {
        // Fine-tuned offset to 20%
        targetPoint.y += (window.innerHeight * 0.20);
      }
      
      var targetLatLng = map.unproject(targetPoint, targetZoom);
      map.flyTo(targetLatLng, targetZoom, { duration: duration || 0.4 });
    };

    /**
     * Update pin data and re-render.
     */
    window.updatePins = function(pins) {
      lastPins = pins;
      reloadSupercluster();
    };

    /**
     * Update user location and re-render.
     */
    window.updateUserLocation = function(lat, lng) {
      currentUserLocation = { lat: lat, lng: lng };
      reloadSupercluster();
    };

    // ── Map Events ────────────────────────────────────────────────

    // ── Center Pin API (called from React Native) ─────────────────
    var _cpPin = document.getElementById('centerPin');
    var _cpDot = document.getElementById('centerPinDot');

    window.showCenterPin = function(show) {
      if (show) {
        _cpPin.classList.add('visible');
        _cpDot.classList.add('visible');
      } else {
        _cpPin.classList.remove('visible');
        _cpDot.classList.remove('visible');
      }
    };

    // Notify React Native + lift pin when map starts moving
    map.on('movestart', function() {
      _cpPin.classList.add('lifting');
      _cpDot.classList.add('lifting');
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MAP_DRAG_START'
        }));
      }
    });

    // FIX P5: render pins 1 frame after stop (was 80ms — caused visible delay)
    var renderTimer;
    map.on('moveend zoomend', function() {
      _cpPin.classList.remove('lifting');
      _cpDot.classList.remove('lifting');

      clearTimeout(renderTimer);
      renderTimer = setTimeout(renderPins, 16); // FIX P5: 80→16ms (1 frame)

      if (window.ReactNativeWebView) {
        var center = map.getCenter();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MAP_MOVED',
          bounds: { zoom: map.getZoom() },
          center: { lat: center.lat, lng: center.lng }
        }));
      }
    });

    // FIX P5: also debounce renderPins during pan so pins stay visible while moving
    map.on('move', function() {
      clearTimeout(renderTimer);
      renderTimer = setTimeout(renderPins, 32); // re-render every 2 frames during pan
    });

    // Signal to React Native that the map is ready
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
    }
    window.isDraggingMap = false;
    map.on('dragstart', function() { window.isDraggingMap = true; });
    map.on('dragend', function() { setTimeout(function(){ window.isDraggingMap = false; }, 50); });

    // ── Handle Map Clicks to dismiss modal ────────────────────────
    map.on('click', function(e) {
      if (window.isDraggingMap) return;
      if (window.isModalOpen) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_PRESS'
          }));
        }
      }
    });
  </script>
</body>
</html>
`;
