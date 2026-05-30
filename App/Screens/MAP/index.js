import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, AppState, Linking } from 'react-native';
import MapRender from './MAP-COMPONENTS/MapRender';
import LocationSelector from './MAP-COMPONENTS/LocationSelector';
import FilterButton from './MAP-COMPONENTS/FilterButton';
import CreatePinButton from './MAP-COMPONENTS/CreatePinButton';
import MapModalLocation from './MAP-COMPONENTS/MapModalLocation';

const MapScreen = () => {
  const mapRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isPermanentDenial, setIsPermanentDenial] = useState(false);

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

  // Show nothing while checking initially
  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {hasPermission ? (
        <>
          {/* Background Map layer */}
          <MapRender ref={mapRef} />

          {/* Floating UI Overlays */}
          <LocationSelector onPress={() => console.log('Location pressed')} />
          <FilterButton onPress={() => console.log('Filter pressed')} />
          
          <CreatePinButton 
            onCreatePress={() => console.log('Create pin')}
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
