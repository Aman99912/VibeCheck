import React, { useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import PinBox from './PinBox';
import { Colors } from '../../../Reusable-Component';

// Dummy data for pins
const DUMMY_PINS = [
  { id: '1', lat: 28.6315, lng: 77.2167, title: "Evening Football", dist: "0.4 km", icon: "sports-soccer", color: Colors.primary },
  { id: '2', lat: 28.6330, lng: 77.2200, title: "Cafe Meetup", dist: "0.6 km", icon: "local-cafe", color: Colors.secondary },
  { id: '3', lat: 28.6290, lng: 77.2140, title: "Live Music", dist: "1.2 km", icon: "music-note", color: "#9C27B0" },
];

const MapRender = () => {
  const mapRef = useRef(null);

  // Initial region (Connaught Place, Delhi)
  const initialRegion = {
    latitude: 28.6315,
    longitude: 77.2167,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'} // 'none' is only supported on Android to hide base Google Maps tiles. iOS MapKit requires 'standard' with shouldReplaceMapContent on UrlTile.
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        pitchEnabled={false}
      >
        {/* OpenStreetMap Tiles for Free Map Rendering */}
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          shouldReplaceMapContent={true} // Replaces base Apple Maps tiles on iOS
          maximumZ={19}
          flipY={false}
        />

        {/* Render Custom PinBoxes */}
        {DUMMY_PINS.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.lat, longitude: pin.lng }}
            tracksViewChanges={false} // Performance optimization for custom markers
          >
            <PinBox 
              title={pin.title}
              distance={pin.dist}
              typeIcon={pin.icon}
              iconColor={pin.color}
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#EBEBEB',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapRender;
