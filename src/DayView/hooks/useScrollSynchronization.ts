import { useRef } from "react";
import { ScrollView } from "react-native";
import {
  Animated,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  scrollTo,
} from "../../utils/reanimated";

/**
 * High-performance scroll synchronization hook using React Native Reanimated.
 *
 * Benefits over JS-based approach:
 * - Runs on UI thread (no JS bridge overhead)
 * - 60fps smooth synchronization with no frame drops
 * - Zero latency between header and content scrolls
 * - Eliminates flicker and jank
 *
 * Uses shared values to track scroll positions and worklets for native-level sync.
 *
 * @returns Object containing animated refs and scroll handlers
 */
export const useScrollSynchronization = () => {
  // Animated refs for native-level control
  const headerScrollRef = useAnimatedRef<Animated.ScrollView>();
  const contentScrollRef = useAnimatedRef<Animated.ScrollView>();

  // Shared values for scroll positions (run on UI thread)
  const headerScrollX = useSharedValue(0);
  const contentScrollX = useSharedValue(0);

  // Lock flags to prevent circular updates (shared values for UI thread access)
  const isHeaderScrolling = useSharedValue(false);
  const isContentScrolling = useSharedValue(false);

  /**
   * Animated scroll handler for header ScrollView
   * Runs on UI thread for zero-latency synchronization
   */
  const handleHeaderScroll = useAnimatedScrollHandler({
    onScroll: (event: { contentOffset: { x: number; y: number } }) => {
      // Ignore if content is currently being scrolled by user
      if (isContentScrolling.value) {
        return;
      }

      // Lock header scrolling
      isHeaderScrolling.value = true;

      // Update header position
      headerScrollX.value = event.contentOffset.x;

      // Synchronize content scroll (runs natively on UI thread)
      scrollTo(contentScrollRef, event.contentOffset.x, 0, false);
    },
    onMomentumEnd: () => {
      // Release lock when scrolling momentum ends
      isHeaderScrolling.value = false;
    },
    onEndDrag: () => {
      // Release lock when user stops dragging
      isHeaderScrolling.value = false;
    },
  });

  /**
   * Animated scroll handler for content ScrollView
   * Runs on UI thread for zero-latency synchronization
   */
  const handleContentScroll = useAnimatedScrollHandler({
    onScroll: (event: { contentOffset: { x: number; y: number } }) => {
      // Ignore if header is currently being scrolled by user
      if (isHeaderScrolling.value) {
        return;
      }

      // Lock content scrolling
      isContentScrolling.value = true;

      // Update content position
      contentScrollX.value = event.contentOffset.x;

      // Synchronize header scroll (runs natively on UI thread)
      scrollTo(headerScrollRef, event.contentOffset.x, 0, false);
    },
    onMomentumEnd: () => {
      // Release lock when scrolling momentum ends
      isContentScrolling.value = false;
    },
    onEndDrag: () => {
      // Release lock when user stops dragging
      isContentScrolling.value = false;
    },
  });

  return {
    headerScrollRef,
    contentScrollRef,
    handleHeaderScroll,
    handleContentScroll,
  };
};
