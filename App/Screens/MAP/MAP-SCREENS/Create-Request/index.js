import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, InputBox, AppButton, AppIcon, Colors, ms, vs, CText } from '../../../../Reusable-Component';
import CategorySelector from './CreateRequest-COMPONENT/CategorySelector';
import CounterInput from './CreateRequest-COMPONENT/CounterInput';
import VisibilitySelector from './CreateRequest-COMPONENT/VisibilitySelector';
import MapPickerModal from '../../MAP-COMPONENTS/MapPickerModal';

const CreatePinScreen = () => {
  const navigation = useNavigation();

  const [category, setCategory] = useState('sports');
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [mapLocation, setMapLocation] = useState(null);
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [dateTime, setDateTime] = useState('Today, 6:00 PM');
  const [peopleLimit, setPeopleLimit] = useState(8);
  const [duration, setDuration] = useState('2 Hours');
  const [description, setDescription] = useState('');

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCreate = () => {
    // Add logic for create pin
    console.log('Create Pin Data:', {
      category, title, locationName, mapLocation, dateTime, peopleLimit, duration, description
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Create Pin" 
        leftElement={
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={{top:10, bottom:10, left:10, right:10}}>
            <AppIcon family="MaterialIcons" name="close" size={ms(24)} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <CategorySelector 
            selectedCategory={category} 
            onSelectCategory={setCategory} 
          />

          <View style={styles.formGroup}>
            <InputBox
              label="Title"
              placeholder="e.g. Evening Football Match"
              value={title}
              onChangeText={setTitle}
              maxLength={40}
              hideLeftIcon
            />
          </View>

          <View style={styles.formGroup}>
            <InputBox
              label="Location Name (Venue/Place)"
              placeholder="e.g. Sector 12 Stadium, Hyatt Hotel..."
              value={locationName}
              onChangeText={setLocationName}
              leftIcon="location-on"
            />
          </View>

          <View style={styles.formGroup}>
            <CText variant="body3" weight="semibold" style={styles.selectorLabel}>
              Map Pin Location
            </CText>
            <TouchableOpacity 
              style={styles.mapSelector} 
              onPress={() => setIsMapPickerVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.mapSelectorLeft}>
                <View style={styles.mapIconWrapper}>
                  <AppIcon family="MaterialIcons" name="map" size={ms(20)} color={Colors.primary} />
                </View>
                <View style={{ marginLeft: ms(12), flex: 1 }}>
                  <CText 
                    variant="body2" 
                    weight="semibold" 
                    style={[
                      styles.mapSelectorValue, 
                      !mapLocation && { color: Colors.textMuted || '#888' }
                    ]}
                    numberOfLines={1}
                  >
                    {mapLocation ? mapLocation.name : 'Choose pin from map (Required)'}
                  </CText>
                  {mapLocation && (
                    <CText variant="caption" weight="medium" style={styles.coordinatesText}>
                      Lat: {mapLocation.latitude.toFixed(4)}, Lng: {mapLocation.longitude.toFixed(4)}
                    </CText>
                  )}
                </View>
              </View>
              <AppIcon family="MaterialIcons" name="chevron-right" size={ms(20)} color={Colors.textMuted || '#888'} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <InputBox
              label="Date & Time"
              value={dateTime}
              onChangeText={setDateTime}
              leftIcon="calendar-today"
              rightIcon="calendar-month"
            />
          </View>

          <CounterInput 
            label="People Limit"
            value={peopleLimit}
            onValueChange={setPeopleLimit}
            min={2}
            max={20}
          />

          <View style={styles.formGroup}>
            <InputBox
              label="Duration"
              value={duration}
              onChangeText={setDuration}
              hideLeftIcon
              rightIcon="keyboard-arrow-down"
            />
          </View>

          <View style={styles.formGroup}>
            <InputBox
              label="Description (Optional)"
              placeholder="Let's play and have fun!"
              value={description}
              onChangeText={setDescription}
              type="multiline"
              maxLength={100}
              hideLeftIcon
            />
          </View>

          <VisibilitySelector onPress={() => console.log('Change Visibility')} />

          {/* Bottom spacer for scroll area so button doesn't cover content */}
          <View style={{ height: vs(100) }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomContainer}>
        <AppButton 
          title="Create Pin" 
          onPress={handleCreate} 
          disabled={!title || !locationName || !mapLocation}
        />
      </View>

      <MapPickerModal
        visible={isMapPickerVisible}
        onClose={() => setIsMapPickerVisible(false)}
        onSelectLocation={(locData) => {
          setMapLocation(locData);
          // Auto-fill manual place name if it is currently empty
          if (!locationName && locData.name) {
            setLocationName(locData.name);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground || '#F8F9FA',
  },
  closeBtn: {
    padding: ms(8),
  },
  scrollContent: {
    paddingBottom: vs(24),
  },
  formGroup: {
    paddingHorizontal: ms(16),
    marginTop: vs(6),
  },
  selectorLabel: {
    color: Colors.text,
    marginBottom: vs(8),
    fontSize: ms(12),
  },
  mapSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: ms(12),
    paddingHorizontal: ms(16),
    paddingVertical: vs(12),
    minHeight: vs(54),
  },
  mapSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mapIconWrapper: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapSelectorValue: {
    color: Colors.text,
    fontSize: ms(14),
  },
  coordinatesText: {
    color: Colors.textMuted || '#888',
    marginTop: vs(1),
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: ms(16),
    paddingBottom: vs(24),
    paddingTop: vs(16),
    backgroundColor: Colors.lightBackground || '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

export default CreatePinScreen;
