import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, InputBox, AppButton, AppIcon, Colors, ms, vs } from '../../../../Reusable-Component';
import CategorySelector from './CreateRequest-COMPONENT/CategorySelector';
import CounterInput from './CreateRequest-COMPONENT/CounterInput';
import VisibilitySelector from './CreateRequest-COMPONENT/VisibilitySelector';

const CreatePinScreen = () => {
  const navigation = useNavigation();

  const [category, setCategory] = useState('sports');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Central Park, Koramangala');
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
      category, title, location, dateTime, peopleLimit, duration, description
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
              label="Location"
              value={location}
              onChangeText={setLocation}
              leftIcon="location-on"
              rightIcon="my-location"
              onRightIconPress={() => console.log('Fetch location')}
            />
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
          disabled={!title || !location}
        />
      </View>
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
