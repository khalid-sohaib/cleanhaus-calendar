import { CalendarEvent } from "../types";
import { extractEntityId } from "./eventHelpers";

/**
 * Week and Day View utilities
 * These functions are used for customizing react-native-big-calendar Week/Day views
 */

/**
 * Get color for event based on its type
 * Used for Week/Day view event styling
 */
export function getEventColor(
  event: CalendarEvent,
  propertyColors: string[],
  eventTypeColors: Record<string, string>,
  availableProperties?: Array<{ id: number }>
): string {
  if (event.meta?.type === "property") {
    // Use property-specific color if available
    if (availableProperties && event.eventId && propertyColors.length > 0) {
      const entityId = extractEntityId(event.eventId);
      if (entityId !== null) {
        const index = availableProperties.findIndex((p) => p.id === entityId);
        const colorIndex = index >= 0 ? index : entityId;
        return propertyColors[colorIndex % propertyColors.length];
      }
    }
    return eventTypeColors.property || propertyColors[0] || "#00B7FF";
  }
  if (event.meta?.type === "cleaning")
    return eventTypeColors.cleaning || "#E7753A";
  if (event.meta?.type === "service")
    return eventTypeColors.service || "#EECD46";
  if (event.meta?.type === "otherService")
    return eventTypeColors.otherService || "#EECD46";
  if (event.meta?.type === "unassigned")
    return eventTypeColors.unassigned || "#EF4444";
  return eventTypeColors.default || "#9E9E9E";
}

/**
 * Calculate time-based horizontal position for events in Week/Day views
 * Returns position as percentage of day (0-100%)
 */
export function getTimeBasedPosition(startTime: Date, endTime: Date) {
  const startHour = startTime.getHours();
  const startMinute = startTime.getMinutes();
  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();

  // Calculate position as percentage of day (0-100%)
  const startPosition = ((startHour * 60 + startMinute) / (24 * 60)) * 100;
  const endPosition = ((endHour * 60 + endMinute) / (24 * 60)) * 100;

  return {
    left: startPosition,
    width: endPosition - startPosition,
  };
}

/**
 * Normalize event data to CalendarEvent format
 * Handles various input formats from react-native-big-calendar
 */
export function normalizeCalendarEvent(event: any): CalendarEvent {
  return {
    id: event.id || "unknown",
    eventId: event.eventId || event.id || "unknown",
    title: event.title || "Untitled",
    start: event.start instanceof Date ? event.start : new Date(event.start),
    end: event.end instanceof Date ? event.end : new Date(event.end),
    meta: event.meta,
  };
}
