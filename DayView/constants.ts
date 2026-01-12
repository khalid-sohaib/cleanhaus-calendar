/**
 * DayView Constants
 *
 * Centralized configuration for the DayView component.
 * All layout dimensions and timing constants are defined here.
 */

// Layout Dimensions
export const HOUR_HEIGHT = 80; // Height per hour in pixels
export const TIME_COLUMN_WIDTH = 40; // Width of time column
export const PROPERTY_LANE_WIDTH = 170; // Fallback width for property lane (used if dynamic calculation fails)
export const PROPERTY_LANE_WIDTH_PERCENTAGE = 0.48; // 48% of available width (screen - time column)
export const PROPERTY_LANE_MIN_WIDTH = 150; // Minimum width for small screens
export const PROPERTY_LANE_MAX_WIDTH = 250; // Maximum width for large screens
export const HEADER_HEIGHT = 40; // Fixed header height
export const GRID_LINE_HEIGHT = 1; // Height of hour grid lines

// Scroll Configuration
export const SCROLL_EVENT_THROTTLE = 16; // Scroll event throttling (60fps)
export const SCROLL_BUFFER_PX = 120; // Buffer space (in pixels) above scroll target for better visibility

// Typography
export const HEADER_FONT_SIZE = 16;
export const HEADER_FONT_WEIGHT = "600" as const;
export const TIME_FONT_SIZE = 10;
export const TIME_FONT_WEIGHT = "400" as const;

// Spacing
export const HEADER_PADDING_VERTICAL = 12;
export const HEADER_PADDING_HORIZONTAL = 12;
export const TIME_PADDING_HORIZONTAL = 2;
export const CONTENT_PADDING_TOP = 5;
export const TIME_TEXT_OFFSET = -5; // Offset for time text alignment
export const EVENT_SPACING = 4; // Vertical spacing between consecutive touching events
export const EVENT_HORIZONTAL_PADDING = 8; // Horizontal padding inside property lanes for events

// Colors (fallbacks)
export const DEFAULT_BACKGROUND = "#F9FAFB";
export const DEFAULT_BORDER = "#E5E7EB";
