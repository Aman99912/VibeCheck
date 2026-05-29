import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, ms, NavBar } from '../../Reusable-Component';

import ActivityScreen from '../ACTIVITY';
import MapScreen from '../MAP';
import HighlightsScreen from '../HIGHLIGHTS';
import ProfileScreen from '../PROFILE';

const Tab = createBottomTabNavigator();

const MainTabs = ({ onLogout }) => {
  return (
    <Tab.Navigator
      tabBar={(props) => <NavBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ tabBarIcon: 'home' }} 
      />
      <Tab.Screen 
        name="Activity" 
        component={ActivityScreen} 
        options={{ tabBarIcon: 'favorite-border' }} 
      />
      <Tab.Screen 
        name="Highlights" 
        component={HighlightsScreen} 
        options={{ tabBarIcon: 'play-circle-outline' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarIcon: 'person-outline' }} 
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
