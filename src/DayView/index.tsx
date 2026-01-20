import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, useWindowDimensions, Platform, ScrollView } from "react-native";
import {
  Animated,
  useSharedValue,
  useAnimatedScrollHandler,
} from "../utils/reanimated";
import dayjs from "dayjs";
import { CalendarEvent } from "../types";
import { CalendarTheme } from "../utils/theme";
import { HOURS_IN_DAY } from "../utils/dateUtils";
import { TimeRail } from "../shared/TimeRail";
import { NowIndicator } from "../shared/NowIndicator";
import { useNowIndicator } from "../shared/useNowIndicator";
import { PropertyLane } from "./components/PropertyLane";
import { PropertyHeader } from "./components/PropertyHeader";
import { getEventsForDate, groupEventsByProperty } from "./utils";
import {
  HOUR_HEIGHT,
  TIME_COLUMN_WIDTH,
  PROPERTY_LANE_WIDTH_PERCENTAGE,
  PROPERTY_LANE_MIN_WIDTH,
  PROPERTY_LANE_MAX_WIDTH,
  HEADER_HEIGHT,
  SCROLL_EVENT_THROTTLE,
  CONTENT_PADDING_TOP,
  DEFAULT_BACKGROUND,
  TIME_PADDING_HORIZONTAL,
  TIME_TEXT_OFFSET,
  TIME_FONT_SIZE,
  TIME_FONT_WEIGHT,
  GRID_LINE_HEIGHT,
  SCROLL_BUFFER_PX,
} from "./constants";
import { PropertyGroup } from "./types";
import { CalendarErrorBoundary } from "../shared/ErrorBoundary";

export interface DayViewProps {
  events: CalendarEvent[];
  targetDate: Date;
  onEventPress: (event: CalendarEvent) => void;
  theme: CalendarTheme;
  availableProperties?: Array<{ id: number; name?: string }>;
  propertiesToShow?: Array<{ id: number; name?: string }>;
  autoScrollToNow?: boolean;
  propertyColors?: string[]; // Optional: custom property colors array
  propertyColorsDark?: string[]; // Optional: custom dark property colors array
}

/**
 * DayView Component
 *
 * A vertical time-based calendar view with:
 * - Always-visible 24-hour timeline on the left
 * - Data-dependent property swim lanes with horizontal scrolling
 * - Synchronized header and content scrolling
 * - Protected by error boundary for robust error handling
 */
export const DayView: React.FC<DayViewProps> = ({
  events,
  targetDate,
  onEventPress,
  theme,
  availableProperties = [],
  propertiesToShow,
  autoScrollToNow = false,
  propertyColors,
  propertyColorsDark,
}) => {
  const styles = createStyles(theme);
  const { minutesSinceStartOfDay, isToday: isTodayHelper } = useNowIndicator();
  const verticalScrollRef = useRef<React.ComponentRef<typeof Animated.ScrollView> | null>(null);
  const hasAutoScrolledRef = useRef(false);
  const hasScrolledToTimeRef = useRef(false);
  // Refs for horizontal scroll synchronization
  const horizontalContentScrollRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);
  const horizontalHeaderScrollRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);
  // SSR-safe: useWindowDimensions may not be available during SSR
  const windowDimensions = useWindowDimensions();
  const screenWidth =
    typeof window !== "undefined" ? windowDimensions.width : 0;
  const scrollY = useSharedValue(0);

  // Simple one-way horizontal scroll sync handler (content -> header)
  const handleHorizontalScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    // Sync header scroll position with content
    if (horizontalHeaderScrollRef.current) {
      (horizontalHeaderScrollRef.current as any).scrollTo({
        x: scrollX,
        animated: false,
      });
    }
  };

  // Filter and group events
  const eventsByProperty = useMemo(() => {
    const dayEvents = getEventsForDate(events, targetDate);
    return groupEventsByProperty(
      dayEvents,
      availableProperties,
      propertiesToShow
    );
  }, [events, targetDate, availableProperties, propertiesToShow]);

  // Calculate property width: full width if only one property, otherwise use dynamic width
  const propertyWidth = useMemo(() => {
    if (eventsByProperty.length === 1) {
      // Full width for single property
      return screenWidth - TIME_COLUMN_WIDTH - 26;
    }
    // Dynamic width for multiple properties - percentage of available width
    const availableWidth = screenWidth - TIME_COLUMN_WIDTH;
    const calculatedWidth = availableWidth * PROPERTY_LANE_WIDTH_PERCENTAGE;
    // Clamp between min and max for consistent proportions
    return Math.max(
      PROPERTY_LANE_MIN_WIDTH,
      Math.min(PROPERTY_LANE_MAX_WIDTH, calculatedWidth)
    );
  }, [eventsByProperty.length, screenWidth]);

  // Calculate dimensions
  const totalHeight = HOUR_HEIGHT * HOURS_IN_DAY;
  const showNowIndicator = isTodayHelper(targetDate);
  const nowIndicatorTop = useMemo(() => {
    if (!showNowIndicator) return null;
    const top = (minutesSinceStartOfDay / 60) * HOUR_HEIGHT;
    return Math.min(top, totalHeight - 1);
  }, [showNowIndicator, minutesSinceStartOfDay, totalHeight]);
  const autoScrollOffset = useMemo(() => {
    if (!showNowIndicator || nowIndicatorTop === null) return 0;
    return Math.max(nowIndicatorTop - SCROLL_BUFFER_PX, 0);
  }, [showNowIndicator, nowIndicatorTop]);

  // Calculate scroll offset from targetDate time (if it has meaningful time)
  const scrollToTimeOffset = useMemo(() => {
    const hours = targetDate.getHours();
    const minutes = targetDate.getMinutes();
    const hasTime = hours !== 0 || minutes !== 0;

    if (!hasTime) return null;

    const dayStart = dayjs(targetDate).startOf("day");
    const targetTime = dayjs(targetDate);
    const minutesSinceStart = targetTime.diff(dayStart, "minute");

    const offset = (minutesSinceStart / 60) * HOUR_HEIGHT - SCROLL_BUFFER_PX;
    return Math.max(0, Math.min(offset, totalHeight - 1));
  }, [targetDate, totalHeight]);

  // Reset scroll flags when targetDate changes
  useEffect(() => {
    hasAutoScrolledRef.current = false;
    hasScrolledToTimeRef.current = false;
  }, [targetDate]);

  // Scroll to time from targetDate (priority over autoScrollToNow)
  useEffect(() => {
    if (
      scrollToTimeOffset === null ||
      hasScrolledToTimeRef.current ||
      !verticalScrollRef.current
    ) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      (verticalScrollRef.current as any)?.scrollTo({
        y: scrollToTimeOffset,
        animated: true,
      });
      hasScrolledToTimeRef.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, [scrollToTimeOffset]);

  // Auto-scroll to now (only if no explicit time in targetDate)
  useEffect(() => {
    if (
      !autoScrollToNow ||
      !showNowIndicator ||
      hasAutoScrolledRef.current ||
      hasScrolledToTimeRef.current ||
      nowIndicatorTop === null ||
      scrollToTimeOffset !== null
    ) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      (verticalScrollRef.current as any)?.scrollTo({
        y: autoScrollOffset,
        animated: false,
      });
      hasAutoScrolledRef.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, [
    autoScrollToNow,
    showNowIndicator,
    autoScrollOffset,
    nowIndicatorTop,
    scrollToTimeOffset,
  ]);

  return (
    <CalendarErrorBoundary
      theme={theme}
      onError={(error, errorInfo) => {
        // Error handled by ErrorBoundary's onError callback
      }}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.contentContainer}>
          {/* Sticky Header - Outside vertical scroll, positioned absolutely/sticky */}
          <View style={styles.stickyHeaderContainer}>
            <View style={styles.timeColumnSpacer} />
            <View style={styles.stickyHeaderWrapper}>
              {Platform.OS === "web" ? (
                <ScrollView
                  ref={horizontalHeaderScrollRef as any}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.stickyHeaderScroll}
                  scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                  bounces={false}
                  scrollEnabled={false} // Disable direct scrolling, only sync from content
                >
                  <View style={styles.stickyHeaderRow}>
                    {eventsByProperty.map((propertyGroup: PropertyGroup) => (
                      <PropertyHeader
                        key={propertyGroup.propertyId}
                        propertyName={propertyGroup.propertyName}
                        propertyId={propertyGroup.propertyId}
                        theme={theme}
                        width={propertyWidth}
                      />
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <Animated.ScrollView
                  ref={horizontalHeaderScrollRef as any}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.stickyHeaderScroll}
                  scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                  bounces={false}
                  scrollEnabled={false}
                >
                  <View style={styles.stickyHeaderRow}>
                    {eventsByProperty.map((propertyGroup: PropertyGroup) => (
                      <PropertyHeader
                        key={propertyGroup.propertyId}
                        propertyName={propertyGroup.propertyName}
                        propertyId={propertyGroup.propertyId}
                        theme={theme}
                        width={propertyWidth}
                      />
                    ))}
                  </View>
                </Animated.ScrollView>
              )}
            </View>
          </View>

          {/* Vertical Scrollable Content */}
          {Platform.OS === "web" ? (
            <ScrollView
              ref={verticalScrollRef as any}
              style={styles.contentScroll}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              onScroll={(event: any) => {
                scrollY.value = event.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={16}
            >
              <View style={styles.content}>
                {/* Time Rail - Fixed on left */}
                <TimeRail
                  theme={theme}
                  hourHeight={HOUR_HEIGHT}
                  timeColumnWidth={TIME_COLUMN_WIDTH}
                  totalHeight={totalHeight}
                  gridLineHeight={GRID_LINE_HEIGHT}
                  timePaddingHorizontal={TIME_PADDING_HORIZONTAL}
                  timeTextOffset={TIME_TEXT_OFFSET}
                  timeFontSize={TIME_FONT_SIZE}
                  timeFontWeight={TIME_FONT_WEIGHT}
                />

                {/* Horizontal Scroll Container for Content Only */}
                <View style={styles.horizontalScrollContainer}>
                  <ScrollView
                    ref={horizontalContentScrollRef as any}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalScroll}
                    onScroll={handleHorizontalScroll}
                    scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                    bounces={false}
                  >
                    <View style={styles.propertyLanesRow}>
                      {eventsByProperty.map((propertyGroup: PropertyGroup) => (
                        <PropertyLane
                          key={propertyGroup.propertyId}
                          propertyGroup={propertyGroup}
                          height={totalHeight}
                          width={propertyWidth}
                          hourHeight={HOUR_HEIGHT}
                          onEventPress={onEventPress}
                          theme={theme}
                          targetDate={targetDate}
                          allEvents={events}
                          availableProperties={availableProperties}
                          scrollY={scrollY}
                          propertyColors={propertyColors}
                          propertyColorsDark={propertyColorsDark}
                        />
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {nowIndicatorTop !== null && (
                  <NowIndicator
                    top={nowIndicatorTop}
                    theme={theme}
                    lineLeft={TIME_COLUMN_WIDTH}
                    lineRight={0}
                    dotLeft={TIME_COLUMN_WIDTH}
                    thickness={2}
                  />
                )}
              </View>
            </ScrollView>
          ) : (
            <Animated.ScrollView
              ref={verticalScrollRef}
              style={styles.contentScroll}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              onScroll={useAnimatedScrollHandler({
                onScroll: (event: { contentOffset: { y: number } }) => {
                  'worklet';
                  scrollY.value = event.contentOffset.y;
                },
              })}
              scrollEventThrottle={16}
            >
              <View style={styles.content}>
                {/* Time Rail - Fixed on left */}
                <TimeRail
                  theme={theme}
                  hourHeight={HOUR_HEIGHT}
                  timeColumnWidth={TIME_COLUMN_WIDTH}
                  totalHeight={totalHeight}
                  gridLineHeight={GRID_LINE_HEIGHT}
                  timePaddingHorizontal={TIME_PADDING_HORIZONTAL}
                  timeTextOffset={TIME_TEXT_OFFSET}
                  timeFontSize={TIME_FONT_SIZE}
                  timeFontWeight={TIME_FONT_WEIGHT}
                />

                {/* Horizontal Scroll Container for Content Only */}
                <View style={styles.horizontalScrollContainer}>
                  <Animated.ScrollView
                    ref={horizontalContentScrollRef as any}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalScroll}
                    onScroll={handleHorizontalScroll}
                    scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                    bounces={false}
                  >
                    <View style={styles.propertyLanesRow}>
                      {eventsByProperty.map((propertyGroup: PropertyGroup) => (
                        <PropertyLane
                          key={propertyGroup.propertyId}
                          propertyGroup={propertyGroup}
                          height={totalHeight}
                          width={propertyWidth}
                          hourHeight={HOUR_HEIGHT}
                          onEventPress={onEventPress}
                          theme={theme}
                          targetDate={targetDate}
                          allEvents={events}
                          availableProperties={availableProperties}
                          scrollY={scrollY}
                          propertyColors={propertyColors}
                          propertyColorsDark={propertyColorsDark}
                        />
                      ))}
                    </View>
                  </Animated.ScrollView>
                </View>

                {nowIndicatorTop !== null && (
                  <NowIndicator
                    top={nowIndicatorTop}
                    theme={theme}
                    lineLeft={TIME_COLUMN_WIDTH}
                    lineRight={0}
                    dotLeft={TIME_COLUMN_WIDTH}
                    thickness={2}
                  />
                )}
              </View>
            </Animated.ScrollView>
          )}
        </View>
      </View>
    </CalendarErrorBoundary>
  );
};

const createStyles = (theme: CalendarTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // Web-specific: Ensure container has constrained height for scrolling
      ...(Platform.OS === "web" &&
        typeof window !== "undefined" && {
          height: "100%",
          minHeight: 0, // Important for flex children on web
        }),
    },
    contentContainer: {
      flex: 1,
      backgroundColor: theme.background,
      // Web-specific: Constrain height for scrolling
      ...(Platform.OS === "web" &&
        typeof window !== "undefined" && {
          height: "100%",
          minHeight: 0,
        }),
    },
    contentScroll: {
      flex: 1,
      paddingTop: CONTENT_PADDING_TOP + HEADER_HEIGHT, // Add header height to account for sticky header
      // Web-specific: Explicit height constraint and overflow for scrolling
      ...(Platform.OS === "web" &&
        typeof window !== "undefined" && {
          height: "100%",
          maxHeight: "100%",
          minHeight: 0,
          // @ts-ignore - web-specific CSS properties
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
        }),
    },
    content: {
      flexDirection: "row",
      minHeight: HOUR_HEIGHT * HOURS_IN_DAY,
      position: "relative",
    },
    stickyHeaderContainer: {
      position: Platform.OS === "web" ? ("sticky" as any) : "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_HEIGHT,
      backgroundColor: theme.background,
      zIndex: 10,
      flexDirection: "row",
      // Web-specific: Sticky positioning
      ...(Platform.OS === "web" &&
        typeof window !== "undefined" && {
          // @ts-ignore - web-specific CSS properties
          position: "sticky",
        }),
    },
    timeColumnSpacer: {
      width: TIME_COLUMN_WIDTH,
      backgroundColor: theme.background,
    },
    stickyHeaderWrapper: {
      flex: 1,
    },
    stickyHeaderScroll: {
      flex: 1,
      // Web-specific: Ensure horizontal scrolling works
      ...(Platform.OS === "web" &&
        typeof window !== "undefined" && {
          minHeight: 0,
        }),
    },
    stickyHeaderRow: {
      flexDirection: "row",
      height: HEADER_HEIGHT,
    },
    horizontalScrollContainer: {
      flex: 1,
      position: "relative",
      // Web-specific: Ensure proper layout
      ...(Platform.OS === "web" &&
        typeof window !== "undefined" && {
          minHeight: 0,
        }),
    },
    horizontalScroll: {
      flex: 1,
      // Web-specific: Ensure horizontal scrolling works
      ...(Platform.OS === "web" &&
        typeof window !== "undefined" && {
          minHeight: 0,
          // @ts-ignore - web-specific CSS properties
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
        }),
    },
    propertyLanesRow: {
      flexDirection: "row",
    },
  });
