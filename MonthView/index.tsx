import calendarize from "calendarize";
import dayjs from "dayjs";
import * as React from "react";
import { Text, TouchableOpacity, View, Dimensions } from "react-native";
import { CalendarEvent } from "../types";
import { CalendarTheme } from "../utils/theme";
import { useSwipeGesture } from "../hooks";
import { EventBar } from "./EventBar";
import { OverflowIndicator } from "./OverflowIndicator";
import { MonthViewProps, EventPosition } from "./types";
import {
  getMultiDayPosition,
  assignGlobalRows,
  calculateOverflowByDay,
} from "./utils";

/**
 * MonthView Component
 *
 * A custom month calendar view with horizontal time-positioned events.
 * Events are positioned based on their exact start/end times within each day cell.
 * Events with the same eventId appear in the same row across all weeks.
 *
 * Features:
 * - Horizontal time positioning (exact hour/minute)
 * - Multi-day event spanning with fractional times
 * - Global row assignment by eventId
 * - Configurable max visible rows
 * - Touch handlers for events and date cells
 * - Swipe gestures for month navigation (left = next, right = previous)
 *
 * @example
 * ```tsx
 * const [currentDate, setCurrentDate] = useState(new Date());
 *
 * <MonthView
 *   events={events}
 *   targetDate={currentDate}
 *   containerHeight={600}
 *   onPressEvent={(event) => console.log(event)}
 *   onPressCell={(date) => console.log(date)}
 *   onMonthChange={(newDate) => setCurrentDate(newDate)}
 *   maxVisibleRows={3}
 *   swipeEnabled={true}
 * />
 * ```
 */
export const MonthView: React.FC<MonthViewProps> = ({
  events,
  targetDate,
  containerHeight,
  onPressEvent,
  onPressCell,
  onShowMore,
  onMonthChange,
  maxVisibleRows = 3,
  swipeEnabled = true,
  theme,
  availableProperties = [],
  propertyColors,
  propertyColorsDark,
}) => {
  // Get initial screen width as estimate (accounts for padding/margins in real layout)
  // SSR-safe: Use 0 as fallback for server-side rendering
  const getInitialWidth = () => {
    if (typeof window === "undefined") return 0; // SSR fallback
    try {
      return Dimensions.get("window").width;
    } catch {
      return 0; // Fallback if Dimensions.get fails
    }
  };
  const [calendarWidth, setCalendarWidth] =
    React.useState<number>(getInitialWidth);
  const target = dayjs(targetDate);
  const weeks = calendarize(target.toDate(), 0); // 0 = Sunday first
  const minCellHeight = containerHeight / 5 - 30;

  // Swipe gesture handlers for month navigation
  const handleSwipeLeft = React.useCallback(() => {
    // Swipe left → go to next month
    const nextMonth = dayjs(targetDate).add(1, "month").toDate();
    onMonthChange?.(nextMonth);
  }, [targetDate, onMonthChange]);

  const handleSwipeRight = React.useCallback(() => {
    // Swipe right → go to previous month
    const prevMonth = dayjs(targetDate).subtract(1, "month").toDate();
    onMonthChange?.(prevMonth);
  }, [targetDate, onMonthChange]);

  // Initialize swipe gesture hook
  const panResponder = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    enabled: swipeEnabled,
  });

  // Calculate all event positions
  const eventPositions = React.useMemo(() => {
    const cellWidth = calendarWidth / 7;
    const allPositions: EventPosition[] = [];

    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = target
        .date(week.find((d) => d > 0) || 1)
        .startOf("week");

      events.forEach((event) => {
        const position = getMultiDayPosition(
          event,
          firstDayOfWeek,
          weekIndex,
          cellWidth
        );
        if (position) {
          allPositions.push(position);
        }
      });
    });

    return allPositions;
  }, [events, weeks, target, calendarWidth]);

  // Group positions by week and assign rows GLOBALLY
  const positionsByWeek = React.useMemo(() => {
    return assignGlobalRows(eventPositions, maxVisibleRows);
  }, [eventPositions, maxVisibleRows]);

  // Calculate overflow counts per day (how many events are hidden)
  const overflowByDay = React.useMemo(() => {
    return calculateOverflowByDay(
      eventPositions,
      weeks,
      target,
      maxVisibleRows
    );
  }, [eventPositions, weeks, target, maxVisibleRows]);

  return (
    <View
      style={{
        height: containerHeight,
        // borderWidth: 1,
        // borderColor: theme.border,
        // borderRadius: 4,
      }}
      onLayout={({ nativeEvent: { layout } }) => {
        setCalendarWidth(layout.width);
      }}
      {...panResponder.panHandlers}
    >
      {/* Day headers */}
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: theme.borderLight,
        }}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((day, dayIndex) => (
          <View
            key={dayIndex}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 4, // Match date cell horizontal padding
              borderLeftWidth: dayIndex > 0 ? 1 : 0, // No border on first column
              borderLeftColor: theme.border,
              borderRightWidth: dayIndex === 6 ? 1 : 0,
              borderRightColor: theme.border,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 12,
                color: theme.text,
                fontWeight: "600",
              }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={{ flex: 1 }}>
        {weeks.map((week, weekIndex) => (
          <View
            key={`week-${weekIndex}`}
            style={{
              flex: 1,
              flexDirection: "row",
              borderTopWidth: weekIndex > 0 ? 1 : 0,
              borderTopColor: theme.border,
              minHeight: minCellHeight,
              position: "relative",
            }}
          >
            {week
              .map((d, idx) => {
                // Calculate actual date for each cell including prev/next month
                const weekStart = target.startOf("month").startOf("week");
                return weekStart.add(weekIndex * 7 + idx, "day");
              })
              .map((date, dayIndex) => {
                const dayKey = `${weekIndex}-${dayIndex}`;
                const overflowCount = overflowByDay.get(dayKey);
                const isCurrentMonth = date.isSame(target, "month");

                return (
                  <TouchableOpacity
                    key={`day-${weekIndex}-${dayIndex}`}
                    style={{
                      flex: 1,
                      borderLeftWidth: dayIndex > 0 ? 1 : 0, // No border on first column
                      borderLeftColor: theme.border,
                      borderRightWidth: dayIndex === 6 ? 1 : 0,
                      borderRightColor: theme.border,
                      padding: 4,
                      position: "relative",
                      backgroundColor: date.isSame(dayjs(), "day")
                        ? `${theme.today}20`
                        : "transparent",
                    }}
                    onPress={() => onPressCell?.(date.toDate())}
                    activeOpacity={0.7}
                  >
                    {/* Date number with circular highlight for today */}
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10, // Half of width/height for perfect circle
                        backgroundColor: date.isSame(dayjs(), "day")
                          ? theme.today
                          : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "center", // Center horizontally in cell
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: date.isSame(dayjs(), "day")
                            ? theme.background
                            : isCurrentMonth
                            ? theme.text
                            : `${theme.text}60`, // Light gray for other months
                          fontWeight: date.isSame(dayjs(), "day")
                            ? "700"
                            : "400",
                          textAlign: "center",
                          lineHeight: 12,
                        }}
                      >
                        {date.format("D")}
                      </Text>
                    </View>

                    {/* Overflow indicator */}
                    {overflowCount && (
                      <OverflowIndicator
                        count={overflowCount}
                        onPress={() => onShowMore?.(date.toDate())}
                        theme={theme}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

            {/* Render events for this week */}
            {calendarWidth > 0 &&
              positionsByWeek
                .get(weekIndex)
                ?.filter((position) => position.isVisible)
                .map((position) => (
                  <EventBar
                    key={`${position.event.id}-${weekIndex}`}
                    position={position}
                    onPress={onPressEvent}
                    theme={theme}
                    availableProperties={availableProperties}
                    propertyColors={propertyColors}
                    propertyColorsDark={propertyColorsDark}
                  />
                ))}
          </View>
        ))}
      </View>
    </View>
  );
};
