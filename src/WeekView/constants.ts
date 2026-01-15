/**
 * WeekView Constants
 *
 * Layout dimensions and configuration for the WeekView component.
 * Uses compact sizing compared to DayView for the 7-day grid.
 */

// Layout Dimensions
export const WEEK_VIEW_HOUR_HEIGHT = 80; // Same as DayView for consistency
export const TIME_COLUMN_WIDTH = 40; // Same as DayView

// Note: DAY_COLUMN_WIDTH is calculated dynamically in WeekView component
// based on actual screen width using useWindowDimensions()
// This ensures proper responsive behavior across platforms
export const PROPERTY_BAR_HEIGHT = 20; // Height of property indicator bars
export const HEADER_HEIGHT = 40; // Day header height
export const GRID_LINE_HEIGHT = 1; // Same as DayView

// Property Indicator spacing/behavior
export const PROPERTY_BAR_VERTICAL_GAP = 4; // Vertical space between rows (px)
export const INDICATOR_COLLAPSED_ROWS = 2; // Show two rows by default
export const PROPERTY_TO_GRID_GAP = 20; // Gap between indicators and day columns (px)

// Event Configuration
export const MAX_EVENTS_PER_SLOT = 2; // Max 2 events before +X overflow
export const EVENT_SLOT_HEIGHT = 35; // Height for each event slot (allows side-by-side)
export const OVERFLOW_INDICATOR_HEIGHT = 18; // Height for +X overflow indicator
export const DAY_OVERFLOW_TOP_INSET = OVERFLOW_INDICATOR_HEIGHT + 4; // Space reserved above day grid for +X

// Scroll Configuration
export const SCROLL_EVENT_THROTTLE = 16; // Scroll event throttling (60fps)

// Typography
export const HEADER_FONT_SIZE = 14;
export const HEADER_FONT_WEIGHT = "600" as const;
export const TIME_FONT_SIZE = 10;
export const TIME_FONT_WEIGHT = "400" as const;

// Spacing
export const HEADER_PADDING_VERTICAL = 8;
export const HEADER_PADDING_HORIZONTAL = 4;
export const TIME_PADDING_HORIZONTAL = 2;
export const CONTENT_PADDING_TOP = 5;
export const TIME_TEXT_OFFSET = -5;
export const DAY_COLUMN_PADDING = 2; // Padding within each day column

// Colors (fallbacks)
export const DEFAULT_BACKGROUND = "#F9FAFB";
export const DEFAULT_BORDER = "#E5E7EB";

// Time display range (can be adjusted)
export const VISIBLE_HOURS_START = 0; // Start from midnight (adjust to 6 or 7 for 6AM start)
export const VISIBLE_HOURS_END = 24; // End at midnight
