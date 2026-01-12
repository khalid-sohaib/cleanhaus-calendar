import React, { useMemo, useState } from "react";
import { View, StyleSheet, useWindowDimensions, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { CalendarTheme, hexToRgba } from "../utils/theme";
import { HOURS_IN_DAY } from "../utils/dateUtils";
import {
  TimeRail,
  VerticalDividers,
  NowIndicator,
  useNowIndicator,
} from "../shared";
import { WeekHeader } from "./components/WeekHeader";
import { DayColumn } from "./components/DayColumn";
import { CalendarErrorBoundary } from "../shared/ErrorBoundary";
import { WeekOverflowIndicator } from "./OverflowIndicator";
import { PropertyBar } from "./components/PropertyBar";
import {
  getWeekBoundaries,
  getEventsForWeek,
  getEventsForDay,
  getPropertyIndicatorData,
} from "./utils";
import {
  WEEK_VIEW_HOUR_HEIGHT,
  TIME_COLUMN_WIDTH,
  GRID_LINE_HEIGHT,
  TIME_PADDING_HORIZONTAL,
  TIME_TEXT_OFFSET,
  TIME_FONT_SIZE,
  TIME_FONT_WEIGHT,
  PROPERTY_TO_GRID_GAP,
  DAY_OVERFLOW_TOP_INSET,
} from "./constants";

// Calculate the total offset from ScrollView top to event content
// This is paddingTop (DAY_OVERFLOW_TOP_INSET) + marginTop (PROPERTY_TO_GRID_GAP)
const WEEK_VIEW_CONTENT_PADDING_TOP =
  DAY_OVERFLOW_TOP_INSET + PROPERTY_TO_GRID_GAP;
import { WeekViewProps } from "./types";
import {
  extractPropertyId,
  getPropertyBarHeight,
  getPropertyIndicatorsWithRows,
  splitVisibleAndOverflow,
  getWeekVisibleLimit,
  calculateDayOverflow,
} from "./utils/indicators";

/**
 * WeekView Component
 *
 * A compact 7-day week view with:
 * - Time column on the left (reused from DayView)
 * - 7 day columns with time-based event positioning
 * - Property indicator bars at the top
 * - Max 2 events per time slot, with "+X more" overflow
 * - Clicking "+X more" switches to day view
 */
export const WeekView: React.FC<WeekViewProps> = ({
  events,
  targetDate,
  onEventPress,
  onShowMore,
  onPressCell,
  theme,
  availableProperties = [],
  propertyColors,
  propertyColorsDark,
}) => {
  // SSR-safe: useWindowDimensions may not be available during SSR
  const windowDimensions = useWindowDimensions();
  const width = typeof window !== 'undefined' ? windowDimensions.width : 0;
  const dayColumnWidth = Math.floor((width - TIME_COLUMN_WIDTH) / 7);

  const totalHeight = HOURS_IN_DAY * WEEK_VIEW_HOUR_HEIGHT;
  const styles = createStyles(theme, totalHeight);
  const { minutesSinceStartOfDay, getDayIndexInRange } = useNowIndicator();
  const scrollY = useSharedValue(0);

  const { start: weekStart } = useMemo(
    () => getWeekBoundaries(targetDate),
    [targetDate]
  );

  const weekEvents = useMemo(
    () => getEventsForWeek(events, weekStart),
    [events, weekStart]
  );

  const todayIndex = useMemo(
    () => getDayIndexInRange(weekStart, 7),
    [getDayIndexInRange, weekStart]
  );
  const showNowIndicator = todayIndex !== null;
  const nowIndicatorTop = useMemo(() => {
    if (!showNowIndicator) return null;
    const top = (minutesSinceStartOfDay / 60) * WEEK_VIEW_HOUR_HEIGHT;
    return Math.min(top, totalHeight - 1);
  }, [showNowIndicator, minutesSinceStartOfDay, totalHeight]);
  const dayColumnLeft = useMemo(() => {
    if (!showNowIndicator || todayIndex === null) return null;
    return TIME_COLUMN_WIDTH + todayIndex * dayColumnWidth;
  }, [showNowIndicator, todayIndex, dayColumnWidth]);
  const todayHighlightStyle = useMemo(() => {
    if (todayIndex === null) return null;
    return {
      left: TIME_COLUMN_WIDTH + todayIndex * dayColumnWidth,
      width: dayColumnWidth,
    };
  }, [todayIndex, dayColumnWidth]);

  const propertyIndicators = useMemo(
    () =>
      getPropertyIndicatorData(
        weekEvents,
        weekStart,
        theme,
        availableProperties
      ),
    [weekEvents, weekStart, theme, availableProperties]
  );

  const hasPropertyIndicators = propertyIndicators.length > 0;

  const propertyIndicatorsWithRows = useMemo(
    () => getPropertyIndicatorsWithRows(propertyIndicators),
    [propertyIndicators]
  );

  const [expandedWeek, setExpandedWeek] = useState<boolean>(false);

  const maxRowInWeek = useMemo(() => {
    return propertyIndicatorsWithRows.reduce(
      (m, ind) => Math.max(m, ind.row),
      0
    );
  }, [propertyIndicatorsWithRows]);

  const weekVisibleLimit = useMemo(
    () => getWeekVisibleLimit(expandedWeek, maxRowInWeek),
    [expandedWeek, maxRowInWeek]
  );

  const { visibleIndicators, overflowCount, overflowByDay } = useMemo(
    () => splitVisibleAndOverflow(propertyIndicatorsWithRows, weekVisibleLimit),
    [propertyIndicatorsWithRows, weekVisibleLimit]
  );

  const propertyBarHeight = useMemo(
    () => getPropertyBarHeight(weekVisibleLimit, expandedWeek, overflowCount),
    [weekVisibleLimit, expandedWeek, overflowCount]
  );

  const visiblePropertyIds = useMemo(() => {
    const ids = new Set<string>();
    visibleIndicators.forEach((seg: any) => ids.add(seg.propertyId));
    return ids;
  }, [visibleIndicators]);

  const dayEventsPerDay = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + i);
      const allDay = getEventsForDay(weekEvents, dayDate);
      if (expandedWeek) return { date: dayDate, events: allDay };
      const filtered = allDay.filter((e) => {
        const propertyId = extractPropertyId(e);
        return propertyId && visiblePropertyIds.has(propertyId);
      });
      return { date: dayDate, events: filtered };
    });
  }, [weekStart, weekEvents, expandedWeek, visiblePropertyIds]);

  const dayOverflowCounts = useMemo(
    () => dayEventsPerDay.map(({ events }) => calculateDayOverflow(events)),
    [dayEventsPerDay]
  );

  return (
    <CalendarErrorBoundary
      theme={theme}
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("WeekView Error:", error, errorInfo);
        }
      }}
    >
      <View style={styles.container}>
        {todayHighlightStyle && (
          <View
            pointerEvents='none'
            style={[
              styles.todayHighlight,
              todayHighlightStyle,
              { backgroundColor: hexToRgba(theme.today, 0.12) },
            ]}
          />
        )}
        <VerticalDividers
          leftOffset={TIME_COLUMN_WIDTH}
          dayColumnWidth={dayColumnWidth}
          color={theme.border}
          style={{ zIndex: 0 }}
        />
        <WeekHeader
          weekStart={weekStart}
          theme={theme}
          propertyBar={
            hasPropertyIndicators ? (
              <PropertyBar
                theme={theme}
                dayColumnWidth={dayColumnWidth}
                visibleIndicators={visibleIndicators}
                overflowCount={overflowCount}
                overflowByDay={overflowByDay}
                weekVisibleLimit={weekVisibleLimit}
                expanded={expandedWeek}
                onToggleExpanded={() => setExpandedWeek((v) => !v)}
                containerStyle={styles.propertyBarContainer}
                spacerStyle={styles.propertyBarSpacer}
                contentStyle={[
                  styles.propertyBarContent,
                  { minHeight: propertyBarHeight },
                ]}
              />
            ) : null
          }
          propertyBarHeight={hasPropertyIndicators ? propertyBarHeight : 0}
        />

        <Animated.ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator
          showsHorizontalScrollIndicator={false}
          onScroll={useAnimatedScrollHandler({
            onScroll: (event) => {
              scrollY.value = event.contentOffset.y;
            },
          })}
          scrollEventThrottle={16}
        >
          <View style={styles.content}>
            <View style={styles.dayOverflowRow} pointerEvents='box-none'>
              {dayOverflowCounts.map((count, i) => {
                if (count <= 0) return null;
                return (
                  <View
                    key={`day-top-overflow-${i}`}
                    style={[
                      styles.dayOverflowIndicator,
                      {
                        left:
                          TIME_COLUMN_WIDTH +
                          i * dayColumnWidth +
                          dayColumnWidth / 2 -
                          12,
                      },
                    ]}
                  >
                    <WeekOverflowIndicator
                      theme={theme}
                      count={count}
                      showCount
                      onPress={() => onShowMore?.(dayEventsPerDay[i].date)}
                    />
                  </View>
                );
              })}
            </View>
            <TimeRail
              theme={theme}
              hourHeight={WEEK_VIEW_HOUR_HEIGHT}
              timeColumnWidth={TIME_COLUMN_WIDTH}
              totalHeight={totalHeight}
              gridLineHeight={GRID_LINE_HEIGHT}
              timePaddingHorizontal={TIME_PADDING_HORIZONTAL}
              timeTextOffset={TIME_TEXT_OFFSET}
              timeFontSize={TIME_FONT_SIZE}
              timeFontWeight={TIME_FONT_WEIGHT}
            />

            {nowIndicatorTop !== null && dayColumnLeft !== null && (
              <>
                <NowIndicator
                  top={nowIndicatorTop}
                  theme={theme}
                  lineLeft={TIME_COLUMN_WIDTH}
                  lineWidth={0}
                  dotLeft={TIME_COLUMN_WIDTH}
                  thickness={2}
                />
                <NowIndicator
                  top={nowIndicatorTop}
                  theme={theme}
                  lineLeft={dayColumnLeft}
                  lineWidth={dayColumnWidth}
                  showDot={false}
                  thickness={2}
                />
              </>
            )}

            {/* Day Columns */}
            <View style={styles.dayColumnsRow}>
              {dayEventsPerDay.map(({ date, events: dayEvents }, i) => (
                <DayColumn
                  propertyColors={propertyColors}
                  propertyColorsDark={propertyColorsDark}
                  key={`day-${i}`}
                  dayDate={date}
                  events={dayEvents}
                  onEventPress={onEventPress}
                  onShowMore={onShowMore}
                  onPressCell={onPressCell}
                  theme={theme}
                  allEvents={expandedWeek ? events : dayEvents}
                  dayColumnWidth={dayColumnWidth}
                  availableProperties={availableProperties}
                  scrollY={scrollY}
                  contentPaddingTop={WEEK_VIEW_CONTENT_PADDING_TOP}
                />
              ))}
            </View>
          </View>
        </Animated.ScrollView>
      </View>
    </CalendarErrorBoundary>
  );
};

const createStyles = (theme: CalendarTheme, totalHeight: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      position: "relative",
      // Web-specific: Ensure container has constrained height for scrolling
      ...(Platform.OS === 'web' && typeof window !== 'undefined' && {
        height: '100%',
        minHeight: 0, // Important for flex children on web
      }),
    },
    todayHighlight: {
      position: "absolute",
      top: 0,
      bottom: 0,
      zIndex: 0,
    },
    propertyBarContainer: {
      flexDirection: "row",
      position: "relative",
      backgroundColor: "transparent",
      borderBottomWidth: 2,
      borderBottomColor: theme.borderLight,
      paddingBottom: 16,
    },
    propertyBarSpacer: {},
    propertyBarContent: {
      flex: 1,
      position: "relative",
    },
    contentScroll: {
      flex: 1,
      paddingTop: DAY_OVERFLOW_TOP_INSET,
      // Web-specific: Explicit height constraint and overflow for scrolling
      ...(Platform.OS === 'web' && typeof window !== 'undefined' && {
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        // @ts-ignore - web-specific CSS properties
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }),
    },
    content: {
      flexDirection: "row",
      minHeight: totalHeight,
      position: "relative",
      marginTop: PROPERTY_TO_GRID_GAP,
    },
    dayColumnsRow: {
      flexDirection: "row",
      position: "absolute",
      left: TIME_COLUMN_WIDTH,
    },
    dayOverflowRow: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: DAY_OVERFLOW_TOP_INSET,
      zIndex: 1000,
    },
    dayOverflowIndicator: {
      position: "absolute",
      top: -20,
    },
  });
