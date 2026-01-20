/**
 * Cross-platform reanimated wrapper
 * Provides conditional imports for react-native-reanimated
 */

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';

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

// Re-export Animated from react-native-reanimated
// Animated already has ScrollView and View types from the original package
export { Animated, useSharedValue, useAnimatedStyle, useAnimatedScrollHandler };
