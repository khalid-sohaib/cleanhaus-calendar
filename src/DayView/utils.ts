import dayjs from "dayjs";
import { CalendarEvent } from "../types";
import {
  getDayStart,
  getDayEnd,
  eventOverlapsDay,
  clampToDay,
  getDurationHours,
  formatTimeRange,
  isSameDay,
} from "../utils/dateUtils";
import { extractEntityId } from "../utils/eventHelpers";

/**
 * Filter events for a specific date without modifying the original data.
 *
 * This function only filters events that overlap with the target date.
 * Unassigned events are now included in day view to show gaps between bookings.
 * The actual clamping for rendering is handled in getEventPosition().
 *
 * Examples:
 * - Event from Dec 1 10:00 to Dec 3 14:00 viewed on Dec 2:
 *   → Returns original event (Dec 1 10:00 to Dec 3 14:00)
 * - Event from Dec 1 10:00 to Dec 1 14:00 viewed on Dec 1:
 *   → Returns original event (Dec 1 10:00 to Dec 1 14:00)
 * - Event from Dec 1 22:00 to Dec 2 02:00 viewed on Dec 2:
 *   → Returns original event (Dec 1 22:00 to Dec 2 02:00)
 * - Unassigned event (type: "unassigned"):
 *   → Included in day view to show gaps between bookings
 *
 * The rendering layer (getEventPosition) handles clamping for visual positioning.
 */
export function getEventsForDate(
  events: CalendarEvent[],
  targetDate: Date
): CalendarEvent[] {
  // Simply filter events that overlap with the target date
  // Now includes unassigned events for day view
  return events.filter(
    (event) =>
      eventOverlapsDay(event.start, event.end, targetDate)
  );
}

/**
 * Group events by property
 * @param events - Events to group
 * @param availableProperties - All available properties (for color mapping)
 * @param propertiesToShow - Properties to show in lanes (filtered by user selection)
 */
export function groupEventsByProperty(
  events: CalendarEvent[],
  availableProperties: Array<{ id: number; name?: string }>,
  propertiesToShow?: Array<{ id: number; name?: string }>
): Array<{
  propertyId: number;
  propertyName: string;
  events: CalendarEvent[];
}> {
  const propertyMap = new Map<
    number,
    { name: string; events: CalendarEvent[] }
  >();

  // Use propertiesToShow if provided, otherwise use all availableProperties
  const properties = propertiesToShow || availableProperties;

  // Initialize with properties to show (even if they have no events)
  properties.forEach((property) => {
    propertyMap.set(property.id, {
      name: property.name || `Property ${property.id}`,
      events: [],
    });
  });

  // Group events by property
  events.forEach((event) => {
    const entityId = extractEntityId(event.eventId);
    if (entityId !== null) {
      const property = propertyMap.get(entityId);
      if (property) {
        property.events.push(event);
      }
    }
    // If property not in propertiesToShow, skip it (shouldn't happen if filtering is correct)
  });

  // Convert to array format - include all properties (even with no events)
  return Array.from(propertyMap.entries()).map(
    ([propertyId, { name, events }]) => ({
      propertyId,
      propertyName: name,
      events,
    })
  );
}

/**
 * Get events for a specific property
 */
export function getEventsForProperty(
  events: CalendarEvent[],
  propertyId: number
): CalendarEvent[] {
  return events.filter((event) => {
    const entityId = extractEntityId(event.eventId);
    return entityId === propertyId;
  });
}

/**
 * Calculate event position within the day view with local clamping for rendering.
 *
 * This function handles clamping multi-day events to the target day boundaries
 * for visual positioning only. The original event data remains unchanged.
 *
 * @param event - The calendar event (original data preserved)
 * @param hourHeight - Height of each hour in pixels
 * @param targetDate - The date being viewed (for clamping boundaries)
 * @returns Position data with clamped times for rendering
 */
export function getEventPosition(
  event: CalendarEvent,
  hourHeight: number,
  targetDate: Date
): {
  top: number;
  height: number;
} {
  const dayStart = getDayStart(targetDate);
  const dayEnd = getDayEnd(targetDate);

  // Clamp times for positioning only (local variables - no data modification)
  const renderStart = clampToDay(event.start, dayStart, dayEnd);
  const renderEnd = clampToDay(event.end, dayStart, dayEnd);

  // Calculate top position based on clamped start time
  const startHour = renderStart.getHours();
  const startMinute = renderStart.getMinutes();
  const top = (startHour + startMinute / 60) * hourHeight;

  // Calculate height based on clamped duration
  const durationHours = getDurationHours(renderStart, renderEnd);
  const height = Math.max(durationHours * hourHeight, 20); // Minimum height of 20px

  // For now, events take full width of their lane
  // TODO: Implement side-by-side layout for overlapping events
  return {
    top,
    height,
    // Width and left are now handled by CSS flexbox in PropertyLane
  };
}

/**
 * Check if two events are related (checkout -> cleaning)
 */
export function areEventsRelated(
  event1: CalendarEvent,
  event2: CalendarEvent
): boolean {
  // Check if one is a booking and the other is a cleaning job
  const isBooking1 = event1.meta?.type === "property";
  const isCleaning1 = event1.meta?.type === "cleaning";
  const isBooking2 = event2.meta?.type === "property";
  const isCleaning2 = event2.meta?.type === "cleaning";

  // Must be different types
  if ((isBooking1 && isBooking2) || (isCleaning1 && isCleaning2)) {
    return false;
  }

  // Check if they're for the same property
  const entityId1 = extractEntityId(event1.eventId);
  const entityId2 = extractEntityId(event2.eventId);

  if (entityId1 === null || entityId2 === null || entityId1 !== entityId2) {
    return false;
  }

  // Check if cleaning starts shortly after booking ends
  const timeDiff = event2.start.getTime() - event1.end.getTime();
  const maxGapMinutes = 30; // 30 minutes max gap

  return timeDiff >= 0 && timeDiff <= maxGapMinutes * 60 * 1000;
}

/**
 * Find cleaning assignee for a booking event
 * Looks for cleaning jobs with the same jobId as the booking
 */
export function getCleaningAssigneeForBooking(
  bookingEvent: CalendarEvent,
  allEvents: CalendarEvent[]
): { name: string; phone?: string } | null {
  // Only process booking events
  if (bookingEvent.meta?.type !== "property") {
    return null;
  }

  const jobId = bookingEvent.meta?.jobId;
  if (!jobId) {
    return null;
  }

  // Find cleaning job with the same jobId
  const cleaningJob = allEvents.find((event) => {
    return (
      event.meta?.type === "cleaning" &&
      event.meta?.jobId === jobId &&
      event.meta?.assignee?.name
    );
  });

  return cleaningJob?.meta?.assignee || null;
}

/**
 * Check if a cleaning job is urgent (within 3 hours of check-in)
 *
 * Urgency is determined by comparing the cleaning job start time
 * with the related booking's check-in time. If the time difference
 * is 3 hours or less, the job is considered urgent.
 *
 * @param cleaningEvent - The cleaning job event
 * @param allEvents - All events to find related booking
 * @returns true if job is urgent (within 3 hours of check-in)
 */
export function isJobUrgent(
  cleaningEvent: CalendarEvent,
  allEvents: CalendarEvent[]
): boolean {
  // Only process cleaning/service events
  if (
    cleaningEvent.meta?.type !== "cleaning" &&
    cleaningEvent.meta?.type !== "service"
  ) {
    return false;
  }

  // Find the related booking for this cleaning job
  const relatedBooking = allEvents.find((event) => {
    return (
      event.meta?.type === "property" &&
      event.eventId === cleaningEvent.eventId && // Same property
      event.meta?.jobId === cleaningEvent.meta?.jobId // Same job ID
    );
  });

  if (!relatedBooking) {
    return false;
  }

  // Get check-in time from booking (always available - uses default if not specified)
  const checkInTime = getCheckInTimeFromBooking(relatedBooking);

  // Calculate time difference between job start and check-in
  const jobStartTime = cleaningEvent.start.getTime();
  const checkInTimeMs = checkInTime.getTime();
  const timeDifferenceMs = Math.abs(checkInTimeMs - jobStartTime);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);

  // Urgent if within 3 hours
  return timeDifferenceHours <= 3;
}

/**
 * Check if a cleaning job has a conflict with the next booking's check-in time
 * Conflict occurs when cleaning ends after a booking's check-in time on the same day
 * 
 * Edge cases handled:
 * - Only checks bookings on the same date as cleaning end date
 * - Only checks bookings for the same property
 * - Uses default check-in time from property if booking doesn't specify one
 * - Handles multiple bookings on the same day
 *
 * @param cleaningEvent - The cleaning job event
 * @param allEvents - All events to find next booking
 * @returns true if there's a conflict (cleaning ends after check-in on same day)
 */
export function hasConflict(
  cleaningEvent: CalendarEvent,
  allEvents: CalendarEvent[]
): boolean {
  // Only process cleaning/service events
  if (
    cleaningEvent.meta?.type !== "cleaning" &&
    cleaningEvent.meta?.type !== "service"
  ) {
    return false;
  }

  const cleaningEndTime = cleaningEvent.end.getTime();
  const cleaningEndDate = cleaningEvent.end;

  // Single pass: check all bookings on the same date and property
  for (const event of allEvents) {
    // Filter: must be a property booking
    if (event.meta?.type !== "property") {
      continue;
    }

    // Filter: must be same property
    if (event.eventId !== cleaningEvent.eventId) {
      continue;
    }

    // Filter: must be on the same date as cleaning end date
    if (!isSameDay(event.start, cleaningEndDate)) {
      continue;
    }

    // Extract check-in time (always available - uses default if not specified)
    const checkInTime = getCheckInTimeFromBooking(event);
    const checkInTimeMs = checkInTime.getTime();

    // Conflict: cleaning ends after this booking's check-in time
    // This means the cleaning job is still running when guests are checking in
    if (cleaningEndTime > checkInTimeMs) {
      return true; // Early exit on first conflict found
    }
  }

  return false; // No conflicts found
}

/**
 * Extract check-in time from booking event
 * Every property has default check-in times, so this always returns a valid date
 * Uses dayjs to avoid mutating the input date
 * @param bookingEvent - The booking event
 * @returns Date object of check-in time (immutable)
 */
function getCheckInTimeFromBooking(bookingEvent: CalendarEvent): Date {
  // Try to get check-in time from meta (default check-in from property)
  const checkInTime = bookingEvent.meta?.checkIn;
  
  if (checkInTime) {
    // Parse check-in time (format: "HH:MM")
    const [hours, minutes] = checkInTime.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      // Use dayjs to set time without mutating the original date
      return dayjs(bookingEvent.start)
        .hour(hours)
        .minute(minutes)
        .second(0)
        .millisecond(0)
        .toDate();
    }
  }

  // Fallback: booking start date already has check-in time applied
  // (from calendarDataTransformer when default check-in is used)
  return new Date(bookingEvent.start);
}

/**
 * Get check-in readiness alerts for a property
 */
export function getCheckInAlerts(
  events: CalendarEvent[],
  propertyId: number,
  targetDate: Date
): Array<{
  time: Date;
  message: string;
  isReady: boolean;
}> {
  const propertyEvents = getEventsForProperty(events, propertyId);
  const alerts: Array<{
    time: Date;
    message: string;
    isReady: boolean;
  }> = [];

  // Find bookings with check-ins today
  const checkInBookings = propertyEvents.filter((event) => {
    if (event.meta?.type !== "property") return false;

    const checkInDate = new Date(event.start);
    return checkInDate.toDateString() === targetDate.toDateString();
  });

  checkInBookings.forEach((booking) => {
    const checkInTime = new Date(booking.start);

    // Find related cleaning jobs
    const relatedCleanings = propertyEvents.filter((event) => {
      if (event.meta?.type !== "cleaning") return false;
      return areEventsRelated(booking, event);
    });

    // Check if cleaning is completed before check-in
    const incompleteCleanings = relatedCleanings.filter(
      (cleaning) => cleaning.meta?.status?.toLowerCase() !== "complete"
    );

    const isReady = incompleteCleanings.length === 0;

    alerts.push({
      time: checkInTime,
      message: `Check-in: Today, ${checkInTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`,
      isReady,
    });
  });

  return alerts;
}
