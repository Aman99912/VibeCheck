import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapRender from './MAP-COMPONENTS/MapRender';
import LocationSelector from './MAP-COMPONENTS/LocationSelector';
import FilterButton from './MAP-COMPONENTS/FilterButton';
import CreatePinButton from './MAP-COMPONENTS/CreatePinButton';

const MapScreen = () => {
  return (
    <View style={styles.container}>
      {/* Background Map layer */}
      <MapRender />

      {/* Floating UI Overlays */}
      <LocationSelector onPress={() => console.log('Location pressed')} />
      <FilterButton onPress={() => console.log('Filter pressed')} />
      
      <CreatePinButton 
        onCreatePress={() => console.log('Create pin')}
        onRecenterPress={() => console.log('Recenter')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default MapScreen;
