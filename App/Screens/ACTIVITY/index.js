import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Header, Colors, vs } from '../../Reusable-Component';
import SectionHeader from './ACCTIVITY-COMPONENT/SectionHeader';
import LiveActivityCard from './ACCTIVITY-COMPONENT/LiveActivityCard';
import PastActivityCard from './ACCTIVITY-COMPONENT/PastActivityCard';
import ActivityMapModal from './ACCTIVITY-COMPONENT/ActivityMapModal';
import SocialShareModal from './ACCTIVITY-COMPONENT/SocialShareModal';
import RequestsModal from './ACCTIVITY-COMPONENT/RequestsModal';
import HostProfile from '../MAP/MAP-COMPONENTS/hostProfile';

const MOCK_ACTIVE_VIBES = [
  {
    id: 'active_1',
    title: 'Evening Football Match',
    emoji: '⚽',
    location: 'Central Park, Koramangala',
    time: 'Started 45 mins ago',
    joined: 6,
    limit: 8,
    icon: 'sports_soccer',
    lat: 28.4105,
    lng: 77.3125,
    isHost: true,
    requests: 3,
  },
  {
    id: 'active_2',
    title: 'Late Night Coffee',
    emoji: '☕',
    location: 'Brew & Chill Cafe, Faridabad',
    time: 'Starts in 1 hour',
    joined: 4,
    limit: 6,
    icon: 'local_cafe',
    lat: 28.4025,
    lng: 77.3205,
    isHost: false,
    requests: 0,
  }
];


const MOCK_PAST = [
  {
    id: '1',
    title: 'Live Music Night',
    emoji: '🎵',
    location: 'Indie Grounds, Koramangala',
    date: '12 May, 7:00 PM – 10:00 PM',
    joined: 8,
    limit: 8,
    icon: 'music-note',
    lat: 28.4150,
    lng: 77.3255,
  },
  {
    id: '2',
    title: 'Cafe Meetup',
    emoji: '☕',
    location: 'Cafe De Flora, Koramangala',
    date: '10 May, 5:00 PM – 7:00 PM',
    joined: 5,
    limit: 6,
    icon: 'local_cafe',
    lat: 28.4025,
    lng: 77.3205,
  },
  {
    id: '3',
    title: 'Basketball Game',
    emoji: '🏀',
    location: 'Koramangala Indoor Court',
    date: '8 May, 4:00 PM – 6:00 PM',
    joined: 10,
    limit: 10,
    icon: 'sports-basketball',
    lat: 28.4055,
    lng: 77.3055,
  },
  {
    id: '4',
    title: 'Board Games Evening',
    emoji: '🎲',
    location: 'The Hive Cafe, Indiranagar',
    date: '5 May, 6:00 PM – 9:00 PM',
    joined: 6,
    limit: 8,
    icon: 'event',
    lat: 28.4105,
    lng: 77.3125,
  },
];

const ActivityScreen = () => {
  const [selectedActivityForMap, setSelectedActivityForMap] = useState(null);
  const [shareActivity, setShareActivity] = useState(null);
  const [showRequests, setShowRequests] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <View style={styles.container}>
      <Header
        title="My Activity"
        titleStyle={styles.headerTitle}
        rightIcon="filter-list"
        onRightPress={() => console.log('Filter pressed')}
        borderBottom={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* Current / Upcoming Vibes Section */}
        <SectionHeader
          title="Current & Upcoming Vibes"
          actionLabel="View on Map"
          onAction={() => console.log('Go to map')}
        />
        {MOCK_ACTIVE_VIBES.map((vibe) => (
          <LiveActivityCard
            key={vibe.id}
            activity={vibe}
            onChat={() => console.log('Open chat for', vibe.title)}
            onViewLocation={() => setSelectedActivityForMap(vibe)}
            onMenu={() => setShareActivity(vibe)}
            onViewRequests={() => setShowRequests(true)}
          />
        ))}

        {/* Past Vibes Section */}
        <SectionHeader
          title="Past"
          badgeCount={MOCK_PAST.length}
        />
        {MOCK_PAST.map((activity) => (
          <PastActivityCard
            key={activity.id}
            activity={activity}
            onViewHighlights={() => console.log('View highlights:', activity.title)}
            onAddHighlight={() => console.log('Add highlight:', activity.title)}
            onPress={() => setSelectedActivityForMap({ ...activity, isCompleted: true })}
          />
        ))}
      </ScrollView>

      {/* Activity Map Modal — opens on Location button press */}
      <ActivityMapModal
        visible={!!selectedActivityForMap}
        onClose={() => setSelectedActivityForMap(null)}
        activity={selectedActivityForMap}
      />

      {/* Social Share Modal overlay */}
      <SocialShareModal
        visible={!!shareActivity}
        onClose={() => setShareActivity(null)}
        activity={shareActivity}
      />

      {/* Host Mode Requests Modal */}
      <RequestsModal
        visible={showRequests}
        onClose={() => setShowRequests(false)}
        onViewProfile={(user) => setSelectedUser(user)}
      />

      {/* Profile Modal for incoming requests */}
      <HostProfile
        visible={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        host={selectedUser}
        accentColor="#10B981"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    textAlign: 'left',
  },
  scrollContent: {
    paddingBottom: vs(100),
  },
});

export default ActivityScreen;
