import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import CompassHeading from 'react-native-compass-heading';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, CText, ms, vs, normFont } from '../../../Reusable-Component';
import SocialShareModal from './SocialShareModal';

// ─── Inline map HTML ──────────────────────────────────────────────────────────
// Escape template-literal characters that would break the outer JS template.
const buildMapHtml = (act) => {
  const title    = (act?.title    || '').replace(/'/g, "\\'").replace(/`/g, '\\`');
  const host     = (act?.hostName || 'Unknown Host').replace(/'/g, "\\'");
  const location = (act?.location || '').replace(/'/g, "\\'");
  const time     = (act?.time     || '').replace(/'/g, "\\'");
  const duration = act?.duration  ? `${act.duration} hrs` : '';
  const emoji    = act?.emoji     || '📍';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    html,body,#map{width:100%;height:100%;margin:0;padding:0;background:#fff;
      touch-action:none;overscroll-behavior:none;-webkit-overflow-scrolling:touch;}

    /* ── GPU acceleration ─────────────────────────────────── */
    .leaflet-tile{filter:contrast(1.04) brightness(1.01)!important;}
    .leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,
    .leaflet-pane,.leaflet-map-pane,.leaflet-tile-container{
      transform:translate3d(0,0,0);will-change:transform;
      backface-visibility:hidden;-webkit-backface-visibility:hidden;}
    .blur-fallback,.mid-fallback{filter:none!important;opacity:1!important;
      transform:translate3d(0,0,0) scale(1)!important;}
    .leaflet-div-icon{background:transparent!important;border:none!important;}

    /* ── User location dot + cone ─────────────────────────── */
    .upc{position:relative;width:24px;height:24px;
         display:flex;align-items:center;justify-content:center;}
    .udot{width:14px;height:14px;border-radius:50%;background:#2563EB;
          border:3px solid #fff;
          box-shadow:0 0 0 3px rgba(37,99,235,.25),0 2px 8px rgba(37,99,235,.5);z-index:3;}
    .pring{position:absolute;width:28px;height:28px;border-radius:50%;
           background:rgba(37,99,235,.28);
           animation:pulse 2s infinite ease-out;z-index:2;}
    .hwedge{position:absolute;width:80px;height:80px;transform-origin:center center;
            z-index:1;pointer-events:none;top:-28px;left:-28px;
            /* NO CSS transition — JS RAF owns all animation */}
    @keyframes pulse{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.4);opacity:0}}

    /* ── Destination icon (Bubble Pin) ─────────────────────── */
    .snap-marker-container {
      display: flex; flex-direction: column; align-items: center;
      width: auto; min-width: 140px; max-width: 220px; 
      position: absolute; left: 0; top: 0;
      transform: translate(-50%, -100%);
      animation: snapBounce 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
      transform-origin: bottom center; will-change: transform, opacity;
    }
    @keyframes snapBounce {
      0% { transform: translate(-50%, -100%) scale(0.6) translateY(20px); opacity: 0; }
      100% { transform: translate(-50%, -100%) scale(1) translateY(0); opacity: 1; }
    }
    .floating-bubble {
      background: #FFFFFF; border-radius: 32px;
      padding: 6px 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08), 0 14px 28px rgba(0,0,0,0.14), 0 24px 48px rgba(0,0,0,0.12);
      border: 1px solid rgba(0,0,0,0.03); display: flex; flex-direction: row; align-items: center; gap: 10px;
      position: relative; z-index: 3; margin-bottom: 8px;
    }
    .bubble-pointer {
      content: ''; position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%);
      width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #FFFFFF;
      z-index: 3; filter: drop-shadow(0 4px 3px rgba(0,0,0,0.1));
    }
    .bubble-left { display: flex; flex-direction: row; align-items: center; gap: 6px; flex: 1; overflow: hidden; }
    .bubble-emoji { font-size: 20px; line-height: 1; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
    .bubble-title { font-size: 13px; font-weight: 800; color: #000000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; max-width: 140px; }
    .vibe-halo {
      position: absolute; width: 60px; height: 60px; border-radius: 50%; bottom: -10px; left: 50%; transform: translateX(-50%);
      z-index: 1; animation: haloPulse 2.4s infinite ease-in-out; pointer-events: none;
    }
    @keyframes haloPulse {
      0%   { transform: translateX(-50%) scale(0.85); opacity: 0.6; }
      50%  { transform: translateX(-50%) scale(1.35); opacity: 0.9; }
      100% { transform: translateX(-50%) scale(0.85); opacity: 0.6; }
    }

    /* ── Destination info card ────────────────────────────── */
    #destCard{
      position:fixed;
      left:50%;transform:translateX(-50%);
      bottom:calc(env(safe-area-inset-bottom,0px) + 18px);
      width:min(calc(100vw - 32px), 360px);
      background:#fff;
      border-radius:20px;
      padding:14px 16px;
      box-shadow:0 8px 32px rgba(0,0,0,.14),0 2px 8px rgba(0,0,0,.08);
      border:1px solid rgba(37,99,235,.1);
      z-index:900;
      display:none;
      flex-direction:column;
      gap:10px;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    }
    #destCard.visible{display:flex;}
    .dc-top{display:flex;align-items:center;gap:12px;}
    .dc-emoji{width:44px;height:44px;border-radius:12px;background:#FFF1F0;
              display:flex;align-items:center;justify-content:center;
              font-size:22px;flex-shrink:0;border:1px solid #FFE4E1;}
    .dc-info{flex:1;overflow:hidden;}
    .dc-title{font-size:15px;font-weight:700;color:#111827;
              white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .dc-host{font-size:11px;font-weight:500;color:#6B7280;margin-top:2px;
             white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .dc-divider{height:1px;background:#F3F4F6;margin:0 -16px;}
    .dc-meta{display:flex;flex-direction:column;gap:5px;}
    .dc-row{display:flex;align-items:center;gap:8px;font-size:12px;color:#374151;font-weight:500;}
    .dc-label{color:#9CA3AF;font-size:11px;font-weight:600;min-width:60px;}
    
    .dc-dist{
      display:flex;align-items:center;gap:8px;
      background:#F0FDF4;border:1px solid #BBF7D0;
      border-radius:12px;padding:8px 12px;}
    .dc-dist-label{font-size:12px;font-weight:600;color:#065F46;}
    .dc-dist-value{font-size:13px;font-weight:800;color:#059669;margin-left:auto;}

    /* Route duration labels on the map */
    .route-label {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      white-space: nowrap;
      pointer-events: none;
      transform: translate(-50%, -50%); /* Centers the label precisely */
    }
    .route-label.selected {
      background: #2563EB;
      border-color: #1D4ED8;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    // ── Map init ──────────────────────────────────────────────────
    var map = L.map('map',{
      zoomSnap:0,zoomDelta:0.5,zoomAnimationThreshold:8,keepBuffer:4,
      fadeAnimation:true,zoomAnimation:true,markerZoomAnimation:true,
      preferCanvas:true,updateWhenZooming:true,updateWhenIdle:false,
      updateInterval:50,wheelPxPerZoomLevel:120,worldCopyJump:false,
      maxZoom:19,minZoom:3,attributionControl:false,zoomControl:false,
      inertia:true,inertiaDeceleration:2000,inertiaMaxSpeed:2500,
      easeLinearity:0.08,bounceAtZoomLimits:false
    }).setView([28.4089,77.3178],14);

    // ── 3-Layer tile sandwich ─────────────────────────────────────
    map.createPane('p1');map.getPane('p1').style.zIndex=190;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      {pane:'p1',maxNativeZoom:10,maxZoom:19,subdomains:'ab',
       detectRetina:false,keepBuffer:6,opacity:1,className:'blur-fallback'}).addTo(map);

    map.createPane('p2');map.getPane('p2').style.zIndex=195;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      {pane:'p2',maxNativeZoom:14,maxZoom:19,subdomains:'ab',
       detectRetina:false,keepBuffer:4,opacity:1,className:'mid-fallback'}).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      {maxZoom:19,maxNativeZoom:18,keepBuffer:4,subdomains:'ab',
       detectRetina:false,updateWhenIdle:false,tileSize:256,opacity:1}).addTo(map);

    // ── State ─────────────────────────────────────────────────────
    var userMarker=null,destMarker=null;
    var routeLines = []; // Store multiple route layers
    var routeBgs = [];
    var routeLabels = [];
    var allRoutesData = [];

    // ── Heading system ────────────────────────────────────────────
    var currentHeading = 0;
    var targetHeading  = 0;
    var headingAnimId  = null;

    function lerpAngle(a,b,t){var d=((b-a+540)%360)-180;return a+d*t;}

    function getWedge(){
      return document.querySelector('.hwedge');
    }

    function animateToTarget(){
      var diff=((targetHeading-currentHeading+540)%360)-180;
      if(Math.abs(diff)>0.3){
        currentHeading=lerpAngle(currentHeading,targetHeading,0.20);
        var w=getWedge();
        if(w)w.style.transform='rotate('+currentHeading+'deg)';
        headingAnimId=requestAnimationFrame(animateToTarget);
      } else {
        currentHeading=targetHeading;
        var w=getWedge();
        if(w)w.style.transform='rotate('+currentHeading+'deg)';
        headingAnimId=null;
      }
    }

    function applyHeading(h){
      if(h==null||isNaN(h))return;
      targetHeading=((h%360)+360)%360;
      if(!headingAnimId)headingAnimId=requestAnimationFrame(animateToTarget);
    }

    // ── Build user icon HTML ──────────────────────────────────────
    function buildUserIcon(h){
      return '<div class="upc">'+
        '<div class="pring"></div>'+
        '<div class="hwedge" style="transform:rotate('+(((h||0)%360+360)%360)+'deg);">'+
          '<svg width="80" height="80" viewBox="0 0 80 80">'+
            '<defs><radialGradient id="cg" cx="50%" cy="100%" r="75%">'+
              '<stop offset="0%" stop-color="rgba(37,99,235,.72)"/>'+
              '<stop offset="60%" stop-color="rgba(37,99,235,.15)"/>'+
              '<stop offset="100%" stop-color="rgba(37,99,235,0)"/>'+
            '</radialGradient></defs>'+
            '<path d="M40 40 L26 5 A 38 38 0 0 1 54 5 Z" fill="url(#cg)"/>'+
          '</svg>'+
        '</div>'+
        '<div class="udot"></div>'+
        '</div>';
    }

    // ── Build destination pin HTML ────────────────────────────────
    function buildDestIcon(){
      var accentColor = '#2563EB';
      return '<div class="snap-marker-container">' +
          '<div class="vibe-halo" style="background: radial-gradient(circle, ' + accentColor + '77 0%, transparent 70%);"></div>' +
          '<div class="floating-bubble">' +
            '<div class="bubble-left">' +
              '<span class="bubble-emoji">${emoji}</span>' +
              '<span class="bubble-title">${title}</span>' +
            '</div>' +
            '<div class="bubble-pointer"></div>' +
          '</div>' +
        '</div>';
    }

    // ── Public APIs (called from React Native via injectJavaScript) ─
    window.updateUserHeading=function(h){applyHeading(h);};

    window.updateUserPosition=function(lat,lng,h){
      try{
        if(userMarker){userMarker.setLatLng([lat,lng]);}
        else{
          var ic=L.divIcon({html:buildUserIcon(currentHeading),
            className:'',iconSize:[24,24],iconAnchor:[12,12]});
          userMarker=L.marker([lat,lng],{icon:ic,zIndexOffset:1000}).addTo(map);
        }
        if(h!=null&&h>=0)applyHeading(h);
      }catch(e){console.error(e);}
    };

    window.updateRoutes=function(uLat,uLng,dLat,dLng,routesJson){
      try{
        if(userMarker) map.removeLayer(userMarker);
        if(destMarker) map.removeLayer(destMarker);

        // Clean old routes
        routeLines.forEach(l => map.removeLayer(l));
        routeBgs.forEach(l => map.removeLayer(l));
        routeLabels.forEach(l => map.removeLayer(l));
        routeLines = [];
        routeBgs = [];
        routeLabels = [];

        var uic=L.divIcon({html:buildUserIcon(currentHeading),
          className:'',iconSize:[24,24],iconAnchor:[12,12]});
        userMarker=L.marker([uLat,uLng],{icon:uic,zIndexOffset:1000}).addTo(map);
        if(!headingAnimId)headingAnimId=requestAnimationFrame(animateToTarget);

        var dic=L.divIcon({html:buildDestIcon(),
          className:'leaflet-div-icon',iconSize:null,iconAnchor:[0,0]});
        destMarker=L.marker([dLat,dLng],{icon:dic}).addTo(map);

        var card=document.getElementById('destCard');
        if(card)card.classList.add('visible');

        var routes = JSON.parse(routesJson);
        allRoutesData = routes;
        
        if(routes && routes.length > 0){
          // Helper to draw a single route
          const drawRoute = (r, isSelected) => {
            var color = isSelected ? '#2563EB' : '#94A3B8';
            var bgColor = isSelected ? '#93C5FD' : '#E2E8F0';
            
            var bg = L.polyline(r.coords, {
              color: bgColor, weight: 12, opacity: isSelected ? 0.35 : 0.6,
              lineCap:'round', lineJoin:'round', interactive: true, smoothFactor: 1.5
            }).addTo(map);
            
            var line = L.polyline(r.coords, {
              color: color, weight: 5, opacity: isSelected ? 1 : 0.8,
              lineCap:'round', lineJoin:'round', interactive: true, smoothFactor: 1.5
            }).addTo(map);

            // Add duration label at the middle of the route
            var midPointIndex = Math.floor(r.coords.length / 2);
            var midPoint = r.coords[midPointIndex];
            
            var labelIcon = L.divIcon({
              className: '',
              html: \`
              <div class="route-label \${isSelected ? 'selected' : ''}">\${r.durationText}</div>
              \`.trim(),
              iconSize: null
            });
            var labelMarker = L.marker(midPoint, {icon: labelIcon, interactive: false}).addTo(map);
            routeLabels.push(labelMarker);

            // Click to select route
            const onClick = () => {
              if(!isSelected) {
                window.selectRoute(r.id);
                // Notify React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ROUTE_SELECTED', id: r.id }));
              }
            };
            bg.on('click', onClick);
            line.on('click', onClick);

            routeBgs.push(bg);
            routeLines.push(line);
          };

          window.selectRoute = function(selectedId) {
            // Clear old layers
            routeLines.forEach(l => map.removeLayer(l));
            routeBgs.forEach(l => map.removeLayer(l));
            routeLabels.forEach(l => map.removeLayer(l));
            routeLines = [];
            routeBgs = [];
            routeLabels = [];

            // Draw unselected first (underneath)
            allRoutesData.forEach(r => {
              if (r.id !== selectedId) drawRoute(r, false);
            });
            // Draw selected last (on top)
            var sel = allRoutesData.find(r => r.id === selectedId) || allRoutesData[0];
            drawRoute(sel, true);

            // Update bottom card distance
            var dRow=document.getElementById('dcDist');
            var dVal=document.getElementById('dcDistValue');
            if(dRow&&dVal){dRow.style.display='flex';dVal.textContent=sel.durationText+' \u00B7 '+sel.distanceText;}
          };

          window.selectRoute(routes[0].id);
          map.fitBounds(L.latLngBounds(routes[0].coords), {padding:[80,100]});
        }
      }catch(e){console.error(e);}
    };
  </script>
</body>
</html>`;
};

// ─── ActivityMapModal ─────────────────────────────────────────────────────────
const ActivityMapModal = ({ visible, onClose, activity }) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);
  const [loading, setLoading]       = useState(true);
  const [routeInfo, setRouteInfo]   = useState({ duration: '', distance: '' });
  const [userLocation, setUserLocation] = useState({ lat: 28.4089, lng: 77.3178 });
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [mapHtml, setMapHtml] = useState('');
  
  const allRoutesRef = useRef([]);

  // Build map HTML only when activity changes
  useEffect(() => {
    if (activity) setMapHtml(buildMapHtml(activity));
  }, [activity]);

  // Track last known valid heading so we don't send null when stationary
  const lastHeadingRef = useRef(null);

  useEffect(() => {
    let watchId = null;
    let compassStarted = false;

    if (visible && activity) {
      setLoading(true);
      setRouteInfo({ duration: '', distance: '' });
      lastHeadingRef.current = null;
      allRoutesRef.current = [];

      // ── 1. Start Real Magnetometer Compass ──────────────────────
      try {
        CompassHeading.start(3, ({ heading, accuracy }) => {
          if (heading >= 0) {
            lastHeadingRef.current = heading;
            webViewRef.current?.injectJavaScript(
              `if(window.updateUserHeading)window.updateUserHeading(${heading});true;`
            );
          }
        });
        compassStarted = true;
      } catch (err) {
        console.warn('Compass sensor not available or permission denied:', err);
      }

      // ── 2. Geolocation Tracking ────────────────────────────────
      Geolocation.getCurrentPosition(
        (pos) => {
          const uCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(uCoords);
          fetchRoute(uCoords, activity);
        },
        () => fetchRoute(userLocation, activity),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );

      watchId = Geolocation.watchPosition(
        (pos) => {
          const uCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(uCoords);

          // We use compass heading from react-native-compass-heading as primary.
          // Fallback to GPS heading if compass isn't running.
          if (!compassStarted && pos.coords.heading >= 0 && !isNaN(pos.coords.heading)) {
            lastHeadingRef.current = pos.coords.heading;
          }
          
          const h = lastHeadingRef.current;
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(
              `if(window.updateUserPosition)window.updateUserPosition(${pos.coords.latitude},${pos.coords.longitude},${h !== null ? h : 'null'});true;`
            );
            if (h !== null && !compassStarted) {
              webViewRef.current.injectJavaScript(
                `if(window.updateUserHeading)window.updateUserHeading(${h});true;`
              );
            }
          }
        },
        (err) => console.warn('[ActivityMapModal] watch error:', err),
        { enableHighAccuracy: true, distanceFilter: 0, interval: 300, fastestInterval: 150, forceRequestLocation: true }
      );
    }
    
    return () => { 
      if (watchId !== null) Geolocation.clearWatch(watchId); 
      if (compassStarted) CompassHeading.stop();
    };
  }, [visible, activity]);

  const fetchRoute = async (userLoc, act) => {
    try {
      const uLng = userLoc.lng, uLat = userLoc.lat;
      const dLng = act.lng || 77.3125, dLat = act.lat || 28.4105;
      // Added alternatives=true for multiple routes
      const url = `https://router.project-osrm.org/route/v1/bicycle/${uLng},${uLat};${dLng},${dLat}?geometries=geojson&overview=full&alternatives=true`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data?.routes?.length > 0) {
        // Parse all routes
        const parsedRoutes = data.routes.map((route, index) => {
          const mins  = Math.max(1, Math.round(route.duration / 60));
          const kms   = (route.distance / 1000).toFixed(1);
          const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
          return {
            id: index,
            coords,
            durationText: `${mins} min`,
            distanceText: `${kms} km`,
            fullDuration: `${mins} min by bike 🚲`,
            fullDistance: `${kms} km away`
          };
        });

        allRoutesRef.current = parsedRoutes;
        
        // Initial selected route is index 0
        setRouteInfo({ 
          duration: parsedRoutes[0].fullDuration, 
          distance: parsedRoutes[0].fullDistance 
        });

        if (webViewRef.current) {
          const safeRoutes = JSON.stringify(parsedRoutes).replace(/'/g, "\\'");
          webViewRef.current.injectJavaScript(
            `if(window.updateRoutes)window.updateRoutes(${uLat},${uLng},${dLat},${dLng},'${safeRoutes}');true;`
          );
        }
      } else {
        setRouteInfo({ duration: '~10 min by bike 🚲', distance: '~1.8 km away' });
      }
    } catch {
      setRouteInfo({ duration: '~12 min by bike 🚲', distance: '~2.1 km away' });
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ROUTE_SELECTED') {
        const selRoute = allRoutesRef.current.find(r => r.id === data.id);
        if (selRoute) {
          setRouteInfo({ 
            duration: selRoute.fullDuration, 
            distance: selRoute.fullDistance 
          });
        }
      }
    } catch(e) {}
  };

  const handleGetDirections = () => {
    const dLat = activity?.lat || 28.4105;
    const dLng = activity?.lng || 77.3125;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${dLat},${dLng}&travelmode=bicycling`
    ).catch(console.error);
  };

  if (!activity) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>

        {/* ── WebView Map ───────────────────────────────────────── */}
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.map}
          domStorageEnabled
          javaScriptEnabled
          cacheEnabled
          androidLayerType="hardware"
          renderToHardwareTextureAndroid
          onMessage={handleMessage}
          onLoadEnd={() => { if (userLocation) fetchRoute(userLocation, activity); }}
        />



        {/* ── Loading overlay ───────────────────────────────────── */}
        {loading && (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loaderText}>Plotting your route…</Text>
          </View>
        )}

        {/* ── Bottom Route Card ─────────────────────────────────── */}
        <View style={[styles.bottomCard, { bottom: Math.max(insets.bottom, vs(16)) }]}>

          <View style={styles.routeRow}>
            <View style={styles.routeIcon}>
              <MaterialIcons name="directions-bike" size={ms(22)} color="#2563EB" />
            </View>
            <View style={styles.routeTexts}>
              <Text style={styles.routeDur}>{routeInfo.duration || 'Calculating…'}</Text>
              <Text style={styles.routeDist}>{routeInfo.distance || 'Loading distance…'}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleGetDirections}>
              <MaterialIcons name="directions" size={ms(18)} color="#fff" />
              <Text style={styles.primaryBtnTxt}>Get Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85} onPress={() => setShareModalVisible(true)}>
              <Ionicons name="share-social-outline" size={ms(18)} color="#2563EB" />
              <Text style={styles.secondaryBtnTxt}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SocialShareModal
          visible={shareModalVisible}
          onClose={() => setShareModalVisible(false)}
          activity={activity}
        />
      </View>
    </Modal>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  map: { flex: 1 },



  loaderWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.84)',
    justifyContent: 'center', alignItems: 'center', zIndex: 9,
  },
  loaderText: { marginTop: vs(10), fontSize: normFont(13), color: '#6B7280', fontWeight: '500' },

  bottomCard: {
    position: 'absolute', left: ms(16), right: ms(16),
    backgroundColor: '#FFFFFF', borderRadius: ms(24),
    padding: ms(18),
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 10,
    zIndex: 10, borderWidth: 1, borderColor: 'rgba(37,99,235,0.08)',
  },

  routeRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: vs(16), gap: ms(12),
  },
  routeIcon: {
    width: ms(46), height: ms(46), borderRadius: ms(23),
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  routeTexts: { flex: 1 },
  routeDur: { fontSize: normFont(15), fontWeight: '700', color: '#111827', letterSpacing: -0.2 },
  routeDist: { fontSize: normFont(12), fontWeight: '500', color: '#6B7280', marginTop: vs(2) },

  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: ms(5),
    backgroundColor: '#ECFDF5', paddingHorizontal: ms(10),
    paddingVertical: vs(5), borderRadius: ms(12),
    borderWidth: 1, borderColor: '#D1FAE5',
  },
  liveDot: { width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: '#10B981' },
  liveText: { fontSize: normFont(10), fontWeight: '800', color: '#059669', letterSpacing: 0.6 },

  btnRow: { flexDirection: 'row', gap: ms(10) },
  primaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: ms(8),
    backgroundColor: '#2563EB', borderRadius: ms(16), paddingVertical: vs(13),
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  primaryBtnTxt: { fontSize: normFont(14), fontWeight: '700', color: '#fff', letterSpacing: -0.1 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: ms(8),
    backgroundColor: '#EFF6FF', borderRadius: ms(16), paddingVertical: vs(13),
    borderWidth: 1.5, borderColor: '#BFDBFE',
  },
  secondaryBtnTxt: { fontSize: normFont(14), fontWeight: '700', color: '#2563EB', letterSpacing: -0.1 },
});

export default ActivityMapModal;
