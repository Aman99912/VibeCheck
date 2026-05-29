/**
 * Logo.js  ─  App Logo Component
 *
 * Renders the Vibe-Match logo in two modes:
 *   • icon  – just the emblem (circle with "VM" letters or a custom image)
 *   • full  – emblem + "Vibe-Match" text beside it
 *   • stacked – emblem above text (for splash / auth screens)
 *
 * Sizes: xs | sm | md | lg | xl
 *
 * Usage:
 *   <Logo />                          ← default: full, md
 *   <Logo mode="icon" size="sm" />
 *   <Logo mode="stacked" size="xl" />
 *   <Logo light />                    ← white variant for dark backgrounds
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CText from './CText';
import Colors from './Colors';
import { ms, vs, normFont } from './Scale';

const SIZE_MAP = {
  xs: { emblem: ms(28), icon: ms(16), font: normFont(14), gap: ms(6) },
  sm: { emblem: ms(36), icon: ms(20), font: normFont(16), gap: ms(8) },
  md: { emblem: ms(46), icon: ms(26), font: normFont(20), gap: ms(10) },
  lg: { emblem: ms(60), icon: ms(34), font: normFont(26), gap: ms(12) },
  xl: { emblem: ms(80), icon: ms(46), font: normFont(34), gap: ms(16) },
};

// ─── Emblem (the location-pin heart emblem) ───────────────────────────────
const Emblem = ({ sz, light }) => {
  const pinColor = light ? Colors.white : Colors.primary;
  const heartColor = light ? Colors.primary : Colors.white;
  return (
    <View style={[styles.emblem, { width: sz.emblem, height: sz.emblem }]}>
      <MaterialIcons
        name="location-pin"
        size={sz.emblem}
        color={pinColor}
      />
      <View style={[styles.checkContainer, { transform: [{ translateY: -sz.emblem * 0.08 }] }]}>
        <MaterialIcons
          name="favorite"
          size={sz.emblem * 0.42}
          color={heartColor}
        />
      </View>
    </View>
  );
};

// ─── Square Emblem (the VibeCheck rounded square emblem) ─────────────────────
const SquareLogo = ({ sz, light }) => {
  const bg = light ? Colors.white : Colors.secondary;
  const fg = light ? Colors.secondary : Colors.white;
  return (
    <View
      style={[
        styles.squareLogo,
        {
          width: sz.emblem * 1.25,
          height: sz.emblem * 1.25,
          borderRadius: sz.emblem * 0.28,
          backgroundColor: bg,
        },
      ]}
    >
      <CText
        variant="display"
        weight="black"
        color={fg}
        style={{ fontSize: sz.font * 1.4, lineHeight: sz.font * 1.4, marginTop: vs(2) }}
      >
        V
      </CText>
    </View>
  );
};

// ─── Text mark ───────────────────────────────────────────────────────────────
const TextMark = ({ sz, light, appName = 'VibeCheck', style }) => {
  let part1 = appName;
  let part2 = '';
  if (appName === 'VibeCheck') {
    part1 = 'Vibe';
    part2 = 'Check';
  } else if (appName === 'VibeMatch') {
    part1 = 'Vibe';
    part2 = 'Match';
  }

  return (
    <View style={[styles.textMark, style]}>
      <CText
        variant="h2"
        weight="black"
        color={light ? Colors.white : Colors.primary}
        style={{ fontSize: sz.font, letterSpacing: -0.5 }}
      >
        {part1}
      </CText>
      {part2 ? (
        <CText
          variant="h2"
          weight="black"
          color={light ? Colors.offWhite : Colors.textPrimary}
          style={{ fontSize: sz.font, letterSpacing: -0.5 }}
        >
          {part2}
        </CText>
      ) : null}
    </View>
  );
};

const Logo = ({
  mode = 'full',  // 'icon' | 'text' | 'full' | 'stacked' | 'square' | 'square-stacked'
  size = 'md',
  light = false,
  appName = 'VibeCheck',
  style,
}) => {
  const sz = SIZE_MAP[size] ?? SIZE_MAP.md;

  if (mode === 'icon') {
    return (
      <View style={style}>
        <Emblem sz={sz} light={light} />
      </View>
    );
  }

  if (mode === 'text') {
    return (
      <View style={style}>
        <TextMark sz={sz} light={light} appName={appName} />
      </View>
    );
  }

  if (mode === 'square') {
    return (
      <View style={style}>
        <SquareLogo sz={sz} light={light} />
      </View>
    );
  }

  if (mode === 'square-stacked') {
    return (
      <View style={[styles.stacked, style]}>
        <SquareLogo sz={sz} light={light} />
        <TextMark sz={sz} light={light} appName={appName} style={{ marginTop: vs(8), justifyContent: 'center' }} />
      </View>
    );
  }

  if (mode === 'stacked') {
    return (
      <View style={[styles.stacked, style]}>
        <Emblem sz={sz} light={light} />
        <TextMark sz={sz} light={light} appName={appName} style={{ marginTop: vs(8), justifyContent: 'center' }} />
      </View>
    );
  }

  // full — horizontal
  return (
    <View style={[styles.full, style]}>
      <Emblem sz={sz} light={light} />
      <TextMark sz={sz} light={light} appName={appName} style={{ marginLeft: sz.gap }} />
    </View>
  );
};

const styles = StyleSheet.create({
  emblem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  checkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareLogo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stacked: {
    alignItems: 'center',
  },
  textMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(2),
  },
});

export default Logo;
