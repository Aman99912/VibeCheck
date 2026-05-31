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
            transition:transform .15s linear;}
    @keyframes pulse{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.4);opacity:0}}

    /* ── Destination icon ─────────────────────────────────── */
    .dicon{display:flex;align-items:center;justify-content:center;
           filter:drop-shadow(0 6px 12px rgba(239,68,68,.45));}

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
    .dc-badge{
      display:inline-flex;align-items:center;gap:4px;
      background:#EFF6FF;border:1px solid #BFDBFE;
      border-radius:20px;padding:3px 10px;
      font-size:11px;font-weight:700;color:#2563EB;}
    .dc-dist{
      display:flex;align-items:center;gap:8px;
      background:#F0FDF4;border:1px solid #BBF7D0;
      border-radius:12px;padding:8px 12px;}
    .dc-dist-label{font-size:12px;font-weight:600;color:#065F46;}
    .dc-dist-value{font-size:13px;font-weight:800;color:#059669;margin-left:auto;}
  </style>
</head>
<body>
  <div id="map"></div>

  <!-- Destination Info Card (inside WebView, anchored above bottom card) -->
  <div id="destCard">
    <div class="dc-top">
      <div class="dc-emoji">${emoji}</div>
      <div class="dc-info">
        <div class="dc-title">${title}</div>
        <div class="dc-host">Hosted by ${host}</div>
      </div>
    </div>
    <div class="dc-divider"></div>
    <div class="dc-meta">
      <div class="dc-row">
        <span class="dc-label">📍 Venue</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${location}</span>
      </div>
      ${time ? `<div class="dc-row"><span class="dc-label">⏰ Time</span><span>${time}</span></div>` : ''}
      ${duration ? `<div class="dc-row"><span class="dc-label">⌛ Duration</span><span>${duration}</span></div>` : ''}
    </div>
    <div id="dcDist" class="dc-dist" style="display:none">
      <span>🚲</span>
      <span class="dc-dist-label">Estimated ride</span>
      <span class="dc-dist-value" id="dcDistValue">—</span>
    </div>
  </div>

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
    var userMarker=null,destMarker=null,routeLineBg=null,routeLine=null;

    // ── Sensor-fusion heading ─────────────────────────────────────
    // Strategy:
    //  • currentHeading  = display angle (smoothed)
    //  • compassHeading  = absolute heading from magnetometer (slow, accurate)
    //  • gyroHeading     = heading integrated from gyro (fast, drifts)
    //  • lastGyroTime    = timestamp for gyro integration
    //  • blend: gyroHeading corrected toward compassHeading at ~5% per tick
    var compassHeading = null;  // from deviceorientationabsolute / webkitCompassHeading
    var gyroHeading    = null;  // integrated from DeviceMotion.rotationRate.alpha (deg/s)
    var lastGyroTime   = null;
    var currentHeading = 0;
    var targetHeading  = 0;
    var headingAnimId  = null;

    function lerpAngle(a,b,t){var d=((b-a+540)%360)-180;return a+d*t;}

    function animateToTarget(){
      var diff=((targetHeading-currentHeading+540)%360)-180;
      if(Math.abs(diff)>0.25){
        currentHeading=lerpAngle(currentHeading,targetHeading,0.18);
        var w=document.getElementById('uHW');
        if(w)w.style.transform='rotate('+currentHeading+'deg)';
        headingAnimId=requestAnimationFrame(animateToTarget);
      } else {
        currentHeading=targetHeading;
        var w=document.getElementById('uHW');
        if(w)w.style.transform='rotate('+currentHeading+'deg)';
        headingAnimId=null;
      }
    }

    function applyHeading(h){
      if(h==null||isNaN(h))return;
      // Normalise to [0,360)
      targetHeading=((h%360)+360)%360;
      if(!headingAnimId)headingAnimId=requestAnimationFrame(animateToTarget);
    }

    // Compass (magnetometer absolute) — primary authority
    function onCompass(h){
      compassHeading=h;
      // If gyro available, we'll blend; otherwise use compass directly
      if(gyroHeading===null){applyHeading(h);}
    }

    // Gyro integration — gives smooth, fast heading between compass samples
    function onGyroAlpha(alphaDegPerSec, ts){
      if(lastGyroTime===null){lastGyroTime=ts;return;}
      var dt=(ts-lastGyroTime)/1000; // seconds
      lastGyroTime=ts;
      if(dt<=0||dt>0.5)return; // sanity
      // Integrate rotation (negate on Android; alpha is CCW)
      var delta=-alphaDegPerSec*dt;
      gyroHeading=(gyroHeading!==null?gyroHeading:currentHeading)+delta;
      // Blend gyro toward compass (5% correction per frame) to kill drift
      if(compassHeading!==null){
        gyroHeading=lerpAngle(gyroHeading,compassHeading,0.05);
      }
      applyHeading(gyroHeading);
    }

    // ── Device orientation listeners ──────────────────────────────
    // 1. Absolute compass (Android Chrome, some Android WebViews)
    window.addEventListener('deviceorientationabsolute',function(e){
      if(e.alpha===null||e.alpha===undefined)return;
      // alpha is CCW from North in Chromium; compass heading = 360-alpha
      var h=((360-e.alpha)%360+360)%360;
      onCompass(h);
    },true);

    // 2. iOS Safari (webkitCompassHeading is directly CW from North)
    window.addEventListener('deviceorientation',function(e){
      if(e.webkitCompassHeading!=null&&e.webkitCompassHeading>=0){
        onCompass(e.webkitCompassHeading);
      } else if(e.absolute&&e.alpha!=null){
        onCompass(((360-e.alpha)%360+360)%360);
      }
    },true);

    // 3. iOS 13+ permission-gated
    if(typeof DeviceOrientationEvent!=='undefined'&&
       typeof DeviceOrientationEvent.requestPermission==='function'){
      DeviceOrientationEvent.requestPermission()
        .then(function(s){
          if(s==='granted'){
            window.addEventListener('deviceorientation',function(e){
              if(e.webkitCompassHeading!=null&&e.webkitCompassHeading>=0)
                onCompass(e.webkitCompassHeading);
            },true);
          }
        }).catch(function(){});
    }

    // 4. DeviceMotion — gyroscope (rotationRate.alpha = yaw deg/s)
    window.addEventListener('devicemotion',function(e){
      var rr=e.rotationRate;
      if(rr&&rr.alpha!=null&&!isNaN(rr.alpha)){
        onGyroAlpha(rr.alpha,e.timeStamp||performance.now());
      }
    },true);

    // ── Build user icon HTML ──────────────────────────────────────
    function buildUserIcon(h){
      return '<div class="upc">'+
        '<div class="pring"></div>'+
        '<div class="hwedge" id="uHW" style="transform:rotate('+(h||0)+'deg);">'+
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
      return '<svg width="36" height="48" viewBox="0 0 24 32" fill="none">'+
        '<path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="url(#pg)"/>'+
        '<circle cx="12" cy="12" r="5.5" fill="#fff" fill-opacity=".95"/>'+
        '<circle cx="12" cy="12" r="3" fill="url(#pg2)"/>'+
        '<defs>'+
          '<linearGradient id="pg" x1="12" y1="0" x2="12" y2="32" gradientUnits="userSpaceOnUse">'+
            '<stop offset="0%" stop-color="#FF5A5F"/>'+
            '<stop offset="100%" stop-color="#B91C1C"/>'+
          '</linearGradient>'+
          '<radialGradient id="pg2" cx="50%" cy="50%" r="50%">'+
            '<stop offset="0%" stop-color="#FF8082"/>'+
            '<stop offset="100%" stop-color="#EF4444"/>'+
          '</radialGradient>'+
        '</defs>'+
      '</svg>';
    }

    // ── Public APIs ───────────────────────────────────────────────

    // Injected from RN when GPS heading is available (moving)
    window.updateUserHeading=function(h){applyHeading(h);};

    window.updateUserPosition=function(lat,lng,h){
      try{
        if(userMarker){userMarker.setLatLng([lat,lng]);}
        else{
          var ic=L.divIcon({html:buildUserIcon(currentHeading),
            className:'',iconSize:[24,24],iconAnchor:[12,12]});
          userMarker=L.marker([lat,lng],{icon:ic,zIndexOffset:1000}).addTo(map);
        }
        // Only override heading with GPS heading if it's valid and user is moving
        if(h!==null&&h>=0)applyHeading(h);
      }catch(e){console.error(e);}
    };

    window.updateRoute=function(uLat,uLng,dLat,dLng,coordsJson,distText,durText){
      try{
        if(userMarker) map.removeLayer(userMarker);
        if(destMarker) map.removeLayer(destMarker);
        if(routeLineBg)map.removeLayer(routeLineBg);
        if(routeLine)  map.removeLayer(routeLine);

        // User marker
        var uic=L.divIcon({html:buildUserIcon(currentHeading),
          className:'',iconSize:[24,24],iconAnchor:[12,12]});
        userMarker=L.marker([uLat,uLng],{icon:uic,zIndexOffset:1000}).addTo(map);

        // Dest pin
        var dic=L.divIcon({html:buildDestIcon(),
          className:'dicon',iconSize:[36,48],iconAnchor:[18,48]});
        destMarker=L.marker([dLat,dLng],{icon:dic}).addTo(map);

        // Show info card
        var card=document.getElementById('destCard');
        if(card)card.classList.add('visible');
        // Update distance row
        if(distText){
          var dRow=document.getElementById('dcDist');
          var dVal=document.getElementById('dcDistValue');
          if(dRow&&dVal){dRow.style.display='flex';dVal.textContent=durText+' · '+distText;}
        }

        // Route polylines
        var coords=JSON.parse(coordsJson);
        if(coords&&coords.length>0){
          routeLineBg=L.polyline(coords,{color:'#93C5FD',weight:11,opacity:.3,
            lineCap:'round',lineJoin:'round'}).addTo(map);
          routeLine=L.polyline(coords,{color:'#2563EB',weight:4.5,opacity:.96,
            lineCap:'round',lineJoin:'round'}).addTo(map);
          map.fitBounds(L.latLngBounds(coords),{padding:[80,80]});
        } else {
          var fb=[[uLat,uLng],[dLat,dLng]];
          routeLineBg=L.polyline(fb,{color:'#93C5FD',weight:11,opacity:.3,
            lineCap:'round',lineJoin:'round'}).addTo(map);
          routeLine=L.polyline(fb,{color:'#2563EB',weight:4.5,opacity:.96,
            lineCap:'round',lineJoin:'round'}).addTo(map);
          map.fitBounds(fb,{padding:[80,80]});
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

  // Build map HTML only when activity changes (avoids re-render cost)
  useEffect(() => {
    if (activity) setMapHtml(buildMapHtml(activity));
  }, [activity]);

  useEffect(() => {
    let watchId = null;
    if (visible && activity) {
      setLoading(true);
      setRouteInfo({ duration: '', distance: '' });

      Geolocation.getCurrentPosition(
        (pos) => {
          const uCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(uCoords);
          fetchRoute(uCoords, activity);
          if (pos.coords.heading >= 0 && webViewRef.current) {
            webViewRef.current.injectJavaScript(
              `if(window.updateUserHeading)window.updateUserHeading(${pos.coords.heading});true;`
            );
          }
        },
        () => fetchRoute(userLocation, activity),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
      );

      watchId = Geolocation.watchPosition(
        (pos) => {
          const uCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(uCoords);
          const h = (pos.coords.heading != null && pos.coords.heading >= 0 && !isNaN(pos.coords.heading))
            ? pos.coords.heading : null;
          if (webViewRef.current) {
            // Only push GPS heading when moving (it's noisy when stationary)
            if (h !== null) {
              webViewRef.current.injectJavaScript(
                `if(window.updateUserHeading)window.updateUserHeading(${h});true;`
              );
            }
            webViewRef.current.injectJavaScript(
              `if(window.updateUserPosition)window.updateUserPosition(${pos.coords.latitude},${pos.coords.longitude},${h ?? 'null'});true;`
            );
          }
        },
        (err) => console.warn('[ActivityMapModal] watch error:', err),
        { enableHighAccuracy: true, distanceFilter: 0, interval: 500, fastestInterval: 200, forceRequestLocation: true }
      );
    }
    return () => { if (watchId !== null) Geolocation.clearWatch(watchId); };
  }, [visible, activity]);

  const fetchRoute = async (userLoc, act) => {
    try {
      const uLng = userLoc.lng, uLat = userLoc.lat;
      const dLng = act.lng || 77.3125, dLat = act.lat || 28.4105;
      const url = `https://router.project-osrm.org/route/v1/bicycle/${uLng},${uLat};${dLng},${dLat}?geometries=geojson&overview=full`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data?.routes?.length > 0) {
        const route = data.routes[0];
        const mins  = Math.max(1, Math.round(route.duration / 60));
        const kms   = (route.distance / 1000).toFixed(1);
        const durText  = `${mins} min`;
        const distText = `${kms} km`;
        setRouteInfo({ duration: `${durText} by bike 🚲`, distance: `${distText} away` });

        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
        if (webViewRef.current) {
          const safeCoords = JSON.stringify(coords).replace(/'/g, "\\'");
          webViewRef.current.injectJavaScript(
            `window.updateRoute(${uLat},${uLng},${dLat},${dLng},'${safeCoords}','${distText}','${durText}');true;`
          );
        }
      } else {
        setRouteInfo({ duration: '~10 min by bike 🚲', distance: '~1.8 km away' });
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(
            `window.updateRoute(${uLat},${uLng},${dLat},${dLng},'[]','','');true;`
          );
        }
      }
    } catch {
      setRouteInfo({ duration: '~12 min by bike 🚲', distance: '~2.1 km away' });
    } finally {
      setLoading(false);
    }
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
          onLoadEnd={() => { if (userLocation) fetchRoute(userLocation, activity); }}
        />

        {/* ── Floating Header ───────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, vs(12)) + vs(4) }]}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.85} onPress={onClose}>
            <MaterialIcons name="chevron-left" size={ms(24)} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{activity.title}</Text>
            <View style={styles.headerSubRow}>
              <Ionicons name="location-sharp" size={ms(11)} color="rgba(255,255,255,0.7)" />
              <Text style={styles.headerSub} numberOfLines={1}>{activity.location}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.85} onPress={() => setShareModalVisible(true)}>
            <Ionicons name="share-outline" size={ms(20)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ── Loading overlay ───────────────────────────────────── */}
        {loading && (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loaderText}>Plotting your route…</Text>
          </View>
        )}

     
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

  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: ms(16), paddingBottom: vs(14),
    backgroundColor: 'rgba(10,22,41,0.54)',
    zIndex: 10, gap: ms(12),
  },
  headerBtn: {
    width: ms(40), height: ms(40), borderRadius: ms(20),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: normFont(16), fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: ms(3), marginTop: vs(2) },
  headerSub: { fontSize: normFont(11), color: 'rgba(255,255,255,0.65)', fontWeight: '500' },

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
