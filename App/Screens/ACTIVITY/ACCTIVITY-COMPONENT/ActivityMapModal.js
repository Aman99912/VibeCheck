import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, CText, AppButton, ms, vs, normFont } from '../../../Reusable-Component';
import SocialShareModal from './SocialShareModal';

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #f5f3f0; }
    .custom-user-icon {
      display: flex;
      align-items: center;
      justifyContent: center;
    }
    .user-pulse-container {
      position: relative;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justifyContent: center;
    }
    .user-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #3B82F6;
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 6px rgba(59, 130, 246, 0.8);
      z-index: 2;
    }
    .pulse-ring {
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: rgba(59, 130, 246, 0.4);
      animation: pulse 1.8s infinite ease-out;
      z-index: 1;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    .custom-dest-icon {
      display: flex;
      align-items: center;
      justifyContent: center;
      filter: drop-shadow(0px 4px 6px rgba(239, 68, 68, 0.35));
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    var userMarker = null;
    var destMarker = null;
    var routeLineBg = null;
    var routeLine = null;

    window.updateRoute = function(userLat, userLng, destLat, destLng, routeCoordsJson) {
      try {
        if (userMarker) map.removeLayer(userMarker);
        if (destMarker) map.removeLayer(destMarker);
        if (routeLineBg) map.removeLayer(routeLineBg);
        if (routeLine) map.removeLayer(routeLine);

        // Pulsing Blue Dot User Icon
        var userIcon = L.divIcon({
          html: '<div class="user-pulse-container"><div class="pulse-ring"></div><div class="user-dot"></div></div>',
          className: 'custom-user-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        // Premium SVG Dest Pin
        var destIcon = L.divIcon({
          html: '<svg width="32" height="42" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '  <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 30 12 30C12 30 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="url(#pinGrad)"/>' +
                '  <circle cx="12" cy="12" r="4.5" fill="#FFFFFF"/>' +
                '  <defs>' +
                '    <linearGradient id="pinGrad" x1="12" y1="0" x2="12" y2="30" gradientUnits="userSpaceOnUse">' +
                '      <stop offset="0%" stop-color="#FF5A5F" />' +
                '      <stop offset="100%" stop-color="#EF4444" />' +
                '    </linearGradient>' +
                '  </defs>' +
                '</svg>',
          className: 'custom-dest-icon',
          iconSize: [32, 42],
          iconAnchor: [16, 42]
        });

        userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
        destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);

        var routeCoords = JSON.parse(routeCoordsJson);

        if (routeCoords && routeCoords.length > 0) {
          // Bottom glowing shadow layer
          routeLineBg = L.polyline(routeCoords, { 
            color: '#856CE2', 
            weight: 8, 
            opacity: 0.35,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          // Top solid line layer
          routeLine = L.polyline(routeCoords, { 
            color: '#856CE2', 
            weight: 4, 
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
          
          var bounds = L.latLngBounds(routeCoords);
          map.fitBounds(bounds, { padding: [60, 60] });
        } else {
          var fallbackCoords = [[userLat, userLng], [destLat, destLng]];
          routeLineBg = L.polyline(fallbackCoords, { 
            color: '#856CE2', 
            weight: 8, 
            opacity: 0.35,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          routeLine = L.polyline(fallbackCoords, { 
            color: '#856CE2', 
            weight: 4, 
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
          map.fitBounds(fallbackCoords, { padding: [60, 60] });
        }
      } catch (e) {
        console.error(e);
      }
    };
  </script>
</body>
</html>
`;

const ActivityMapModal = ({ visible, onClose, activity }) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState({ duration: '', distance: '' });
  const [userLocation, setUserLocation] = useState({ lat: 28.4089, lng: 77.3178 }); // default Faridabad coords
  const [shareModalVisible, setShareModalVisible] = useState(false);

  useEffect(() => {
    if (visible && activity) {
      setLoading(true);
      
      // Get user location
      Geolocation.getCurrentPosition(
        (position) => {
          const uCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(uCoords);
          fetchRoute(uCoords, activity);
        },
        (error) => {
          console.warn('[ActivityMapModal] Geolocation error:', error);
          // fallback to default coordinates
          fetchRoute(userLocation, activity);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
      );
    }
  }, [visible, activity]);

  const fetchRoute = async (userLoc, act) => {
    try {
      const userLng = userLoc.lng;
      const userLat = userLoc.lat;
      const destLng = act.lng || 77.3125;
      const destLat = act.lat || 28.4105;

      const url = `https://router.project-osrm.org/route/v1/bicycle/${userLng},${userLat};${destLng},${destLat}?geometries=geojson&overview=full`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Parse time & distance
        const durationSecs = route.duration || 600;
        const distanceMeters = route.distance || 2000;
        
        const mins = Math.max(1, Math.round(durationSecs / 60));
        const kms = (distanceMeters / 1000).toFixed(1);

        setRouteInfo({
          duration: `${mins} mins via Bike 🚲`,
          distance: `${kms} km away`,
        });

        // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet polyline
        const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);

        // Inject path into Leaflet WebView
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(
            `window.updateRoute(${userLat}, ${userLng}, ${destLat}, ${destLng}, '${JSON.stringify(coords)}'); true;`
          );
        }
      } else {
        // Fallback if routing API fails
        setRouteInfo({
          duration: '10 mins via Bike 🚲',
          distance: '1.8 km away',
        });
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(
            `window.updateRoute(${userLat}, ${userLoc.lng}, ${destLat}, ${destLng}, '[]'); true;`
          );
        }
      }
    } catch (e) {
      console.warn('[ActivityMapModal] Route fetch failed:', e);
      // static fallback
      setRouteInfo({
        duration: '12 mins via Bike 🚲',
        distance: '2.1 km away',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = () => {
    const destLat = activity?.lat || 28.4105;
    const destLng = activity?.lng || 77.3125;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLng}&travelmode=bicycling`;
    Linking.openURL(url).catch((err) => console.error('An error occurred loading map directions', err));
  };

  const handleShareLocation = () => {
    setShareModalVisible(true);
  };

  if (!activity) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Full-Screen WebView Map */}
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: MAP_HTML }}
          style={styles.map}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          cacheEnabled={true}
          androidLayerType="hardware"
          renderToHardwareTextureAndroid={true}
          onLoadEnd={() => {
            // Trigger routing load after WebView ends loading
            if (userLocation) {
              fetchRoute(userLocation, activity);
            }
          }}
        />

        {/* Header Overlay */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, vs(12)) }]}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <MaterialIcons name="chevron-left" size={ms(22)} color={Colors.white} />
          </TouchableOpacity>
          <CText variant="h4" weight="bold" color={Colors.white} style={styles.headerTitle} numberOfLines={1}>
            {activity.title}
          </CText>
          <View style={{ width: ms(42) }} />
        </View>

        {/* Dynamic Loading Overlay */}
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <CText variant="caption" color={Colors.textSecondary} style={{ marginTop: vs(8) }}>
              Calculating bike path...
            </CText>
          </View>
        )}

        {/* Floating Route Info Bottom Card */}
        <View style={[styles.bottomCard, { bottom: Math.max(insets.bottom, vs(16)) }]}>
          <View style={styles.routeHeader}>
            <View style={styles.bikeIconContainer}>
              <MaterialIcons name="directions-bike" size={ms(22)} color={Colors.primary} />
            </View>
            <View style={styles.routeTextContainer}>
              <CText variant="body" weight="bold" color={Colors.textPrimary}>
                {routeInfo.duration || 'Calculating...'}
              </CText>
              <CText variant="caption" color={Colors.textSecondary} weight="semibold">
                {routeInfo.distance || 'Loading distance...'}
              </CText>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <AppButton
              variant="primary"
              title="Share Location"
              leftIcon="share"
              size="md"
              onPress={handleShareLocation}
              style={styles.actionButton}
            />
            <AppButton
              variant="outline"
              title="Get Directions"
              leftIcon="directions"
              size="md"
              onPress={handleGetDirections}
              style={styles.actionButtonOutline}
            />
          </View>
        </View>

        {/* Social Sharing Modal overlay */}
        <SocialShareModal
          visible={shareModalVisible}
          onClose={() => setShareModalVisible(false)}
          activity={activity}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    height: vs(84) + vs(10),
    backgroundColor: 'rgba(10, 22, 41, 0.45)', // matching glass overlay
    zIndex: 10,
  },
  backButton: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    backgroundColor: 'rgba(10, 22, 41, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: ms(12),
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245, 243, 240, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9,
  },
  bottomCard: {
    position: 'absolute',
    left: ms(16),
    right: ms(16),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: ms(22),
    borderWidth: 1.5,
    borderColor: 'rgba(133, 108, 226, 0.15)',
    padding: ms(16),
    shadowColor: '#1A0C3C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 10,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(14),
  },
  bikeIconContainer: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: 'rgba(133, 108, 226, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(12),
  },
  routeTextContainer: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: ms(10),
  },
  actionButton: {
    flex: 1,
    borderWidth: 0,
    borderRadius: ms(14),
    height: vs(48),
  },
  actionButtonOutline: {
    flex: 1,
    borderRadius: ms(14),
    height: vs(48),
  },
});

export default ActivityMapModal;
