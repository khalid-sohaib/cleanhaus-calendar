import { CalendarEvent } from "../types";
import { extractEntityId } from "./eventHelpers";

/**
 * Calendar Theme Interface
 * Scalable theme system for calendar component
 */
export interface CalendarTheme {
  // Entity colors
  primary: string; // First entity color (bookings/hotels/etc)
  secondary: string; // Second entity color
  service: string; // Services color
  alert: string; // Alerts/unassigned color
  today: string; // Today highlight

  // Text colors
  text: string; // Primary text color
  textSecondary: string; // Secondary text color

  // Background colors
  background: string; // Main background color

  // Border colors
  border: string; // Border color
  borderLight: string; // Light border color

  // Status colors
  statusComplete: string; // Complete/confirmed status
  statusInProgress: string; // In-progress/pending status
  statusScheduled: string; // Not started/scheduled status
  statusIssue: string; // Issue/cancelled/declined status

  // Alert colors
  alertError: string; // Error alert color
  alertWarning: string; // Warning alert color

  // Event block colors
  eventBookingBg: string; // Booking event background
  eventServiceBg: string; // Service event background
  eventDefaultBg: string; // Default event background
  eventBorder: string; // Event border color

  // Error boundary colors
  errorBoundaryBg: string; // Error screen background
  errorBoundaryText: string; // Error screen text
  errorBoundaryError: string; // Error message color
  errorBoundaryButtonBg: string; // Button background
  errorBoundaryButtonText: string; // Button text

  [key: string]: string; // Allow additional custom colors
}

/**
 * Default Calendar Theme
 * Internal default theme that works out of the box
 * Uses exact color codes from CleanHaus design system
 */
export const DEFAULT_THEME: CalendarTheme = {
  // Entity colors - Using exact design system colors
  primary: "#5C75C1",
  primaryLight: "#6B68C1", // BLUE KEY 500 (Secondary6)
  secondary: "#F68F9F", // PINK KEY 500 (Secondary3)
  service: "#E6E489", // YELLOW KEY 500 (Secondary1)
  alert: "#FF4D59", // RED Alert2
  today: "#292846", // LAVENDER 800 (Primary)
  purple: "#292846", // LAVENDER 800 (Primary)

  // Text colors - GRAYS
  text: "#292846", // Primary Text
  textSecondary: "#252727", // Secondary Text

  // Background colors - BACKGROUND
  background: "#FCFCF6", // Main background

  // Border colors - GRAYS
  border: "#9493A3", // Border color (GRAYS KEY 500)
  borderLight: "#E5E7EB", // Line color

  // Status colors - Using design system semantic colors
  statusComplete: "#33E284", // GREEN Alert1 (Success)
  statusInProgress: "#8C88FF", // LAVENDER 500 (Primary Accent)
  statusScheduled: "#E2E0FA", // LAVENDER 100
  statusIssue: "#FF4D59", // RED Alert2

  // Alert colors - Using design system alert colors
  alertError: "#FF4D59", // RED Alert2
  alertWarning: "#FFB562", // ORANGE KEY 500 (Secondary2)

  // Event block colors - Using design system colors
  eventBookingBg: "#F3F2F9", // Light lavender (LAVENDER 100)
  eventServiceBg: "#FCFCF6", // Background
  eventDefaultBg: "#F3F2F9", // Light lavender
  eventBorder: "#E5E7EB", // Line color

  // Error boundary colors - Using design system colors
  errorBoundaryBg: "#FCFCF6", // Background
  errorBoundaryText: "#292846", // Primary text
  errorBoundaryError: "#FF4D59", // RED Alert2
  errorBoundaryButtonBg: "#292846", // Primary brand
  errorBoundaryButtonText: "#FFFFFF", // White
};

/**
 * Merge user theme with default theme
 * @param userTheme - Partial theme override from props
 * @returns Complete theme object
 */
export function mergeTheme(userTheme?: Partial<CalendarTheme>): CalendarTheme {
  const merged = { ...DEFAULT_THEME };

  if (userTheme) {
    Object.keys(userTheme).forEach((key) => {
      const value = userTheme[key as keyof CalendarTheme];
      if (value !== undefined) {
        merged[key as keyof CalendarTheme] = value;
      }
    });
  }

  return merged;
}

/**
 * Event Rendering Configuration
 * Defines how different event types should be rendered in the calendar
 * Based on event TYPE, not duration
 */
export interface EventRenderConfig {
  opacity: number; // Background opacity (0-1)
  showTitle: boolean; // Whether to show event title
  showArrow: boolean; // Whether to show arrow indicator
  showIcon: boolean; // Whether to show icon (for unassigned)
  showBorder: boolean; // Whether to show border
  titleOnFirstWeekOnly: boolean; // Show title only in first week (for multi-week spans)
}

const EVENT_RENDERING_CONFIG: Record<string, EventRenderConfig> = {
  // Property/Booking events: Subtle background with labels
  property: {
    opacity: 0.1, // Low opacity (subtle background)
    showTitle: true, // Show property name and details
    showArrow: true, // Show direction arrow indicator
    showIcon: false, // No icon
    showBorder: false, // No border
    titleOnFirstWeekOnly: true, // Avoid title repetition across weeks
  },

  // Cleaning events: Solid color blocks without text clutter
  cleaning: {
    opacity: 1.0, // Full opacity (highly visible)
    showTitle: false, // No text (cleaner look)
    showArrow: false, // No arrow (just solid bar)
    showIcon: false, // No icon
    showBorder: false, // No border
    titleOnFirstWeekOnly: false,
  },

  // Service events: Solid color blocks without text clutter
  service: {
    opacity: 1.0, // Full opacity (highly visible)
    showTitle: false, // No text (cleaner look)
    showArrow: false, // No arrow (just solid bar)
    showIcon: false, // No icon
    showBorder: false, // No border
    titleOnFirstWeekOnly: false,
  },

  // Other Service events: Solid yellow blocks
  otherService: {
    opacity: 1.0, // Full opacity (highly visible)
    showTitle: false, // No text (cleaner look)
    showArrow: false, // No arrow (just solid bar)
    showIcon: false, // No icon
    showBorder: false, // No border
    titleOnFirstWeekOnly: false,
  },

  // Unassigned/Gap alerts: Low opacity with border and icon
  unassigned: {
    opacity: 0.15, // Very low opacity (subtle red background)
    showTitle: true, // Show "unassigned" text when space available
    showArrow: false, // No arrow
    showIcon: true, // Show alert icon
    showBorder: true, // Show red border
    titleOnFirstWeekOnly: true, // Show title only in first week
  },

  // Default fallback for unknown types
  default: {
    opacity: 0.5,
    showTitle: true,
    showArrow: false,
    showIcon: false,
    showBorder: false,
    titleOnFirstWeekOnly: false,
  },
};

/**
 * Get rendering configuration for event based on its TYPE
 * This determines opacity, title visibility, arrows, etc.
 * @param event - The calendar event
 * @returns EventRenderConfig object with rendering rules
 */
export function getEventRenderingConfig(
  event: CalendarEvent
): EventRenderConfig {
  const eventType = event.meta?.type || "default";
  return EVENT_RENDERING_CONFIG[eventType] || EVENT_RENDERING_CONFIG.default;
}

/**
 * Get color for calendar event based on theme and event type
 * @param event - The calendar event
 * @param theme - The current theme
 * @param availableProperties - Optional array of properties for consistent coloring
 * @param propertyColors - Optional array of property colors to cycle through
 * @returns Color string for the event
 */
export function getCalendarEventColor(
  event: CalendarEvent,
  theme: CalendarTheme,
  availableProperties?: Array<{ id: number }>,
  propertyColors?: string[],
  propertyColorsDark?: string[]
): string {
  const eventType = event.meta?.type;
  const jobTypeId = event.meta?.jobTypeId;

  // Check for type-specific colors (keep existing logic for service/otherService without jobTypeId)
  if ((eventType === "service" || eventType === "otherService") && !jobTypeId) {
    return theme.service;
  }

  if (eventType === "unassigned") {
    return theme.alert;
  }

  // Property-based colors: use propertyColors array if available for cycling through all colors
  if (propertyColors && propertyColors.length > 0 && availableProperties) {
    const entityId = extractEntityId(event.eventId);

    if (entityId !== null) {
      const index = availableProperties.findIndex((p) => p.id === entityId);
      const colorIndex = index >= 0 ? index : entityId;

      // Use darker colors for non-cleaning jobs (jobTypeId 2, 3, 4)
      // Use regular colors for cleaning jobs (jobTypeId 1) or if no jobTypeId
      if (
        jobTypeId &&
        jobTypeId !== 1 &&
        propertyColorsDark &&
        propertyColorsDark.length > 0
      ) {
        return propertyColorsDark[colorIndex % propertyColorsDark.length];
      }

      return propertyColors[colorIndex % propertyColors.length];
    }
  }

  // Fallback to alternating primary/secondary for backward compatibility
  const entityId = extractEntityId(event.eventId) ?? 0;
  return entityId % 2 === 0 ? theme.primary : theme.secondary;
}

/**
 * Check if event spans multiple days (date boundaries)
 * NOTE: This is kept for backward compatibility but rendering logic
 * now uses TYPE-based approach via getEventRenderingConfig()
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const startDate = new Date(event.start).toDateString();
  const endDate = new Date(event.end).toDateString();
  return startDate !== endDate;
}

/**
 * Convert hex color to rgba with opacity
 * @param hexColor - Hex color string (e.g., "#00BCD4")
 * @param opacity - Opacity value (0-1)
 */
export function hexToRgba(hexColor: string, opacity: number): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get event background color with appropriate opacity
 * @param event - The calendar event
 * @param theme - The current theme
 * @param availableProperties - Optional array of properties for consistent coloring
 * @param propertyColors - Optional array of property colors to cycle through
 * @returns Background color with opacity
 */
export function getEventBackgroundColor(
  event: CalendarEvent,
  theme: CalendarTheme,
  availableProperties?: Array<{ id: number }>,
  propertyColors?: string[],
  propertyColorsDark?: string[]
): string {
  const baseColor = getCalendarEventColor(
    event,
    theme,
    availableProperties,
    propertyColors,
    propertyColorsDark
  );
  const renderConfig = getEventRenderingConfig(event);

  return hexToRgba(baseColor, renderConfig.opacity);
}
