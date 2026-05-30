import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { CText, AppIcon, Colors, ms, vs } from '../../../Reusable-Component';

const TABS = [
  { id: 'current', label: 'Current', icon: 'bolt' },
  { id: 'past', label: 'Past', icon: 'schedule' },
];

const TabBar = ({ activeTab, onTabChange, counts = {} }) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id];

        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.8}
          >
            <AppIcon
              name={tab.icon}
              size={ms(16)}
              color={isActive ? Colors.white : Colors.textSecondary}
            />
            <CText
              variant="bodySmall"
              weight="semibold"
              color={isActive ? Colors.white : Colors.textSecondary}
              style={styles.tabLabel}
            >
              {tab.label}{count != null ? ` (${count})` : ''}
            </CText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: ms(16),
    gap: ms(10),
    marginTop: vs(12),
    marginBottom: vs(16),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(10),
    borderRadius: ms(24),
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: ms(6),
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabLabel: {},
});

export default TabBar;
