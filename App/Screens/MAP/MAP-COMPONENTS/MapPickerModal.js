import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { CText, AppIcon, AppButton, Colors, ms, vs } from '../../../Reusable-Component';
import MapRender from './MapRender';

const MapPickerModal = ({ visible, onClose, onSelectLocation, initialLocation }) => {
  const [coords, setCoords] = useState(null);
  const [realUserLocation, setRealUserLocation] = useState(null);
  const [address, setAddress] = useState('Fetching current location...');
  const debounceTimerRef = useRef(null);

  // Initialize coordinates
  useEffect(() => {
    if (visible) {
      const startCoords = initialLocation || { lat: 28.4089, lng: 77.3178 };
      setCoords(startCoords);
      reverseGeocode(startCoords.lat, startCoords.lng);

      // Fetch actual user location once to keep the blue dot fixed at their true position
      Geolocation.getCurrentPosition(
        (position) => {
          setRealUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Real user location fetch error:', error);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, [visible, initialLocation]);

  const reverseGeocode = (latitude, longitude) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setAddress('Fetching location details...');

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              'User-Agent': 'VibeMatch/1.0 (Mobile App)'
            }
          }
        );
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          // Extract specific place name if available
          const place = addr.amenity || addr.leisure || addr.building || addr.tourism || addr.shop || addr.historic || addr.office || addr.aeroway || addr.railway || addr.hotel || addr.stadium || addr.restaurant || addr.cafe || '';
          const road = addr.road || addr.suburb || addr.neighbourhood || addr.city_district || '';
          const city = addr.city || addr.town || addr.village || addr.county || '';
          
          let formatted = '';
          if (place) {
            formatted = place;
            if (road) formatted += `, ${road}`;
          } else if (road && city) {
            formatted = `${road}, ${city}`;
          } else {
            formatted = data.display_name.split(',').slice(0, 3).join(',').trim();
          }
          setAddress(formatted || 'Selected Location');
        } else {
          setAddress('Selected Location');
        }
      } catch (err) {
        console.warn('Geocoding error:', err);
        setAddress('Location Selected');
      }
    }, 850);
  };

  const handleMapMoved = (newCenter) => {
    setCoords(newCenter);
    reverseGeocode(newCenter.lat, newCenter.lng);
  };

  const handleConfirm = () => {
    if (coords) {
      onSelectLocation({
        name: address === 'Fetching location details...' ? 'Selected Location' : address,
        latitude: coords.lat,
        longitude: coords.lng
      });
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Map Layer */}
        <MapRender 
          userLocation={realUserLocation} 
          onMapMoved={handleMapMoved}
        />

        {/* Center Pin Overlay */}
        <View style={styles.pinOverlay} pointerEvents="none">
          <View style={styles.pinWrapper}>
            <AppIcon family="MaterialIcons" name="location-on" size={ms(46)} color={Colors.primary} />
            <View style={styles.pinShadow} />
          </View>
        </View>

        {/* Floating Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <AppIcon family="MaterialIcons" name="arrow-back" size={ms(24)} color={Colors.text} />
          </TouchableOpacity>
          <CText variant="h4" weight="semibold" style={styles.headerTitle}>
            Choose Location
          </CText>
        </View>

        {/* Bottom Panel */}
        <View style={styles.bottomPanel}>
          <View style={styles.locationInfo}>
            <View style={styles.iconCircle}>
              <AppIcon family="MaterialIcons" name="my-location" size={ms(20)} color={Colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <CText variant="body3" weight="semibold" style={styles.label}>
                Selected Area
              </CText>
              <CText variant="body2" weight="medium" style={styles.addressText} numberOfLines={2}>
                {address}
              </CText>
            </View>
          </View>

          <AppButton 
            title="Confirm Location" 
            onPress={handleConfirm}
            disabled={address === 'Fetching location details...'}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  pinOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  pinWrapper: {
    alignItems: 'center',
    // offset so the bottom of the pin sits exactly at the screen center point
    transform: [{ translateY: -vs(20) }], 
  },
  pinShadow: {
    width: ms(8),
    height: vs(4),
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: ms(4),
    marginTop: vs(-2),
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? vs(50) : vs(20),
    left: ms(16),
    right: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: ms(30),
    paddingHorizontal: ms(8),
    paddingVertical: vs(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  closeButton: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerTitle: {
    marginLeft: ms(12),
    color: Colors.text,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    paddingHorizontal: ms(20),
    paddingTop: vs(20),
    paddingBottom: Platform.OS === 'ios' ? vs(34) : vs(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(20),
    gap: ms(12),
  },
  iconCircle: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: Colors.textMuted || '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    color: Colors.text,
    marginTop: vs(2),
  },
});

export default MapPickerModal;
