import React from 'react';
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { CText, AppIcon, Colors, ms, vs } from '../../../../../Reusable-Component';

const categories = [
  { id: 'sports', label: 'Sports', iconFamily: 'Ionicons', iconName: 'football-outline' },
  { id: 'gaming', label: 'Gaming', iconFamily: 'Ionicons', iconName: 'game-controller-outline' },
  { id: 'music', label: 'Music', iconFamily: 'Ionicons', iconName: 'musical-notes-outline' },
  { id: 'coffee', label: 'Coffee', iconFamily: 'Ionicons', iconName: 'cafe-outline' },
  { id: 'other', label: 'Other', iconFamily: 'Feather', iconName: 'more-horizontal' },
];

const CategorySelector = ({ selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.container}>
      <CText variant="body3" weight="semibold" style={styles.sectionTitle}>
        Category
      </CText>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((item) => {
          const isSelected = selectedCategory === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => onSelectCategory(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                <AppIcon 
                  family={item.iconFamily} 
                  name={item.iconName} 
                  size={ms(20)} 
                  color={isSelected ? Colors.white : Colors.text} 
                />
              </View>
              <CText 
                variant="body3" 
                weight={isSelected ? 'bold' : 'medium'}
                style={[styles.label, isSelected && styles.labelSelected]}
              >
                {item.label}
              </CText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: vs(12),
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: vs(12),
    paddingHorizontal: ms(16),
  },
  scrollContent: {
    paddingHorizontal: ms(16),
    gap: ms(16),
  },
  pill: {
    alignItems: 'center',
    gap: vs(6),
  },
  pillSelected: {
    // No layout change for pill itself, just colors change
  },
  iconBox: {
    width: ms(50),
    height: ms(50),
    borderRadius: ms(25),
    backgroundColor: Colors.lightBackground || '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxSelected: {
    backgroundColor: Colors.primary,
  },
  label: {
    color: Colors.textMuted || '#888',
  },
  labelSelected: {
    color: Colors.primary,
  },
});

export default CategorySelector;
