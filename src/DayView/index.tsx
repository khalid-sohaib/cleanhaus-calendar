import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, useWindowDimensions, Platform } from "react-native";
import {
  Animated,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
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
import { useScrollSynchronization } from "./hooks/useScrollSynchronization";
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
  const scrollSync = useScrollSynchronization();
  const { minutesSinceStartOfDay, isToday: isTodayHelper } = useNowIndicator();
  const verticalScrollRef = useRef<Animated.ScrollView | null>(null);
  const hasAutoScrolledRef = useRef(false);
  const hasScrolledToTimeRef = useRef(false);
  // SSR-safe: useWindowDimensions may not be available during SSR
  const windowDimensions = useWindowDimensions();
  const screenWidth =
    typeof window !== "undefined" ? windowDimensions.width : 0;
  const scrollY = useSharedValue(0);

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
      verticalScrollRef.current?.scrollTo({
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
      verticalScrollRef.current?.scrollTo({
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
          {/* Sticky Property Headers */}
          <View style={styles.timeColumnSpacer}>
            <View style={styles.stickyHeadersContainer}>
              <Animated.ScrollView
                ref={scrollSync.headerScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.stickyHeadersScroll}
                onScroll={scrollSync.handleHeaderScroll}
                scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                bounces={false}
              >
                <View style={styles.stickyHeadersRow}>
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
            </View>
          </View>

          {/* Scrollable Content */}
          <Animated.ScrollView
            ref={verticalScrollRef}
            style={styles.contentScroll}
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={false}
            onScroll={useAnimatedScrollHandler({
              onScroll: (event: { contentOffset: { y: number } }) => {
                scrollY.value = event.contentOffset.y;
              },
            })}
            scrollEventThrottle={16}
          >
            <View style={styles.content}>
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

              <Animated.ScrollView
                ref={scrollSync.contentScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.propertyLanesScroll}
                onScroll={scrollSync.handleContentScroll}
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
          </Animated.ScrollView>
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
    stickyHeadersContainer: {
      flexDirection: "row",
      height: HEADER_HEIGHT,
      backgroundColor: theme.background,
      zIndex: 10,
    },
    timeColumnSpacer: {
      marginLeft: TIME_COLUMN_WIDTH,
    },
    stickyHeadersScroll: {
      flex: 1,
      // Web-specific: Ensure horizontal scrolling works
      ...(Platform.OS === "web" &&
        typeof window !== "undefined" && {
          minHeight: 0,
        }),
    },
    stickyHeadersRow: {
      flexDirection: "row",
    },
    contentScroll: {
      flex: 1,
      paddingTop: CONTENT_PADDING_TOP,
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
    timeColumnContainer: {
      // Time column styling handled by TimeColumn component
    },
    propertyLanesScroll: {
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
