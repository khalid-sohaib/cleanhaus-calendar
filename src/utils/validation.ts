/**
 * Prop validation utilities for Calendar component
 * Provides helpful error messages for common mistakes
 */

import { CalendarEvent, ViewMode } from "../types";

export interface ValidationError {
  field: string;
  message: string;
  index?: number;
}

/**
 * Validate a CalendarEvent object
 * @param event - The event to validate
 * @param index - Index of the event in the array (for error messages)
 * @returns Array of validation errors (empty if valid)
 */
export function validateEvent(
  event: CalendarEvent,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check required fields
  if (!event.id || typeof event.id !== "string") {
    errors.push({
      field: "id",
      message: `Event at index ${index}: "id" is required and must be a string`,
      index,
    });
  }

  if (!event.eventId || typeof event.eventId !== "string") {
    errors.push({
      field: "eventId",
      message: `Event at index ${index}: "eventId" is required and must be a string`,
      index,
    });
  }

  if (!event.title || typeof event.title !== "string") {
    errors.push({
      field: "title",
      message: `Event at index ${index}: "title" is required and must be a string`,
      index,
    });
  }

  // Check start date
  if (!event.start) {
    errors.push({
      field: "start",
      message: `Event at index ${index}: "start" is required`,
      index,
    });
  } else if (!(event.start instanceof Date)) {
    errors.push({
      field: "start",
      message: `Event at index ${index}: "start" must be a Date object, got ${typeof event.start}. Use: new Date(dateString) to convert.`,
      index,
    });
  } else if (isNaN(event.start.getTime())) {
    errors.push({
      field: "start",
      message: `Event at index ${index}: "start" is an invalid Date`,
      index,
    });
  }

  // Check end date
  if (!event.end) {
    errors.push({
      field: "end",
      message: `Event at index ${index}: "end" is required`,
      index,
    });
  } else if (!(event.end instanceof Date)) {
    errors.push({
      field: "end",
      message: `Event at index ${index}: "end" must be a Date object, got ${typeof event.end}. Use: new Date(dateString) to convert.`,
      index,
    });
  } else if (isNaN(event.end.getTime())) {
    errors.push({
      field: "end",
      message: `Event at index ${index}: "end" is an invalid Date`,
      index,
    });
  }

  // Check date range validity
  if (
    event.start instanceof Date &&
    event.end instanceof Date &&
    !isNaN(event.start.getTime()) &&
    !isNaN(event.end.getTime())
  ) {
    if (event.start >= event.end) {
      errors.push({
        field: "dateRange",
        message: `Event at index ${index}: "start" date must be before "end" date`,
        index,
      });
    }
  }

  return errors;
}

/**
 * Validate Calendar component props
 * @param props - The props to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateCalendarProps(props: {
  events: CalendarEvent[];
  date: Date;
  onDateChange?: (date: Date) => void;
  onEventPress?: (event: CalendarEvent) => void;
  view?: ViewMode;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate date prop
  if (!props.date) {
    errors.push({
      field: "date",
      message: '"date" prop is required',
    });
  } else if (!(props.date instanceof Date)) {
    errors.push({
      field: "date",
      message: `"date" must be a Date object, got ${typeof props.date}. Use: new Date() or new Date(dateString)`,
    });
  } else if (isNaN(props.date.getTime())) {
    errors.push({
      field: "date",
      message: '"date" is an invalid Date',
    });
  }

  // Validate required callbacks
  if (!props.onDateChange || typeof props.onDateChange !== "function") {
    errors.push({
      field: "onDateChange",
      message: '"onDateChange" prop is required and must be a function',
    });
  }

  if (!props.onEventPress || typeof props.onEventPress !== "function") {
    errors.push({
      field: "onEventPress",
      message: '"onEventPress" prop is required and must be a function',
    });
  }

  // Validate view prop
  if (props.view && !["month", "week", "day"].includes(props.view)) {
    errors.push({
      field: "view",
      message: `"view" must be one of: "month", "week", "day". Got: ${props.view}`,
    });
  }

  // Validate events array
  if (!Array.isArray(props.events)) {
    errors.push({
      field: "events",
      message: '"events" must be an array',
    });
  } else {
    // Validate each event
    props.events.forEach((event, index) => {
      const eventErrors = validateEvent(event, index);
      errors.push(...eventErrors);
    });
  }

  return errors;
}

/**
 * Log validation errors in development mode
 * @param errors - Array of validation errors
 */
export function logValidationErrors(errors: ValidationError[]): void {
  if (errors.length === 0) return;

  if (process.env.NODE_ENV !== "production") {
    console.error(
      "❌ Calendar Component Validation Errors:\n" +
        errors.map((err) => `  • ${err.message}`).join("\n") +
        "\n\n" +
        "Common fixes:\n" +
        "  • Convert date strings to Date objects: new Date(dateString)\n" +
        "  • Ensure start < end for all events\n" +
        "  • Provide required callbacks: onDateChange, onEventPress"
    );
  }
}

