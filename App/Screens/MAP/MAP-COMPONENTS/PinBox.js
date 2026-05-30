import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Colors, CText, ms, vs } from '../../../Reusable-Component';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const PinBox = ({ 
  title = "Evening Football...",
  distance = "0.4 km",
  typeIcon = "sports-soccer",
  iconColor = Colors.primary,
  participants = 8,
  maxParticipants = 12,
  isActive = false
}) => {
  return (
    <View style={styles.container}>
      {/* Indicator border if active */}
      {isActive && <View style={styles.activeIndicator} />}
      
      <View style={styles.content}>
        {/* Left Icon Area */}
        <View style={[styles.iconBox, { backgroundColor: iconColor + '20' }]}>
          <MaterialIcons name={typeIcon} size={ms(20)} color={iconColor} />
        </View>

        {/* Right Info Area */}
        <View style={styles.infoBox}>
          <CText variant="body2" weight="semibold" numberOfLines={1} style={styles.title}>
            {title}
          </CText>
          
          <View style={styles.row}>
            <MaterialIcons name="location-on" size={ms(12)} color={Colors.textMuted} />
            <CText variant="label" weight="regular" color={Colors.textMuted} style={styles.subtext}>
              {distance}
            </CText>
          </View>
          
          <View style={styles.row}>
            <MaterialIcons name="people" size={ms(12)} color={Colors.textMuted} />
            <CText variant="label" weight="regular" color={Colors.textMuted} style={styles.subtext}>
              {participants}/{maxParticipants}
            </CText>
          </View>
        </View>
      </View>
      
      {/* Down arrow triangle for map marker */}
      <View style={styles.triangle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ms(140),
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: vs(8),
    borderRadius: ms(14),
    borderWidth: 2,
    borderColor: Colors.primary,
    zIndex: -1,
  },
  content: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: ms(12),
    padding: ms(6),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    width: '100%',
  },
  iconBox: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(8),
  },
  infoBox: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: ms(11),
    marginBottom: vs(2),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(1),
  },
  subtext: {
    fontSize: ms(9),
    marginLeft: ms(2),
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: ms(8),
    borderRightWidth: ms(8),
    borderTopWidth: ms(10),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  }
});

export default PinBox;
