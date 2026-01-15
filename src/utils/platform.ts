/**
 * Cross-platform platform detection utilities
 * Works on React Native, Web (Next.js/React), and Node.js
 */

import { Platform } from 'react-native';

/**
 * Check if running on web platform
 * Returns true when running in browser (Next.js, React, Expo web)
 */
export const isWeb = Platform.OS === 'web';

/**
 * Check if running on iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Check if running on Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Check if running on native platform (iOS or Android)
 */
export const isNative = Platform.OS !== 'web';

/**
 * Cross-platform development mode detection
 * Works on React Native, Web, and Node.js
 * 
 * @returns true if in development mode, false otherwise
 */
export const isDev = (): boolean => {
  // React Native: use __DEV__ global
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__;
  }
  
  // Web/Node.js: use process.env.NODE_ENV
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV !== 'production';
  }
  
  // Fallback: assume production
  return false;
};

