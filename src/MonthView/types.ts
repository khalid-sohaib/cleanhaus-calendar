import { CalendarEvent } from "../types";
import { CalendarTheme } from "../utils/theme";

/**
 * MonthView-specific types
 */

export interface MonthViewProps {
  events: CalendarEvent[];
  targetDate: Date;
  containerHeight: number;
  onPressEvent?: (event: CalendarEvent) => void;
  onPressCell?: (date: Date) => void;
  onShowMore?: (date: Date) => void; // Callback when "+X more" is clicked
  onMonthChange?: (date: Date) => void; // Callback when swiping to change month
  maxVisibleRows?: number; // Default: 3
  swipeEnabled?: boolean; // Enable/disable swipe gestures. Default: true
  theme: CalendarTheme; // Required: theme object
  availableProperties?: Array<{ id: number }>; // Optional: for consistent property colors
  propertyColors?: string[]; // Optional: custom property colors array
  propertyColorsDark?: string[]; // Optional: custom dark property colors array
  cleaningIcon?: any; // Optional: custom cleaning icon (Image source)
}

export interface EventPosition {
  event: CalendarEvent;
  left: number; // Absolute pixel from week start
  width: number; // Width in pixels
  row: number; // Row index (0-based)
  weekIndex: number; // Which week
  isVisible: boolean;
  isFirstWeek: boolean; // True only for first week of multi-week events
  isLastWeek: boolean; // True only for final week segment of the event
}

export interface HorizontalPosition {
  left: number;
  width: number;
}
