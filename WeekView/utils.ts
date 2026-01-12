/**
 * WeekView Utilities
 *
 * Helper functions for week calculations, event grouping, and positioning.
 */

import dayjs from "dayjs";
import { CalendarEvent } from "../types";
import { CalendarTheme } from "../utils/theme";
import { getCalendarEventColor } from "../utils/theme";
import { extractEntityId } from "../utils/eventHelpers";
import { MAX_EVENTS_PER_SLOT } from "./constants";
import { DaySlotData, DayColumnData, PropertyIndicatorData } from "./types";
import {
  DEFAULT_PROPERTY_COLORS,
  DEFAULT_PROPERTY_COLORS_DARK,
} from "../utils/propertyColors";

/**
 * Get week boundaries (Sunday to Saturday)
 */
export function getWeekBoundaries(date: Date) {
  const start = dayjs(date).startOf("week");
  const end = start.add(6, "day");
  return {
    start: start.toDate(),
    end: end.toDate(),
    startDayjs: start,
  };
}

/**
 * Get all events for the week
 */
export function getEventsForWeek(
  events: CalendarEvent[],
  weekStart: Date
): CalendarEvent[] {
  const weekEnd = dayjs(weekStart).add(6, "day").endOf("day").toDate();
  const weekStartDate = dayjs(weekStart).startOf("day").toDate();

  return events.filter((event) => {
    const eventStart = dayjs(event.start);
    const eventEnd = dayjs(event.end);
    return (
      (eventStart.isBefore(weekEnd) || eventStart.isSame(weekEnd)) &&
      (eventEnd.isAfter(weekStartDate) || eventEnd.isSame(weekStartDate))
    );
  });
}

/**
 * Get events for a specific day
 */
export function getEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  const dayStart = dayjs(day).startOf("day");
  const dayEnd = dayjs(day).endOf("day");

  return events.filter((event) => {
    const start = dayjs(event.start);
    const end = dayjs(event.end);
    return start.isBefore(dayEnd) && end.isAfter(dayStart);
  });
}

/**
 * Group events by hour slot and calculate overflow
 */
export function groupEventsByHourSlot(events: CalendarEvent[]): DaySlotData[] {
  const slotMap = new Map<number, CalendarEvent[]>();

  events.forEach((event) => {
    const startHour = dayjs(event.start).hour();
    const startMinute = dayjs(event.start).minute();

    // Round to the hour (can be adjusted for 30-min slots)
    const slotHour = startMinute >= 30 ? startHour + 1 : startHour;

    if (!slotMap.has(slotHour)) {
      slotMap.set(slotHour, []);
    }
    slotMap.get(slotHour)!.push(event);
  });

  // Convert to array and sort by hour
  const slots: DaySlotData[] = [];

  slotMap.forEach((slotEvents, hour) => {
    // Sort events by start time
    const sorted = slotEvents.sort((a, b) =>
      dayjs(a.start).diff(dayjs(b.start))
    );

    slots.push({
      hour,
      events: sorted,
      overflow: Math.max(0, sorted.length - MAX_EVENTS_PER_SLOT),
    });
  });

  return slots.sort((a, b) => a.hour - b.hour);
}

/**
 * Calculate property indicator data for top bar
 */
export function getPropertyIndicatorData(
  events: CalendarEvent[],
  weekStart: Date,
  theme: CalendarTheme,
  availableProperties?: Array<{ id: number }>
): PropertyIndicatorData[] {
  const weekEnd = dayjs(weekStart).add(6, "day");

  // Map to store properties with their presence for each day of the week
  const propertyPresenceMap = new Map<
    string,
    {
      presenceDays: Set<number>;
      name: string;
      color: string;
    }
  >();

  events.forEach((event) => {
    // Skip unassigned events
    if (event.meta?.type === "unassigned") return;

    // Extract property information from event
    const entityIdNum = extractEntityId(event.eventId);
    if (entityIdNum === null) {
      return; // Skip events without valid entityId
    }
    
    const entityId = entityIdNum.toString(); // Convert to string for Map key
    let propertyName: string;
    let color: string;

    if (event.meta?.type === "property") {
      // For property bookings, get entity ID from eventId
      propertyName = event.meta?.entityName || `Property ${entityId}`;
      color = getCalendarEventColor(event, theme, availableProperties, DEFAULT_PROPERTY_COLORS, DEFAULT_PROPERTY_COLORS_DARK);
    } else if (
      event.meta?.type === "cleaning" ||
      event.meta?.type === "service" ||
      event.meta?.type === "otherService"
    ) {
      // For cleaning/service events, get entity ID from eventId (which references the property)
      propertyName = event.meta?.entityName || `Property ${entityId}`;
      // Use the color from the related booking if available, otherwise use the event's color
      color = event.meta?.bookingColor || getCalendarEventColor(event, theme, availableProperties, DEFAULT_PROPERTY_COLORS, DEFAULT_PROPERTY_COLORS_DARK);
    } else {
      return;
    }

    const eventStart = dayjs(event.start);
    const eventEnd = dayjs(event.end);

    // Only consider events that overlap with this week
    if (eventEnd.isBefore(weekStart) || eventStart.isAfter(weekEnd)) {
      return;
    }

    // Calculate which days of the week this event spans
    const weekStartCopy = dayjs(weekStart);
    let startDay = eventStart.isBefore(weekStart)
      ? 0
      : eventStart.diff(weekStartCopy, "day");
    let endDay = eventEnd.isAfter(weekEnd)
      ? 6
      : eventEnd.diff(weekStartCopy, "day");

    // Clamp to week boundaries
    startDay = Math.max(0, Math.min(6, startDay));
    endDay = Math.max(0, Math.min(6, endDay));

    // Mark all days this event spans
    if (!propertyPresenceMap.has(entityId)) {
      propertyPresenceMap.set(entityId, {
        presenceDays: new Set(),
        name: propertyName,
        color,
      });
    }

    const propertyData = propertyPresenceMap.get(entityId)!;
    // If it's the first event for this property, set the name and color
    if (!propertyData.name) {
      propertyData.name = propertyName;
      propertyData.color = color;
    }

    // Add all days from startDay to endDay to the presence set
    for (let day = startDay; day <= endDay; day++) {
      propertyData.presenceDays.add(day);
    }
  });

  // Convert presence map to property indicators
  // For each property, find contiguous segments and create separate indicators
  const propertyIndicators: PropertyIndicatorData[] = [];

  propertyPresenceMap.forEach((propertyData, entityId) => {
    const presenceDays = Array.from(propertyData.presenceDays).sort(
      (a, b) => a - b
    );

    // Find contiguous segments
    if (presenceDays.length === 0) return;

    let segmentStart = presenceDays[0];
    let segmentEnd = presenceDays[0];

    for (let i = 1; i < presenceDays.length; i++) {
      // If this day is adjacent to the current segment, extend it
      if (presenceDays[i] === segmentEnd + 1) {
        segmentEnd = presenceDays[i];
      } else {
        // Create indicator for the current segment
        propertyIndicators.push({
          propertyName: propertyData.name,
          propertyId: entityId,
          startDay: segmentStart,
          endDay: segmentEnd,
          color: propertyData.color,
        });

        // Start a new segment
        segmentStart = presenceDays[i];
        segmentEnd = presenceDays[i];
      }
    }

    // Add the last segment
    propertyIndicators.push({
      propertyName: propertyData.name,
      propertyId: entityId,
      startDay: segmentStart,
      endDay: segmentEnd,
      color: propertyData.color,
    });
  });

  return propertyIndicators;
}

/**
 * Build day column data for the entire week
 */
export function buildWeekDayColumns(
  events: CalendarEvent[],
  weekStart: Date
): DayColumnData[] {
  const columns: DayColumnData[] = [];

  for (let i = 0; i < 7; i++) {
    const day = dayjs(weekStart).add(i, "day").toDate();
    const dayEvents = getEventsForDay(events, day);
    const slots = groupEventsByHourSlot(dayEvents);

    columns.push({
      date: day,
      dayIndex: i,
      slots,
    });
  }

  return columns;
}

/**
 * Calculate if an event should be positioned by absolute time
 * Returns position in pixels from top of day column
 */
export function calculateEventTopPosition(
  event: CalendarEvent,
  hourHeight: number,
  day: Date
): number {
  const dayStart = dayjs(day).startOf("day");
  const eventStart = dayjs(event.start);

  // If event starts before this day, it starts at 0
  if (eventStart.isBefore(dayStart)) {
    return 0;
  }

  const diffMinutes = eventStart.diff(dayStart, "minute");
  return (diffMinutes / 60) * hourHeight;
}

/**
 * Calculate event height in pixels
 */
export function calculateEventHeight(
  event: CalendarEvent,
  hourHeight: number,
  day: Date
): number {
  const dayStart = dayjs(day).startOf("day");
  const dayEnd = dayjs(day).endOf("day");
  const eventStart = dayjs(event.start);
  const eventEnd = dayjs(event.end);

  // Clamp to day boundaries
  const start = eventStart.isBefore(dayStart) ? dayStart : eventStart;
  const end = eventEnd.isAfter(dayEnd) ? dayEnd : eventEnd;

  const durationMinutes = end.diff(start, "minute");
  return Math.max(20, (durationMinutes / 60) * hourHeight); // Minimum 20px
}
