import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CText, Colors, ms, vs } from '../../../Reusable-Component';

const AvatarRow = ({ avatars = [], maxVisible = 5 }) => {
  const visible = avatars.slice(0, maxVisible);
  const overflow = avatars.length - maxVisible;

  return (
    <View style={styles.container}>
      {visible.map((_, index) => (
        <View
          key={index}
          style={[
            styles.avatar,
            { marginLeft: index === 0 ? 0 : -ms(8) },
            { zIndex: maxVisible - index },
          ]}
        >
          <View style={styles.avatarInner} />
        </View>
      ))}
      {overflow > 0 && (
        <View style={[styles.overflowBadge, { marginLeft: -ms(8) }]}>
          <CText variant="label" weight="semibold" color={Colors.textSecondary}>
            +{overflow}
          </CText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.gray300,
    overflow: 'hidden',
  },
  avatarInner: {
    flex: 1,
    backgroundColor: Colors.gray400,
    borderRadius: ms(14),
  },
  overflowBadge: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
});

export default AvatarRow;
