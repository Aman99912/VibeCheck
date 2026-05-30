import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Header, Colors, vs } from '../../Reusable-Component';
import TabBar from './ACCTIVITY-COMPONENT/TabBar';
import SectionHeader from './ACCTIVITY-COMPONENT/SectionHeader';
import LiveActivityCard from './ACCTIVITY-COMPONENT/LiveActivityCard';
import PastActivityCard from './ACCTIVITY-COMPONENT/PastActivityCard';

const MOCK_CURRENT = {
  title: 'Evening Football Match',
  emoji: '⚽',
  location: 'Central Park, Koramangala',
  time: 'Started 45 mins ago',
  joined: 6,
  limit: 8,
};

const MOCK_PAST = [
  {
    id: '1',
    title: 'Live Music Night',
    emoji: '🎵',
    location: 'Indie Grounds, Koramangala',
    date: '12 May, 7:00 PM – 10:00 PM',
    joined: 8,
    limit: 8,
  },
  {
    id: '2',
    title: 'Cafe Meetup',
    emoji: '☕',
    location: 'Cafe De Flora, Koramangala',
    date: '10 May, 5:00 PM – 7:00 PM',
    joined: 5,
    limit: 6,
  },
  {
    id: '3',
    title: 'Basketball Game',
    emoji: '🏀',
    location: 'Koramangala Indoor Court',
    date: '8 May, 4:00 PM – 6:00 PM',
    joined: 10,
    limit: 10,
  },
  {
    id: '4',
    title: 'Board Games Evening',
    emoji: '🎲',
    location: 'The Hive Cafe, Indiranagar',
    date: '5 May, 6:00 PM – 9:00 PM',
    joined: 6,
    limit: 8,
  },
];

const ActivityScreen = () => {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <View style={styles.container}>
      <Header
        title="My Activity"
        titleStyle={styles.headerTitle}
        rightIcon="filter-list"
        onRightPress={() => console.log('Filter pressed')}
        borderBottom={false}
      />

      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{ current: 1, past: MOCK_PAST.length }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'current' && (
          <>
            <SectionHeader
              title="Current"
              showDot
              subtitle="Live Now"
              subtitleColor={Colors.success}
            />
            <LiveActivityCard
              activity={MOCK_CURRENT}
              onChat={() => console.log('Open chat')}
              onViewLocation={() => console.log('View location')}
              onMenu={() => console.log('Menu pressed')}
            />
          </>
        )}

        {activeTab === 'past' && (
          <>
            <SectionHeader
              title="Past"
              badgeCount={MOCK_PAST.length}
              showViewAll
              onViewAll={() => console.log('View all past')}
            />
            {MOCK_PAST.map((activity) => (
              <PastActivityCard
                key={activity.id}
                activity={activity}
                onViewHighlights={() => console.log('View highlights:', activity.title)}
                onAddHighlight={() => console.log('Add highlight:', activity.title)}
                onPress={() => console.log('Open activity:', activity.title)}
              />
            ))}
          </>
        )}
      </ScrollView>
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
