import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, CText, ms, vs, normFont, BackButton } from '../../../Reusable-Component';

const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Football Match',
    message: 'Your Vibe is about to Expire.',
    time: '2m ago',
    icon: 'football',
    color: '#1A5C2E',
  },
  {
    id: '2',
    title: 'Cafe Meetup',
    message: 'Your vibe starts in 1 hour!',
    time: '1h ago',
    icon: 'cafe',
    color: '#6B3D1E',
  },
  {
    id: '3',
    title: 'Live Music',
    message: 'Priya and 3 others Joined your vibe.',
    time: '2h ago',
    icon: 'musical-notes',
    color: '#4A1D6E',
  },
];

const NotificationScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <CText style={styles.headerTitle}>Notifications</CText>
        <View style={{ width: ms(40) }} />
      </View>

      {/* ── List ──────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + vs(20) }]}
        showsVerticalScrollIndicator={false}
      >
        {DUMMY_NOTIFICATIONS.map((notif) => (
          <TouchableOpacity key={notif.id} style={styles.card} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: notif.color + '1A' }]}>
              <Ionicons name={notif.icon} size={ms(20)} color={notif.color} />
            </View>
            <View style={styles.textContent}>
              <CText style={styles.title}>{notif.title}</CText>
              <CText style={styles.message}>{notif.message}</CText>
            </View>
            <CText style={styles.timeText}>{notif.time}</CText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Minimal off-white background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#E8E8E8',
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: normFont(18),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listContent: {
    padding: ms(16),
    gap: vs(12),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: ms(16),
    borderRadius: ms(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(14),
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: normFont(15),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: vs(4),
  },
  message: {
    fontSize: normFont(13),
    color: Colors.textSecondary,
    lineHeight: normFont(18),
  },
  timeText: {
    fontSize: normFont(11),
    color: Colors.textMuted,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginTop: vs(2),
  },
});

export default NotificationScreen;
