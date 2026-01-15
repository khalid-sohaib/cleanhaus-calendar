import { useRef, useMemo } from "react";
import { PanResponder, PanResponderInstance, Platform } from "react-native";

/**
 * Configuration options for swipe gesture detection
 */
export interface SwipeGestureConfig {
  /** Minimum horizontal distance (in pixels) to trigger a swipe. Default: 50 */
  threshold?: number;
  /** Callback triggered when user swipes left (dx < -threshold) */
  onSwipeLeft?: () => void;
  /** Callback triggered when user swipes right (dx > threshold) */
  onSwipeRight?: () => void;
  /** Enable/disable swipe gesture detection. Default: true */
  enabled?: boolean;
}

const DEFAULT_SWIPE_THRESHOLD = 50;

/**
 * Custom hook for detecting horizontal swipe gestures using React Native's PanResponder.
 *
 * Based on react-native-big-calendar's implementation, this hook provides
 * a simple way to add swipe-to-navigate functionality to calendar views.
 *
 * **Web Compatibility**: Swipe gestures are automatically disabled on web platform.
 * Use navigation buttons or other UI controls for web users.
 *
 * @param config - Configuration object with swipe callbacks and options
 * @returns PanResponderInstance to be spread onto a View component
 *
 * @example
 * ```tsx
 * const panResponder = useSwipeGesture({
 *   onSwipeLeft: () => goToNextMonth(),
 *   onSwipeRight: () => goToPrevMonth(),
 *   threshold: 50,
 * });
 *
 * return (
 *   <View {...panResponder.panHandlers}>
 *     {/* Calendar content *\/}
 *   </View>
 * );
 * ```
 */
export function useSwipeGesture(
  config: SwipeGestureConfig
): PanResponderInstance {
  const {
    threshold = DEFAULT_SWIPE_THRESHOLD,
    onSwipeLeft,
    onSwipeRight,
    enabled = true,
  } = config;

  // Disable swipe gestures on web platform or when explicitly disabled
  if (Platform.OS === "web" || !enabled) {
    return useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => false,
          onMoveShouldSetPanResponder: () => false,
        }),
      []
    );
  }

  // Track whether the swipe has already been handled to prevent multiple triggers
  const panHandledRef = useRef(false);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      /**
       * Determine if this gesture should become the responder.
       * Only respond to horizontal gestures (where horizontal movement > vertical movement).
       * See: https://stackoverflow.com/questions/47568850/touchableopacity-with-parent-panresponder
       */
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!enabled) {
          return false;
        }

        const { dx, dy } = gestureState;

        // Only respond if we have swipe callbacks configured
        if (!onSwipeLeft && !onSwipeRight) {
          return false;
        }

        // Respond only to horizontal gestures (horizontal movement > vertical movement)
        // This prevents interfering with vertical scrolling
        return Math.abs(dx / dy) > 1;
      },

      /**
       * Handle the gesture movement.
       * Trigger callbacks when threshold is exceeded.
       */
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;

        // Ignore if:
        // 1. Vertical movement exceeds threshold (likely a scroll)
        // 2. Gesture already handled (prevent multiple triggers)
        if (dy < -1 * threshold || threshold < dy || panHandledRef.current) {
          return;
        }

        // Swipe left (negative dx) → typically "next" in calendar navigation
        if (dx < -1 * threshold) {
          onSwipeLeft?.();
          panHandledRef.current = true;
          return;
        }

        // Swipe right (positive dx) → typically "previous" in calendar navigation
        if (dx > threshold) {
          onSwipeRight?.();
          panHandledRef.current = true;
          return;
        }
      },

      /**
       * Reset the handled flag when gesture ends
       */
      onPanResponderEnd: () => {
        panHandledRef.current = false;
      },
    });
  }, [threshold, onSwipeLeft, onSwipeRight, enabled]);

  return panResponder;
}
