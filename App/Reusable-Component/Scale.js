/**
 * Scale.js  ─  Moderate Scaling Utility
 *
 * Uses the "moderate scale" algorithm so that UI dimensions scale
 * proportionally across small & large screens without growing too
 * aggressively on tablets.
 *
 * Usage:
 *   import { s, vs, ms, msvs, width, height } from './Scale';
 *
 *   s(16)       → horizontally scaled value
 *   vs(16)      → vertically scaled value
 *   ms(16)      → moderately scaled (default factor 0.5)
 *   ms(16, 0.3) → moderately scaled with custom factor
 *   msvs(16)    → vertically moderate scaled
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design dimensions (design was made on a 390 × 844 screen — iPhone 14)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/** Horizontal scale */
export const s = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;

/** Vertical scale */
export const vs = (size) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

/**
 * Moderate horizontal scale.
 * @param {number} size    - base size from the design
 * @param {number} factor  - scaling factor between 0 (no scaling) and 1 (full scaling). Default 0.5
 */
export const ms = (size, factor = 0.5) =>
  size + (s(size) - size) * factor;

/**
 * Moderate vertical scale.
 */
export const msvs = (size, factor = 0.5) =>
  size + (vs(size) - size) * factor;

/** Screen dimensions */
export const width = SCREEN_WIDTH;
export const height = SCREEN_HEIGHT;

/** Pixel ratio helpers */
export const pixelRatio = PixelRatio.get();
export const fontScale = PixelRatio.getFontScale();

/**
 * Normalize font size so it respects the design but ignores the OS
 * accessibility font-size setting (pair with allowFontScaling={false}).
 */
export const normFont = (size) => ms(size, 0.3);

export default {
  s,
  vs,
  ms,
  msvs,
  normFont,
  width,
  height,
};
