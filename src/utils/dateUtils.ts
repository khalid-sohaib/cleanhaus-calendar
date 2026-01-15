/**
 * Shared date utilities for calendar components
 * Uses dayjs for consistent, reliable date operations across all views
 */

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import duration from "dayjs/plugin/duration";
import { WEEK_VIEW_HOUR_HEIGHT } from "../WeekView/constants";

// Extend dayjs with plugins
dayjs.extend(isBetween);
dayjs.extend(duration);

export const MINUTES_IN_DAY = 1440;
export const HOURS_IN_DAY = 24;

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return date.toLocaleDateString(
    "en-US",
    options || {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

/**
 * Navigate to previous/next period based on view mode
 * Uses dayjs to avoid mutating the input date
 * @param currentDate - Current date
 * @param direction - Direction to navigate
 * @param viewMode - Calendar view mode
 * @returns New date (immutable)
 */
export function navigateDate(
  currentDate: Date,
  direction: "prev" | "next",
  viewMode: "day" | "week" | "month"
): Date {
  const step = viewMode === "day" ? 1 : viewMode === "week" ? 7 : 30;
  return dayjs(currentDate)
    .add(direction === "next" ? step : -step, "day")
    .toDate();
}

/**
 * Get date label for display based on view mode
 * @param date - The date
 * @param viewMode - Calendar view mode
 * @returns Formatted label string
 */
export function getDateLabel(
  date: Date,
  viewMode: "day" | "week" | "month"
): string {
  if (viewMode === "day") {
    return formatDate(date, { month: "long", day: "numeric", year: "numeric" });
  }

  if (viewMode === "week") {
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + 6);
    const startMonth = date.toLocaleDateString("en-US", { month: "short" });
    const endMonth = endOfWeek.toLocaleDateString("en-US", { month: "short" });

    if (startMonth === endMonth) {
      return `${startMonth} ${date.getDate()}-${endOfWeek.getDate()}, ${date.getFullYear()}`;
    }
    return `${startMonth} ${date.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${date.getFullYear()}`;
  }

  // month
  return formatDate(date, { month: "long", year: "numeric" });
}

/**
 * Get start of day (00:00:00.000) using dayjs
 * @param date - The date
 * @returns Date object at start of day
 */
export function getDayStart(date: Date): Date {
  return dayjs(date).startOf("day").toDate();
}

/**
 * Get end of day (23:59:59.999) using dayjs
 * @param date - The date
 * @returns Date object at end of day
 */
export function getDayEnd(date: Date): Date {
  return dayjs(date).endOf("day").toDate();
}

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return dayjs(date1).isSame(date2, "day");
}

/**
 * Check if date is today
 * @param date - The date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Format time in AM/PM or 24-hour format
 * @param date - The date to format
 * @param use24Hour - Use 24-hour format (default: false)
 * @returns Formatted time string
 */
export function formatTime(date: Date, use24Hour: boolean = false): string {
  return dayjs(date).format(use24Hour ? "HH:mm" : "h:mm A");
}

/**
 * Format an hour label without minutes, matching calendar rail (e.g., 12AM, 1PM)
 * @param hour - 0..23
 * @param use24Hour - Use 24-hour format (default: false)
 */
export function formatHourLabel(
  hour: number,
  use24Hour: boolean = false
): string {
  if (use24Hour) {
    return dayjs().hour(hour).minute(0).format("HH");
  }
  // 12h compact without space between number and meridiem
  // 0 -> 12AM, 12 -> 12PM, others -> hAM/PM
  if (hour === 0) return "12AM";
  if (hour === 12) return "12PM";
  if (hour > 12) return `${hour - 12}PM`;
  return `${hour}AM`;
}

/**
 * Format time range
 * @param start - Start date
 * @param end - End date
 * @param use24Hour - Use 24-hour format (default: false)
 * @returns Formatted time range string
 */
export function formatTimeRange(
  start: Date,
  end: Date,
  use24Hour: boolean = false
): string {
  const format = use24Hour ? "HH:mm" : "h:mm A";
  return `${dayjs(start).format(format)} - ${dayjs(end).format(format)}`;
}

/**
 * Get duration in minutes between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Duration in minutes
 */
export function getDurationMinutes(start: Date, end: Date): number {
  return dayjs(end).diff(dayjs(start), "minute");
}

/**
 * Get duration in hours between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Duration in hours (decimal)
 */
export function getDurationHours(start: Date, end: Date): number {
  return dayjs(end).diff(dayjs(start), "hour", true);
}

/**
 * Clamp a date to be within day boundaries
 * Returns new date if clamping occurred, original if within bounds
 * @param date - Date to clamp
 * @param dayStart - Start of day boundary
 * @param dayEnd - End of day boundary
 * @returns Clamped date
 */
export function clampToDay(date: Date, dayStart: Date, dayEnd: Date): Date {
  const d = dayjs(date);
  const start = dayjs(dayStart);
  const end = dayjs(dayEnd);

  if (d.isBefore(start)) return start.toDate();
  if (d.isAfter(end)) return end.toDate();
  return date;
}

/**
 * Check if an event overlaps with a specific day
 * @param eventStart - Event start date
 * @param eventEnd - Event end date
 * @param targetDate - Target day to check
 * @returns True if event overlaps with the day
 */
export function eventOverlapsDay(
  eventStart: Date,
  eventEnd: Date,
  targetDate: Date
): boolean {
  const dayStart = getDayStart(targetDate);
  const dayEnd = getDayEnd(targetDate);
  return (
    dayjs(eventStart).isBefore(dayEnd) && dayjs(eventEnd).isAfter(dayStart)
  );
}

/**
 * Set time on a date without mutating the original
 * @param date - Base date
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59), default: 0
 * @param seconds - Seconds (0-59), default: 0
 * @returns New Date with specified time
 */
export function setTimeOnDate(
  date: Date,
  hours: number,
  minutes: number = 0,
  seconds: number = 0
): Date {
  return dayjs(date).hour(hours).minute(minutes).second(seconds).millisecond(0).toDate();
}

/**
 * Get date with time from click position in week view
 * @param date - Base date
 * @param yPosition - Y coordinate from touch event
 * @returns Date with calculated time
 */
export function getTimeFromPosition(date: Date, yPosition: number): Date {
  const hours = Math.max(0, Math.min(23.999, yPosition / WEEK_VIEW_HOUR_HEIGHT));
  const wholeHours = Math.floor(hours);
  const minutes = Math.floor((hours - wholeHours) * 60);
  
  return setTimeOnDate(date, wholeHours, minutes);
}

/**
 * Get date for cell press - current time if today, start of day otherwise
 * @param pressedDate - The date that was pressed
 * @returns Date with appropriate time
 */
export function getCellPressDateTime(pressedDate: Date): Date {
  if (isToday(pressedDate)) {
    return new Date(); // Current time if today
  }
  return getDayStart(pressedDate); // Start of day otherwise
}
