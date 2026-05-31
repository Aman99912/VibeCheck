import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  AppState,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';

// ── Map layer ────────────────────────────────────────────────────────────────
import MapRender, { DUMMY_PINS } from './MAP-COMPONENTS/MapRender';

// ── Rebuilt UI Components ────────────────────────────────────────────────────
import MapHeader        from './MAP-COMPONENTS/MapHeader';
import RecenterButton   from './MAP-COMPONENTS/RecenterButton';
import MapModalLocation from './MAP-COMPONENTS/MapModalLocation';
import ViewPin          from './MAP-COMPONENTS/ViewPin';
import AcceptActivityIsland from './MAP-COMPONENTS/accept-activity-island';

const MapScreen = () => {
  const mapRef    = useRef(null);
  const navigation = useNavigation();

  // ── Permission + location state ───────────────────────────────────────────
  const [hasPermission,    setHasPermission]    = useState(null);
  const [isPermanentDenial, setIsPermanentDenial] = useState(false);
  const [userLocation,     setUserLocation]     = useState(null);
  const [locationName,     setLocationName]     = useState('Fetching location...');

  // ── Pin / Sheet state ─────────────────────────────────────────────────────
  const [selectedPin,      setSelectedPin]      = useState(null);
  const [viewPinVisible,   setViewPinVisible]   = useState(false);
  const [joinedPinIds,     setJoinedPinIds]     = useState([]);
  const [activeFilter,     setActiveFilter]     = useState('all');

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getMappedPin = (pinId) => {
    const pinObj = DUMMY_PINS.find(p => p.id === pinId);
    if (!pinObj) return null;
    const baseLat = userLocation ? userLocation.lat : 28.4089;
    const baseLng = userLocation ? userLocation.lng : 77.3178;
    return {
      ...pinObj,
      lat: baseLat + pinObj.lat - 28.4089,
      lng: baseLng + pinObj.lng - 77.3178,
    };
  };

  const joinedPin = joinedPinIds.length > 0 ? getMappedPin(joinedPinIds[0]) : null;

  // ── Reverse geocoding ─────────────────────────────────────────────────────
  const reverseGeocodeAndSet = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        { headers: { 'User-Agent': 'VibeCheck/1.0 (Mobile App)' } }
      );
      const data = await response.json();
      if (data && data.address) {
        const name =
          data.address.suburb ||
          data.address.neighbourhood ||
          data.address.city ||
          data.address.town ||
          data.address.village ||
          'Current Location';
        setLocationName(name);
      } else {
        setLocationName('Current Location');
      }
    } catch {
      setLocationName('Current Location');
    }
  };

  // ── Location fetch (two-step: fast low-accuracy → precise GPS) ────────────
  const fetchLocation = () => {
    setLocationName('Fetching location...');

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        reverseGeocodeAndSet(latitude, longitude);

        // Silent upgrade to high-accuracy GPS
        Geolocation.getCurrentPosition(
          (precise) => {
            setUserLocation({ lat: precise.coords.latitude, lng: precise.coords.longitude });
            reverseGeocodeAndSet(precise.coords.latitude, precise.coords.longitude);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      },
      () => {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            reverseGeocodeAndSet(latitude, longitude);
          },
          () => setLocationName('Location unavailable'),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
    );
  };

  // ── Permission management ─────────────────────────────────────────────────
  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      setHasPermission(granted);
      if (granted) setIsPermanentDenial(false);
    } else if (Platform.OS === 'ios') {
      try {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        setHasPermission(auth === 'granted' || auth === 'restricted');
      } catch {
        setHasPermission(false);
      }
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      if (isPermanentDenial) { Linking.openSettings(); return; }
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          setIsPermanentDenial(false);
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setHasPermission(false);
          setIsPermanentDenial(true);
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      Linking.openSettings();
    }
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    checkLocationPermission();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') checkLocationPermission();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (hasPermission) fetchLocation();
  }, [hasPermission]);

  // ── Initial render guard ──────────────────────────────────────────────────
  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {hasPermission ? (
        <>
          {/* ── Background Map (Leaflet WebView) ──────────────────────── */}
          <MapRender
            ref={mapRef}
            userLocation={userLocation}
            isModalOpen={viewPinVisible}
            onMarkerPress={(pin) => {
              setSelectedPin(pin);
              setViewPinVisible(true);
            }}
            onMapPress={() => {
              if (viewPinVisible) {
                setViewPinVisible(false);
                setSelectedPin(null);
              }
            }}
            activeFilter={activeFilter}
          />

          {/* ── Map Header (hamburger + location pill + filter chips) ─── */}
          <MapHeader
            locationName={locationName}
            activeFilter={activeFilter}
            onLocationPress={() => fetchLocation()}
            onFilterChange={(filterId) => setActiveFilter(filterId)}
            onHamburgerPress={(isOpen) => console.log('[MapScreen] Menu:', isOpen)}
            onNotificationPress={() => navigation.navigate('Notification')}
            onSettingsPress={() => console.log('[MapScreen] Settings')}
          />

          {/* ── Recenter button ─────────────────────────────────────────────── */}
          <RecenterButton onPress={() => mapRef.current?.recenterToUser()} />

          {/* ── Active Vibe Island (when user has joined a vibe) ──────── */}
          {joinedPin && (!viewPinVisible || (selectedPin && selectedPin.id !== joinedPin.id)) && (
            <AcceptActivityIsland
              activity={joinedPin}
              onPress={() => {
                setSelectedPin(joinedPin);
                setViewPinVisible(true);
              }}
            />
          )}

          {/* ── Activity Detail Bottom Sheet ─────────────────────────── */}
          <ViewPin
            visible={viewPinVisible}
            onClose={() => {
              setViewPinVisible(false);
              setSelectedPin(null);
            }}
            pin={selectedPin}
            joinedPinIds={joinedPinIds}
            onJoinSuccess={() => {
              if (selectedPin) {
                setJoinedPinIds((prev) => [...prev, selectedPin.id]);
              }
            }}
            onLeaveVibe={(pinId, reason) => {
              console.log(`[MapScreen] Left pin ${pinId}: "${reason}"`);
              setJoinedPinIds((prev) => prev.filter(id => id !== pinId));
              setViewPinVisible(false);
              setSelectedPin(null);
            }}
          />
        </>
      ) : (
        <MapModalLocation
          onRequestPermission={requestLocationPermission}
          isSettingsFallback={isPermanentDenial}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E4D9', // Map beige — matches warm map background
  },
});

export default MapScreen;
