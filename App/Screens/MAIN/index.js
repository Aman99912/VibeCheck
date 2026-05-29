import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, ms } from '../../Reusable-Component';

import ActivityScreen from '../ACTIVITY';
import MapScreen from '../MAP';
import HighlightsScreen from '../HIGHLIGHTS';
import ProfileScreen from '../PROFILE';

const Tab = createBottomTabNavigator();

const MainTabs = ({ onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: ms(60),
          paddingBottom: ms(8),
          paddingTop: ms(8),
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Activity') iconName = 'local-activity';
          else if (route.name === 'Map') iconName = 'map';
          else if (route.name === 'Highlights') iconName = 'star';
          else if (route.name === 'Profile') iconName = 'person';
          
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Highlights" component={HighlightsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
