import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, AppState, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import MapRender from './MAP-COMPONENTS/MapRender';
import LocationSelector from './MAP-COMPONENTS/LocationSelector';
import FilterButton from './MAP-COMPONENTS/FilterButton';
import CreatePinButton from './MAP-COMPONENTS/CreatePinButton';
import MapModalLocation from './MAP-COMPONENTS/MapModalLocation';

const MapScreen = () => {
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [isPermanentDenial, setIsPermanentDenial] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('Fetching location...');

  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.address) {
            const name = data.address.city || data.address.town || data.address.village || data.address.suburb || 'Current Location';
            setLocationName(name);
          } else {
            setLocationName('Current Location');
          }
        } catch (error) {
          console.warn('Reverse geocoding error:', error);
          setLocationName('Current Location');
        }
      },
      (error) => {
        console.warn('Location fetch error:', error);
        setLocationName('Location unavailable');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Check permission silently
  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      setHasPermission(granted);
      if (granted) setIsPermanentDenial(false);
    }
  };

  // Request permission explicitly
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      if (isPermanentDenial) {
        Linking.openSettings();
        return;
      }
      
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
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
    }
  };

  // Check on mount and on AppState change (returning from settings)
  useEffect(() => {
    checkLocationPermission();
    
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkLocationPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (hasPermission) {
      fetchLocation();
    }
  }, [hasPermission]);

  // Show nothing while checking initially
  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {hasPermission ? (
        <>
          {/* Background Map layer */}
          <MapRender ref={mapRef} userLocation={userLocation} />

          {/* Floating UI Overlays */}
          <LocationSelector 
            locationName={locationName} 
            onPress={() => fetchLocation()} 
          />
          <FilterButton onPress={() => console.log('Filter pressed')} />
          
          <CreatePinButton 
            onCreatePress={() => navigation.navigate('CreatePin')}
            onRecenterPress={() => mapRef.current?.recenterToUser()}
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
    backgroundColor: '#f5f3f0', // Match Voyager map bg
  },
});

export default MapScreen;
