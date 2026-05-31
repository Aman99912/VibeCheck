import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, CText, ms, vs } from '../../../Reusable-Component';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const formatTimeRemaining = (mins) => {
  if (mins < 60) {
    return `${mins}min`;
  }
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}:${remainingMins < 10 ? '0' : ''}${remainingMins} hour`;
};

const AcceptActivityIsland = ({ activity, onPress }) => {
  const insets = useSafeAreaInsets();
  
  // Dimensions of the dynamic island capsule
  const pillWidth = ms(240);
  const pillHeight = vs(50);
  const r = ms(25);
  
  // Calculate SVG perimeter for path outline dash animation
  const perimeter = 2 * (pillWidth + pillHeight) - 8 * r + 2 * Math.PI * r;
  
  // Animated timer value from 1 (full time) to 0 (expired)
  const timerProgress = useRef(new Animated.Value(1)).current;

  const totalDuration = activity?.durationMins || 90;
  const [timeLeft, setTimeLeft] = useState(totalDuration);

  useEffect(() => {
    if (activity) {
      const dur = activity.durationMins || 90;
      setTimeLeft(dur);
      timerProgress.setValue(1); // Start with a fully filled border
    }
  }, [activity, timerProgress]);

  useEffect(() => {
    if (activity) {
      // Decrement remaining time every minute
      const interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 1 ? prev - 1 : 0));
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [activity]);

  useEffect(() => {
    if (activity) {
      const targetValue = timeLeft / totalDuration;
      Animated.timing(timerProgress, {
        toValue: targetValue,
        duration: 800, // Smoothly animate border change
        useNativeDriver: false,
      }).start();
    }
  }, [timeLeft, totalDuration, timerProgress, activity]);

  if (!activity) return null;

  const title = activity.title || 'Joined Vibe';
  const emoji = activity.emoji || (activity.icon === 'sports_soccer' ? '⚽' : '📍');

  const strokeDashoffset = timerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [perimeter, 0],
  });

  return (
    <View style={[styles.container, { top: Math.max(insets.top, vs(10)) + vs(100) }]}>
      <TouchableOpacity
        style={[styles.pill, { width: pillWidth, height: pillHeight }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Animated Timer Border Ring (SVG path outline) */}
        <Svg width={pillWidth} height={pillHeight} style={StyleSheet.absoluteFill}>
          <AnimatedRect
            x={2}
            y={2}
            width={pillWidth - 4}
            height={pillHeight - 4}
            rx={r - 2}
            ry={r - 2}
            fill="transparent"
            stroke={Colors.primary}
            strokeWidth={4}
            strokeDasharray={perimeter}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>

        {/* Content Inside Capsule */}
        <View style={styles.content}>
          <CText variant="h4" style={styles.emoji}>
            {emoji}
          </CText>
          <View style={styles.textContainer}>
            <View style={styles.labelRow}>
              <CText variant="overline" weight="bold" color={Colors.primary} style={styles.label}>
                ACTIVE VIBE
              </CText>
              <CText variant="overline" weight="bold" color="rgba(255, 255, 255, 0.6)" style={styles.timeLabel}>
                • {formatTimeRemaining(timeLeft)}
              </CText>
            </View>
            <CText variant="bodySmall" weight="bold" color={Colors.white} numberOfLines={1} style={styles.titleText}>
              {title}
            </CText>
          </View>
          <MaterialIcons name="chevron-right" size={ms(20)} color={Colors.primary} style={styles.chevron} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pill: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)', // sleek dark Gen-Z dynamic island backing
    borderRadius: ms(25),
    justifyContent: 'center',
    paddingHorizontal: ms(16),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  emoji: {
    marginRight: ms(8),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: ms(8),
    letterSpacing: 0.8,
    marginBottom: vs(1),
  },
  timeLabel: {
    fontSize: ms(8),
    letterSpacing: 0.8,
    marginBottom: vs(1),
    marginLeft: ms(4),
  },
  titleText: {
    fontSize: ms(12),
  },
  chevron: {
    marginLeft: ms(4),
  },
});

export default AcceptActivityIsland;
