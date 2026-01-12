import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { CalendarEvent } from "../types";
import { EventPosition, HorizontalPosition } from "./types";
import { getCalendarEventColor } from "../utils/theme";
import { MINUTES_IN_DAY } from "../utils/dateUtils";

dayjs.extend(isBetween);

/**
 * Calculate horizontal position of event within a single day cell
 * @param event - The calendar event
 * @param date - The date to calculate position for
 * @param cellWidth - Width of a single day cell in pixels
 * @returns Object with left position and width in pixels
 */
export function getHorizontalPositionInDay(
  event: CalendarEvent,
  date: dayjs.Dayjs,
  cellWidth: number
): HorizontalPosition {
  const dayStart = date.startOf("day");
  const dayEnd = date.endOf("day");

  // Clamp event to day boundaries
  const eventStart = dayjs(event.start).isBefore(dayStart)
    ? dayStart
    : dayjs(event.start);
  const eventEnd = dayjs(event.end).isAfter(dayEnd) ? dayEnd : dayjs(event.end);

  const startMinutes = eventStart.diff(dayStart, "minute");
  const durationMinutes = eventEnd.diff(eventStart, "minute");

  const left = (startMinutes / MINUTES_IN_DAY) * cellWidth;
  const width = (durationMinutes / MINUTES_IN_DAY) * cellWidth;

  return {
    left,
    width,
  };
}

/**
 * Calculate multi-day event position across a week
 * Handles events that span multiple days and week boundaries
 * @param event - The calendar event
 * @param weekStartDate - Start date of the week
 * @param weekIndex - Index of the week in the month
 * @param cellWidth - Width of a single day cell in pixels
 * @returns EventPosition object or null if event doesn't intersect with this week
 */
export function getMultiDayPosition(
  event: CalendarEvent,
  weekStartDate: dayjs.Dayjs,
  weekIndex: number,
  cellWidth: number
): EventPosition | null {
  const eventStart = dayjs(event.start);
  const eventEnd = dayjs(event.end);
  const weekEndDate = weekStartDate.endOf("week");

  // Check if event intersects with this week
  if (
    eventEnd.isBefore(weekStartDate, "day") ||
    eventStart.isAfter(weekEndDate, "day")
  ) {
    return null;
  }

  const isStartWeek = eventStart.isBetween(
    weekStartDate,
    weekEndDate,
    "day",
    "[]"
  );
  const isEndWeek = eventEnd.isBetween(weekStartDate, weekEndDate, "day", "[]");

  let left = 0;
  let width = 0;

  if (isStartWeek && isEndWeek) {
    // Event starts and ends in this week
    const startDayOfWeek = eventStart.day();
    const endDayOfWeek = eventEnd.day();
    const startDate = eventStart.startOf("day");

    const startPos = getHorizontalPositionInDay(event, startDate, cellWidth);
    const daySpan = endDayOfWeek - startDayOfWeek;

    if (daySpan === 0) {
      // Same day
      left = startDayOfWeek * cellWidth + startPos.left;
      width = startPos.width;
    } else {
      // Spans multiple days in same week
      const endDate = eventEnd.startOf("day");
      const endPos = getHorizontalPositionInDay(event, endDate, cellWidth);

      left = startDayOfWeek * cellWidth + startPos.left;
      width =
        cellWidth -
        startPos.left +
        (daySpan - 1) * cellWidth +
        endPos.left +
        endPos.width;
    }
  } else if (isStartWeek) {
    // Starts in this week, continues beyond
    const startDayOfWeek = eventStart.day();
    const startDate = eventStart.startOf("day");
    const startPos = getHorizontalPositionInDay(event, startDate, cellWidth);

    left = startDayOfWeek * cellWidth + startPos.left;
    width = (7 - startDayOfWeek) * cellWidth - startPos.left;
  } else if (isEndWeek) {
    // Ends in this week, started earlier
    const endDayOfWeek = eventEnd.day();
    const endDate = eventEnd.startOf("day");
    const endPos = getHorizontalPositionInDay(event, endDate, cellWidth);

    left = 0;
    width = endDayOfWeek * cellWidth + endPos.left + endPos.width;
  } else {
    // Spans entire week
    left = 0;
    width = 7 * cellWidth;
  }

  const position = {
    event,
    left,
    width: Math.max(width, 2),
    row: 0,
    weekIndex,
    isVisible: true,
    isFirstWeek: isStartWeek, // Only true for first week of the event
    isLastWeek: isEndWeek, // Only true for final week of the event
  };

  return position;
}

/**
 * Get color for event using shared theme
 * Delegates to centralized theme utility
 * @param event - The calendar event
 * @param theme - The current theme
 * @returns Hex color string
 */
export function getEventColor(
  event: CalendarEvent,
  theme: import("../utils/theme").CalendarTheme
): string {
  return getCalendarEventColor(event, theme);
}

/**
 * Assign global row numbers to events based on eventId
 * All events with the same eventId get the same row number
 * @param positions - Array of event positions
 * @param maxVisibleRows - Maximum number of rows to display
 * @returns Map of weekIndex to array of EventPositions with assigned rows
 */
export function assignGlobalRows(
  positions: EventPosition[],
  maxVisibleRows: number
): Map<number, EventPosition[]> {
  // Step 1: Collect ALL unique eventIds across entire month
  const uniqueEventIds = new Set<string>();
  positions.forEach((pos) => {
    uniqueEventIds.add(pos.event.eventId);
  });

  // Step 2: Sort alphabetically for consistent order
  const sortedEventIds = Array.from(uniqueEventIds).sort();

  // Step 3: Create global eventId-to-row mapping
  const globalEventIdToRow = new Map<string, number>();
  sortedEventIds.forEach((eventId, index) => {
    globalEventIdToRow.set(eventId, index);
  });

  // Step 4: Group positions by week and apply global row assignments
  const grouped = new Map<number, EventPosition[]>();

  positions.forEach((pos) => {
    const row = globalEventIdToRow.get(pos.event.eventId) || 0;
    const updatedPos = {
      ...pos,
      row: row,
      isVisible: row < maxVisibleRows,
    };

    if (!grouped.has(pos.weekIndex)) {
      grouped.set(pos.weekIndex, []);
    }
    grouped.get(pos.weekIndex)!.push(updatedPos);
  });

  return grouped;
}

/**
 * Calculate overflow counts per day
 * Shows how many events are hidden due to maxVisibleRows limit
 * @param eventPositions - All event positions
 * @param weeks - Calendar week structure
 * @param target - Target month dayjs object
 * @param maxVisibleRows - Maximum visible rows
 * @returns Map of "weekIndex-dayIndex" to overflow count
 */
export function calculateOverflowByDay(
  eventPositions: EventPosition[],
  weeks: number[][],
  target: dayjs.Dayjs,
  maxVisibleRows: number
): Map<string, number> {
  const overflowMap = new Map<string, number>();

  weeks.forEach((week, weekIndex) => {
    week.forEach((dayNum, dayIndex) => {
      if (dayNum <= 0) return; // Skip empty cells

      const date = target.date(dayNum);
      const dayKey = `${weekIndex}-${dayIndex}`;

      // Count how many unique eventIds have events on this day
      const eventIdsOnThisDay = new Set<string>();

      eventPositions.forEach((pos) => {
        if (pos.weekIndex !== weekIndex) return;

        const eventStart = dayjs(pos.event.start);
        const eventEnd = dayjs(pos.event.end);

        // Check if this event touches this specific day
        const dayStart = date.startOf("day");
        const dayEnd = date.endOf("day");

        if (
          eventStart.isBefore(dayEnd, "minute") &&
          eventEnd.isAfter(dayStart, "minute")
        ) {
          eventIdsOnThisDay.add(pos.event.eventId);
        }
      });

      // Calculate overflow (total eventIds - maxVisibleRows)
      const totalRows = eventIdsOnThisDay.size;
      const hiddenCount = Math.max(0, totalRows - maxVisibleRows);

      if (hiddenCount > 0) {
        overflowMap.set(dayKey, hiddenCount);
      }
    });
  });

  return overflowMap;
}
