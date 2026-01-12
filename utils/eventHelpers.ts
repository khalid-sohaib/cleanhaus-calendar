/**
 * Event Helper Utilities for Calendar Component
 *
 * Consolidates all event-specific utilities including:
 * - Formatting (time, dates, check-in)
 * - Color mapping (status, alerts)
 * - Alert detection
 * - Assignee information extraction
 *
 * These utilities are shared across DayView, WeekView, and MonthView.
 */

import { CalendarEvent } from "../types";
import { hasConflict } from "../DayView/utils";
import { CalendarTheme } from "./theme";
import { formatTimeRange as utilFormatTimeRange } from "./dateUtils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AlertSeverity = "error" | "warning";

export interface EventAlert {
  type: AlertSeverity;
  message: string;
  icon: string;
}

export interface AssigneeInfo {
  name: string;
  initials: string;
  phone?: string;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format event time for display
 * Handles custom time ranges in meta or falls back to actual times
 * @param event - Calendar event
 * @param use24Hour - Use 24-hour format (default: false)
 * @returns Formatted time string
 */
export function formatEventTime(
  event: CalendarEvent,
  use24Hour = false
): string {
  // If event has a specific time range in meta, use that
  if (event.meta?.timeRange) {
    return event.meta.timeRange;
  }

  // Use shared utility for consistent formatting
  return utilFormatTimeRange(event.start, event.end, use24Hour);
}

/**
 * Format check-in time in AM/PM format
 * @param checkInTime - Time string (e.g., "11:00:00" or "3:00 PM")
 * @returns Formatted time string (e.g., "11:00 AM")
 */
export function formatCheckInTime(checkInTime: string): string {
  if (!checkInTime) return "";

  // If already formatted, return as is
  if (checkInTime.includes("AM") || checkInTime.includes("PM")) {
    return checkInTime;
  }

  // Parse time string (e.g., "11:00:00")
  const [hours, minutes] = checkInTime.split(":");
  const hour = parseInt(hours);
  const minute = parseInt(minutes);

  // Convert to 12-hour format
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  const minuteStr = minute.toString().padStart(2, "0");

  return `${hour12}:${minuteStr} ${ampm}`;
}

/**
 * Format booking dates (start and end)
 * @param startDate - Booking start date
 * @param endDate - Booking end date
 * @returns Formatted date range string (e.g., "Jan 15 - Jan 18")
 */
export function formatBookingDates(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const end = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${start} - ${end}`;
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Lighten a hex color by mixing it with white
 * @param hexColor - Hex color string (e.g., "#33E284")
 * @param amount - Amount to lighten (0-1, where 0.75 = 75% white, 25% original)
 * @returns Lightened hex color string
 */
function lightenColor(hexColor: string, amount: number = 0.75): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);

  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

/**
 * Get color for event status from theme
 * @param status - Event status string
 * @param theme - Calendar theme
 * @param lighten - Whether to return a lightened version for badge backgrounds (default: true)
 * @returns Hex color string from theme
 */
export function getStatusColor(
  status: string | undefined,
  theme: CalendarTheme,
  lighten: boolean = true
): string {
  if (!status) {
    return lighten
      ? lightenColor(theme.statusScheduled, 0.75)
      : theme.statusScheduled;
  }

  const normalized = status.toLowerCase().trim();
  let baseColor: string;

  // Complete/Finished statuses
  if (
    normalized === "complete" ||
    normalized === "completed" ||
    normalized === "confirmed" ||
    normalized === "finished" ||
    normalized === "done"
  ) {
    baseColor = theme.statusComplete;
  }
  // In Progress/Pending statuses
  else if (
    normalized === "in-progress" ||
    normalized === "in_progress" ||
    normalized === "pending" ||
    normalized === "in progress"
  ) {
    baseColor = theme.statusInProgress;
  }
  // Issue/At Risk statuses
  else if (
    normalized === "issue" ||
    normalized === "issue-reported" ||
    normalized === "cancelled" ||
    normalized === "declined" ||
    normalized === "at risk" ||
    normalized === "at-risk" ||
    normalized === "at_risk"
  ) {
    baseColor = theme.statusIssue;
  }
  // Scheduled/Not Started - use statusScheduled from theme
  else {
    baseColor = theme.statusScheduled;
  }

  // Return lightened version for badge backgrounds (pastel look)
  return lighten ? lightenColor(baseColor, 0.75) : baseColor;
}

/**
 * Get color for alert severity from theme
 * @param severity - Alert severity level
 * @param theme - Calendar theme
 * @returns Hex color string from theme
 */
export function getAlertColor(
  severity: "error" | "warning",
  theme: CalendarTheme
): string {
  return severity === "error" ? theme.alertError : theme.alertWarning;
}

// ============================================================================
// ALERT UTILITIES
// ============================================================================

/**
 * Get alerts for a calendar event based on its metadata
 * Returns alerts that should be displayed for the event
 *
 * @param event - Calendar event
 * @returns Array of alerts to display
 */
export function getEventAlerts(
  event: CalendarEvent,
  allEvents: CalendarEvent[] = []
): EventAlert[] {
  const alerts: EventAlert[] = [];

  // Check for same-day turnover
  if (event.meta?.isSameDayTurn || event.meta?.sameDayTurnover) {
    alerts.push({
      type: "error",
      message: "Same-Day Turn",
      icon: "!",
    });
  }

  // Check for issue reported
  if (event.meta?.issueReported || event.meta?.hasIssue) {
    alerts.push({
      type: "warning",
      message: "Issue Reported",
      icon: "!",
    });
  }

  // Check for conflict (cleaning ends after check-in)
  if (hasConflict(event, allEvents)) {
    alerts.push({
      type: "warning",
      message: "Conflict detected",
      icon: "!",
    });
  }

  return alerts;
}

// ============================================================================
// EVENT DATA EXTRACTION
// ============================================================================

/**
 * Extract entity ID from eventId string
 * Centralized utility to handle entityId extraction consistently across the codebase
 * Supports formats: "entity-123", "property-123", etc.
 * 
 * @param eventId - The eventId string (e.g., "entity-123")
 * @returns Entity ID as number, or null if invalid/missing
 * 
 * @example
 * extractEntityId("entity-123") // Returns 123
 * extractEntityId("property-456") // Returns 456
 * extractEntityId("invalid") // Returns null
 * extractEntityId("") // Returns null
 */
export function extractEntityId(eventId: string | undefined | null): number | null {
  if (!eventId || typeof eventId !== 'string') {
    return null;
  }
  
  // Support multiple formats: "entity-123", "property-123", etc.
  const match = eventId.match(/(?:entity|property)-(\d+)/i);
  if (!match) {
    return null;
  }
  
  const id = parseInt(match[1], 10);
  return isNaN(id) ? null : id;
}

/**
 * Get assignee information from event metadata
 * Consolidates all assignee name logic into a single utility
 */
export function getAssigneeInfo(event: CalendarEvent): AssigneeInfo {
  const name =
    event.meta?.assignee?.name || event.meta?.cleanerName || "Unassigned";

  const initials = name.charAt(0).toUpperCase();

  return {
    name,
    initials,
    phone: event.meta?.assignee?.phone,
  };
}

/**
 * Get job title from event metadata
 * Handles job type mapping and fallbacks
 */
export function getJobTitle(event: CalendarEvent): string {
  return (
    event.meta?.jobTitle ||
    event.meta?.serviceType ||
    event.meta?.cleaningType ||
    "Turnover"
  );
}

/**
 * Check if event has enough height to show alerts
 * Simplified height calculation logic for display decisions
 */
export function hasEnoughHeightForAlerts(event: CalendarEvent): boolean {
  const MIN_EVENT_HEIGHT_FOR_ALERTS = 2.5; // hours

  const durationHours =
    (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
  return durationHours >= MIN_EVENT_HEIGHT_FOR_ALERTS;
}

/**
 * Check if a booking event has no cleaning service assigned
 * @param bookingEvent - Booking event
 * @param allEvents - All events to check for cleaning jobs
 * @returns True if no cleaning service is assigned
 */
export function hasNoCleaningService(
  bookingEvent: CalendarEvent,
  allEvents: CalendarEvent[]
): boolean {
  if (bookingEvent.meta?.type !== "property") return false;

  const jobId = bookingEvent.meta?.jobId;
  if (!jobId) return true; // No job ID means no cleaning assigned

  // Check if there's a cleaning job with this jobId
  const hasCleaningJob = allEvents.some(
    (event) => event.meta?.type === "cleaning" && event.meta?.jobId === jobId
  );

  return !hasCleaningJob;
}

/**
 * Check if a cleaning job is urgent (due within 3 hours of check-in)
 * @param cleaningEvent - Cleaning event
 * @param allEvents - All events to find related booking
 * @returns True if cleaning is due within 3 hours of check-in
 */
export function isCleaningUrgent(
  cleaningEvent: CalendarEvent,
  allEvents: CalendarEvent[]
): boolean {
  if (cleaningEvent.meta?.type !== "cleaning") return false;

  const jobId = cleaningEvent.meta?.jobId;
  if (!jobId) return false;

  // Find the related booking event
  const relatedBooking = allEvents.find(
    (event) => event.meta?.type === "property" && event.meta?.jobId === jobId
  );

  if (!relatedBooking) return false;

  // Get check-in time (booking start time)
  const checkInTime = relatedBooking.start.getTime();
  const cleaningEndTime = cleaningEvent.end.getTime();

  // Check if cleaning ends within 3 hours of check-in
  const threeHoursInMs = 3 * 60 * 60 * 1000;
  const timeDiff = checkInTime - cleaningEndTime;

  return timeDiff >= 0 && timeDiff <= threeHoursInMs;
}

/**
 * Check if cleaning job conflicts with check-in time
 * @param cleaningEvent - Cleaning event
 * @param allEvents - All events to find related booking
 * @returns True if cleaning ends after check-in time
 */
export function hasCleaningConflict(
  cleaningEvent: CalendarEvent,
  allEvents: CalendarEvent[]
): boolean {
  if (cleaningEvent.meta?.type !== "cleaning") return false;

  const jobId = cleaningEvent.meta?.jobId;
  if (!jobId) return false;

  // Find the related booking event
  const relatedBooking = allEvents.find(
    (event) => event.meta?.type === "property" && event.meta?.jobId === jobId
  );

  if (!relatedBooking) return false;

  // Check if cleaning ends after check-in time
  const checkInTime = relatedBooking.start.getTime();
  const cleaningEndTime = cleaningEvent.end.getTime();

  return cleaningEndTime > checkInTime;
}

/**
 * Get guest name from booking event
 * @param bookingEvent - Booking event
 * @returns Guest name if available, empty string otherwise
 */
export function getGuestName(bookingEvent: CalendarEvent): string {
  if (bookingEvent.meta?.type !== "property") return "";

  // Check various possible guest name fields
  return (
    bookingEvent.meta?.guestName ||
    bookingEvent.meta?.guest?.name ||
    bookingEvent.meta?.customerName ||
    ""
  );
}
