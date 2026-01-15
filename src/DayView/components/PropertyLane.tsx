import React from "react";
import { View, StyleSheet } from "react-native";
import { SharedValue } from "../../utils/reanimated";
import { CalendarEvent } from "../../types";
import { CalendarTheme, getCalendarEventColor } from "../../utils/theme";
import { HOURS_IN_DAY } from "../../utils/dateUtils";
import { EventBlock } from "./EventBlock";
import { getEventPosition, getEventsForProperty } from "../utils";
import { EVENT_SPACING, EVENT_HORIZONTAL_PADDING } from "../constants";
import { PropertyGroup } from "../types";
import {
  DEFAULT_PROPERTY_COLORS,
  DEFAULT_PROPERTY_COLORS_DARK,
} from "../../utils/propertyColors";

interface PropertyLaneProps {
  propertyGroup: PropertyGroup;
  height: number;
  width: number;
  hourHeight: number;
  onEventPress: (event: CalendarEvent) => void;
  theme: CalendarTheme;
  targetDate: Date;
  allEvents: CalendarEvent[]; // Add all events to find cleaning assignees
  availableProperties?: Array<{ id: number }>;
  scrollY?: SharedValue<number>;
  propertyColors?: string[];
  propertyColorsDark?: string[];
}

/**
 * PropertyLane Component
 *
 * Renders a vertical lane for a specific property with positioned events.
 * Events are positioned based on their exact start/end times.
 */
export const PropertyLane: React.FC<PropertyLaneProps> = React.memo(
  ({
    propertyGroup,
    height,
    width,
    hourHeight,
    onEventPress,
    theme,
    targetDate,
    allEvents,
    availableProperties = [],
    scrollY,
    propertyColors = DEFAULT_PROPERTY_COLORS,
    propertyColorsDark = DEFAULT_PROPERTY_COLORS_DARK,
  }) => {
    // Get events for this property
    const propertyEvents = getEventsForProperty(
      propertyGroup.events,
      propertyGroup.propertyId
    );

    // Get property color for this lane
    const propertyColor =
      propertyEvents.length > 0
        ? getCalendarEventColor(
            propertyEvents[0],
            theme,
            availableProperties,
            propertyColors,
            propertyColorsDark
          )
        : theme.primary;

    // Calculate event positions
    const positionedEvents = propertyEvents
      .map((event: any) => ({
        event,
        position: getEventPosition(event, hourHeight, targetDate),
      }))
      .sort((a: any, b: any) => a.position.top - b.position.top);

    // Add small vertical spacing only when events truly touch (not overlap)
    const adjustedEvents = positionedEvents.map((item: any, index: number) => {
      if (index === 0) return item;

      const prev = positionedEvents[index - 1];
      const prevBottom = prev.position.top + prev.position.height;
      const currentTop = item.position.top;

      // Only adjust if events are touching (adjacent), not overlapping
      // currentTop >= prevBottom means they're touching or separate
      // currentTop <= prevBottom + 1 allows 1px tolerance for floating point precision
      // If currentTop < prevBottom, they overlap, so don't adjust
      if (currentTop >= prevBottom && currentTop <= prevBottom + 1) {
        const top = prevBottom + EVENT_SPACING;
        const height = Math.max(item.position.height - EVENT_SPACING, 20);
        return { ...item, position: { ...item.position, top, height } };
      }

      return item;
    });

    return (
      <View
        style={[
          styles.container,
          {
            width,
            height,
          },
        ]}
      >
        {/* Positioned events with minimal spacing when touching */}
        {adjustedEvents.map(({ event, position }: any) => {
          return (
            <EventBlock
              key={event.id}
              event={event}
              onPress={onEventPress}
              theme={theme}
              propertyColor={propertyColor}
              allEvents={allEvents}
              availableProperties={availableProperties}
              scrollY={scrollY}
              style={[
                styles.eventBlock,
                {
                  top: position.top,
                  height: position.height,
                  left: EVENT_HORIZONTAL_PADDING,
                  right: EVENT_HORIZONTAL_PADDING,
                  // Width and left are now handled by CSS flexbox
                },
              ]}
            />
          );
        })}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
    // paddingRight: 8,
    // backgroundColor: "red",
  },
  eventBlock: {
    position: "absolute",
    // left: 8,
    // right: 8, // Spans full width minus container padding
  },
});
