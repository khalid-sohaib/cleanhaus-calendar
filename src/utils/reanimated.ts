/**
 * Cross-platform reanimated wrapper
 *
 * Provides conditional imports for react-native-reanimated:
 * - Uses reanimated on native platforms (iOS/Android)
 * - Provides fallbacks for web platform
 * - Gracefully handles when reanimated is not available
 *
 * Uses lazy loading to prevent webpack from statically analyzing requires
 */

import { Platform, View as RNView, ScrollView as RNScrollView } from 'react-native';
import { isWeb } from './platform';
import React from 'react';

// Lazy getter function to prevent webpack static analysis
const lazyRequire = (moduleName: string): any => {
  try {
    // Use Function constructor to prevent webpack from analyzing this
    const requireFunc = new Function('name', 'return typeof require !== "undefined" ? require(name) : null');
    return requireFunc(moduleName);
  } catch (e) {
    return null;
  }
};

// Initialize with web fallbacks by default
let Animated: any = {
  View: null,
  ScrollView: null,
};

// Type-safe fallback functions that match reanimated API
let useSharedValue = <T,>(initial: T): SharedValue<T> => ({ value: initial });
let useAnimatedStyle = (updater?: () => any, deps?: any[]): any => updater ? updater() : {};
let useAnimatedScrollHandler = (handlers?: any, deps?: any[]): any => handlers || {};
let useAnimatedRef = <T,>(): AnimatedRef<T> => ({ current: null as T | null });
let scrollTo = (ref: any, x: number, y: number, animated?: boolean): void => {};

// Only try to load reanimated on native platforms
if (!isWeb) {
  // Lazy initialization function
  const initReanimated = () => {
    try {
      // Check platform first
      const RN = lazyRequire('react-native');
      if (!RN || !RN.Platform || RN.Platform.OS === 'web') {
        return false;
      }
      // Try to load reanimated
      // Use computed string to prevent webpack static analysis
      const reanimatedModuleName = ['react', 'native', 'reanimated'].join('-');
      const reanimated = lazyRequire(reanimatedModuleName);
      if (!reanimated) {
        return false;
      }
      // Successfully loaded reanimated
      Animated = reanimated.default || reanimated;
      useSharedValue = reanimated.useSharedValue;
      useAnimatedStyle = reanimated.useAnimatedStyle;
      useAnimatedScrollHandler = reanimated.useAnimatedScrollHandler;
      useAnimatedRef = reanimated.useAnimatedRef;
      scrollTo = reanimated.scrollTo;
      return true;
    } catch (e) {
      return false;
    }
  };
  // Try to initialize, fallback to RN Animated if reanimated fails
  if (!initReanimated()) {
    try {
      const RN = lazyRequire('react-native');
      if (RN && RN.Animated) {
        Animated = RN.Animated;
      }
    } catch (e) {
      // Keep web fallbacks
    }
  }
} else {
  // Web platform - use react-native-web components directly
  // These are imported at the top and webpack will resolve them correctly
  // Create fallback components in case imports fail
  const FallbackView = React.forwardRef((props: any, ref: any) => {
    return React.createElement('div', { ...props, ref });
  });
  
  const FallbackScrollView = React.forwardRef((props: any, ref: any) => {
    return React.createElement('div', {
      ...props,
      ref,
      style: { overflow: 'auto', ...props.style }
    });
  });
  
  // Always provide valid React components - never null
  // Use imported RNView/RNScrollView (which webpack resolves to react-native-web)
  // or fallback to React.createElement components
  Animated = {
    View: RNView || FallbackView,
    ScrollView: RNScrollView || FallbackScrollView,
  };
}

export type SharedValue<T> = {
  value: T;
};

export type AnimatedStyle = any;
export type AnimatedScrollHandler = any;
export type AnimatedRef<T> = {
  current: T | null;
};

export interface AnimatedComponent {
  ScrollView: any;
  View: any;
}

// Export Animated namespace for type references like Animated.ScrollView
export namespace Animated {
  export type ScrollView = any;
  export type View = any;
}

export { Animated, useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, useAnimatedRef, scrollTo };

