import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, InputBox, AppButton, AppIcon, Colors, ms, vs, CText, normFont } from '../../../../Reusable-Component';
import CategorySelector from './CreateRequest-COMPONENT/CategorySelector';
import CounterInput from './CreateRequest-COMPONENT/CounterInput';
import DurationSlider from './CreateRequest-COMPONENT/DurationSlider';
import MapPickerModal from '../../MAP-COMPONENTS/MapPickerModal';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreatePinScreen = () => {
  const navigation = useNavigation();

  const [activityType, setActivityType] = useState('group'); // 'individual' | 'group'
  const [category, setCategory] = useState('sports');
  const [title, setTitle] = useState('');
  const [mapLocation, setMapLocation] = useState(null);
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  
  // Date/Time
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [peopleLimit, setPeopleLimit] = useState(8);
  const [durationHours, setDurationHours] = useState(2);
  const [description, setDescription] = useState('');

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCreate = () => {
    console.log('Create Pin Data:', {
      activityType, category, title, mapLocation, date: dateObj, peopleLimit, durationHours, description
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Create Vibe" 
        leftElement={
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={{top:10, bottom:10, left:10, right:10}}>
            <AppIcon family="Ionicons" name="close" size={ms(24)} color={Colors.textPrimary || '#111'} />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* ── Segmented Control (Individual / Group) ── */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.segmentBtn, activityType === 'individual' && styles.segmentBtnActive]}
              onPress={() => setActivityType('individual')}
            >
              <CText style={[styles.segmentText, activityType === 'individual' && styles.segmentTextActive]}>
                Individual
              </CText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.segmentBtn, activityType === 'group' && styles.segmentBtnActive]}
              onPress={() => setActivityType('group')}
            >
              <CText style={[styles.segmentText, activityType === 'group' && styles.segmentTextActive]}>
                Group
              </CText>
            </TouchableOpacity>
          </View>

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
              containerStyle={styles.flatInput}
            />
          </View>

          {/* ── Ultra Minimal Map Selector ── */}
          <TouchableOpacity 
            style={styles.minimalRow} 
            onPress={() => setIsMapPickerVisible(true)}
            activeOpacity={0.6}
          >
            <View style={styles.minimalRowLeft}>
              <AppIcon family="Ionicons" name="map-outline" size={ms(20)} color={Colors.textPrimary} />
              <View style={styles.minimalRowTextWrap}>
                <CText style={[styles.minimalRowValue, !mapLocation && { color: Colors.textMuted }]}>
                  {mapLocation ? mapLocation.name : 'Pin Exact Location on Map'}
                </CText>
                {mapLocation && (
                  <CText style={styles.coordinatesText}>
                    {mapLocation.latitude.toFixed(4)}, {mapLocation.longitude.toFixed(4)}
                  </CText>
                )}
              </View>
            </View>
            <AppIcon family="Ionicons" name="chevron-forward" size={ms(18)} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* ── Native Date & Time Picker ── */}
          <TouchableOpacity 
            style={styles.minimalRow} 
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.6}
          >
            <View style={styles.minimalRowLeft}>
              <AppIcon family="Ionicons" name="calendar-outline" size={ms(20)} color={Colors.textPrimary} />
              <View style={styles.minimalRowTextWrap}>
                <CText style={styles.minimalRowValue}>
                  {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </CText>
                <CText style={styles.coordinatesText}>Tap to change Date & Time</CText>
              </View>
            </View>
            <AppIcon family="Ionicons" name="chevron-forward" size={ms(18)} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* ── Custom Duration Slider ── */}
          <DurationSlider 
            value={durationHours}
            onValueChange={setDurationHours}
            min={1}
            max={10}
          />

          {/* ── People Limit (Only for Group) ── */}
          {activityType === 'group' && (
            <CounterInput 
              label="People Limit"
              value={peopleLimit}
              onValueChange={setPeopleLimit}
              min={2}
              max={20}
            />
          )}

          <View style={styles.formGroup}>
            <InputBox
              label="Description (Optional)"
              placeholder="What are the vibes?"
              value={description}
              onChangeText={setDescription}
              type="multiline"
              maxLength={150}
              hideLeftIcon
              containerStyle={styles.flatInput}
            />
          </View>

          {/* Spacer so content clears the bottom absolute button */}
          <View style={{ height: vs(120) }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomContainer}>
        <AppButton 
          title="Create Vibe" 
          onPress={handleCreate} 
          disabled={!title || !mapLocation}
          style={styles.createBtn}
        />
      </View>

      <MapPickerModal
        visible={isMapPickerVisible}
        onClose={() => setIsMapPickerVisible(false)}
        onSelectLocation={(locData) => {
          setMapLocation(locData);
        }}
      />

      {(showDatePicker || showTimePicker) && (
        <DateTimePicker
          value={dateObj}
          mode={showDatePicker ? 'date' : 'time'}
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (showDatePicker) {
              setShowDatePicker(false);
              if (selectedDate) {
                if (selectedDate < new Date()) {
                  // If they select a time that has already passed today, snap back to current time
                  setDateObj(new Date());
                } else {
                  setDateObj(selectedDate);
                }
                if (Platform.OS === 'android') {
                  setTimeout(() => setShowTimePicker(true), 100);
                }
              }
            } else if (showTimePicker) {
              setShowTimePicker(false);
              if (selectedDate) {
                if (selectedDate < new Date()) {
                  // If chosen time is in the past, snap to now
                  setDateObj(new Date());
                } else {
                  setDateObj(selectedDate);
                }
              }
            }
          }}
        />
      )}
    </View>
    
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean pure white for premium feel
  },
  closeBtn: {
    padding: ms(8),
  },
  scrollContent: {
    paddingBottom: vs(24),
  },
  
  // Segmented Control
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    marginHorizontal: ms(20),
    marginTop: vs(16),
    marginBottom: vs(12),
    borderRadius: ms(12),
    padding: ms(4),
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: vs(10),
    alignItems: 'center',
    borderRadius: ms(10),
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: normFont(13),
    fontWeight: '600',
    color: Colors.textMuted || '#6B7280',
  },
  segmentTextActive: {
    color: Colors.textPrimary || '#111827',
  },

  // Flat Inputs
  formGroup: {
    paddingHorizontal: ms(20),
    marginTop: vs(12),
  },
  rowGroup: {
    flexDirection: 'row',
    paddingHorizontal: ms(20),
    marginTop: vs(12),
  },
  flatInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  
  // Ultra Minimal Row Selector
  minimalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(20),
    paddingVertical: vs(18),
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
    marginTop: vs(8),
  },
  minimalRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  minimalRowTextWrap: {
    marginLeft: ms(12),
    flex: 1,
  },
  minimalRowValue: {
    fontSize: normFont(14),
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  coordinatesText: {
    fontSize: normFont(11),
    color: Colors.textMuted,
    marginTop: vs(2),
  },

  // Bottom Area
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: ms(20),
    paddingBottom: vs(24), // Accounting for safe area
    paddingTop: vs(16),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  createBtn: {
    borderRadius: ms(14),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default CreatePinScreen;
