import React, { useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import { SharedValue } from "react-native-reanimated";
import dayjs from "dayjs";
import { CalendarEvent } from "../../types";
import { CalendarTheme } from "../../utils/theme";
import { EventBlock } from "../../DayView/components/EventBlock";
// Note: No text or overflow indicator is rendered within a DayColumn; those live in parent overlays
import { getCalendarEventColor } from "../../utils/theme";
import {
  DEFAULT_PROPERTY_COLORS,
  DEFAULT_PROPERTY_COLORS_DARK,
} from "../../utils/propertyColors";
import { HOURS_IN_DAY } from "../../utils/dateUtils";
import { getTimeFromPosition } from "../../utils/dateUtils";
import { WEEK_VIEW_HOUR_HEIGHT, MAX_EVENTS_PER_SLOT } from "../constants";

interface DayColumnProps {
  dayDate: Date;
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onShowMore?: (date: Date) => void;
  onPressCell?: (date: Date, time: Date) => void;
  theme: CalendarTheme;
  allEvents: CalendarEvent[];
  dayColumnWidth: number;
  availableProperties?: Array<{ id: number }>;
  scrollY?: SharedValue<number>;
  contentPaddingTop?: number;
  propertyColors?: string[];
  propertyColorsDark?: string[];
}

/**
 * DayColumn Component
 * Individual day column in the week view with event rendering
 * Events are positioned by their exact start/end time
 */
export const DayColumn: React.FC<DayColumnProps> = React.memo(
  ({
    dayDate,
    events,
    onEventPress,
    onShowMore,
    onPressCell,
    theme,
    allEvents,
    dayColumnWidth,
    availableProperties = [],
    scrollY,
    contentPaddingTop,
    propertyColors = DEFAULT_PROPERTY_COLORS,
    propertyColorsDark = DEFAULT_PROPERTY_COLORS_DARK,
  }) => {
    const totalHeight = HOURS_IN_DAY * WEEK_VIEW_HOUR_HEIGHT;
    const styles = createStyles(theme, dayColumnWidth);
    const dayStart = dayjs(dayDate).startOf("day");

    // Handle cell press - calculate time from Y position
    const handleCellPress = useCallback(
      (event: NativeSyntheticEvent<NativeTouchEvent>) => {
        if (!onPressCell) return;

        // Get Y coordinate relative to the DayColumn
        const { locationY } = event.nativeEvent;

        // Use utility to calculate time from position
        const timeDate = getTimeFromPosition(dayDate, locationY);

        onPressCell(dayDate, timeDate);
      },
      [onPressCell, dayDate]
    );

    // Sort events by start time (do not mutate incoming props)
    const sortedEvents = useMemo(
      () => [...events].sort((a, b) => dayjs(a.start).diff(dayjs(b.start))),
      [events]
    );

    // Find overlapping events and render accordingly
    const eventGroups = useMemo(() => {
      const groups: CalendarEvent[][] = [];
      const processed = new Set<string>();

      sortedEvents.forEach((event) => {
        if (processed.has(event.id)) return;

        // Find all events that overlap with this event temporally
        const overlapping = sortedEvents.filter((other) => {
          if (processed.has(other.id)) return false;
          const eStart = dayjs(event.start);
          const eEnd = dayjs(event.end);
          const oStart = dayjs(other.start);
          const oEnd = dayjs(other.end);

          return (
            (oStart.isBefore(eEnd) && oEnd.isAfter(eStart)) ||
            (eStart.isBefore(oEnd) && eEnd.isAfter(oStart))
          );
        });

        // Mark all overlapping events as processed
        overlapping.forEach((e) => processed.add(e.id));

        // Return first MAX_EVENTS_PER_SLOT events
        groups.push(overlapping.slice(0, MAX_EVENTS_PER_SLOT));
      });

      return groups;
    }, [sortedEvents]);

    return (
      <View
        style={[
          styles.container,
          {
            width: dayColumnWidth,
            height: totalHeight,
            borderRightColor: theme.borderLight,
          },
        ]}
      >
        {/* Invisible pressable overlay for cell clicks - only active when onPressCell is provided */}
        {onPressCell && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleCellPress}
            style={StyleSheet.absoluteFill}
            // Note: EventBlocks are absolutely positioned on top, so they'll capture presses first
            // This overlay only captures presses in empty areas
          />
        )}
        {/* Render event groups */}
        {eventGroups.map((group, groupIndex) => {
          const overflow =
            group.length === MAX_EVENTS_PER_SLOT
              ? events.filter((e) => {
                  const eStart = dayjs(e.start);
                  const eEnd = dayjs(e.end);
                  const groupStart = dayjs(group[0].start);
                  const groupEnd = dayjs(group[0].end);
                  return (
                    (eStart.isBefore(groupEnd) && eEnd.isAfter(groupStart)) ||
                    (groupStart.isBefore(eEnd) && groupEnd.isAfter(eStart))
                  );
                }).length - MAX_EVENTS_PER_SLOT
              : 0;

          return group.map((event, eventIndex) => {
            // Calculate position based on exact start/end time
            const eventStart = dayjs(event.start);
            const eventEnd = dayjs(event.end);

            // Clamp to day boundaries
            const renderStart = eventStart.isBefore(dayStart)
              ? dayStart
              : eventStart;
            const renderEnd = eventEnd.isAfter(dayStart.endOf("day"))
              ? dayStart.endOf("day")
              : eventEnd;

            const top =
              (renderStart.diff(dayStart, "minute") / 60) *
              WEEK_VIEW_HOUR_HEIGHT;
            const height = Math.max(
              20,
              (renderEnd.diff(renderStart, "minute") / 60) *
                WEEK_VIEW_HOUR_HEIGHT
            );

            const propertyColor = getCalendarEventColor(
              event,
              theme,
              availableProperties,
              propertyColors,
              propertyColorsDark
            );

            // Calculate exact pixel positions to prevent overflow
            const containerWidth = dayColumnWidth - 2; // Subtract left and right margins
            const firstEventWidth = containerWidth * 0.98;
            const secondEventLeft = firstEventWidth * 0.5;
            const secondEventWidth = containerWidth * 0.48;

            return (
              <EventBlock
                key={event.id}
                event={event}
                onPress={onEventPress}
                theme={theme}
                propertyColor={propertyColor}
                allEvents={allEvents}
                availableProperties={availableProperties}
                compact={true}
                scrollY={scrollY}
                contentPaddingTop={contentPaddingTop}
                style={[
                  styles.eventBlock,
                  {
                    top,
                    height,
                    left: eventIndex === 1 ? secondEventLeft : 1, // 1px left margin
                    width:
                      eventIndex === 1 ? secondEventWidth : firstEventWidth,
                  },
                ]}
              />
            );
          });
        })}

        {/* Day-level overflow indicator is rendered by parent overlay in WeekView */}
      </View>
    );
  }
);

const createStyles = (theme: CalendarTheme, dayColumnWidth: number) =>
  StyleSheet.create({
    container: {
      position: "relative",
      width: dayColumnWidth,
      paddingHorizontal: 1,
      overflow: "hidden",
    },
    eventBlock: {
      position: "absolute",
    },
  });
