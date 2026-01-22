// Simplified Calendar Types
export type ViewMode = "day" | "week" | "month";

// Simple calendar event structure
export interface CalendarEvent {
  id: string;
  eventId: string;
  title: string;
  start: Date;
  end: Date;
  meta?: {
    type?: "property" | "cleaning" | "service" | "otherService" | "unassigned";
    source?: string;
    status?: string;
    color?: string;
    [key: string]: any; // Allow additional properties
  };
}

// Calendar component props
export interface CalendarProps {
  events: CalendarEvent[];
  view?: ViewMode;
  date: Date;
  onDateChange: (date: Date) => void;
  onEventPress: (event: CalendarEvent) => void;
  onViewChange?: (view: ViewMode) => void; // Optional: called when view needs to change
  onDateTimeChange?: (dateTime: Date) => void; // Optional: unified handler for date+time changes that navigates to day view
  isLoading?: boolean; // Optional: loading state for API data
  availableProperties?: Array<{ id: number }>; // Optional: for consistent property colors
  propertiesToShow?: Array<{ id: number; name?: string }>; // Optional: properties to show in DayView lanes
  theme?: Partial<import("./utils/theme").CalendarTheme>; // Optional: theme override
  autoScrollToNow?: boolean; // Optional: auto-scroll day view to current time
  propertyColors?: string[]; // Optional: custom property colors array (defaults to built-in colors)
  propertyColorsDark?: string[]; // Optional: custom dark property colors array (defaults to built-in colors)

  // FAB props
  showFAB?: boolean; // Optional: whether to show the FAB
  onFABPress?: () => void; // Optional: FAB press handler
  fabStyle?: {
    [key: string]: any;
  }; // Optional: Customize FAB styles (size, colors, position, etc.) - matches react-native ViewStyle
  renderFAB?: () => React.ReactElement | null; // Optional: FAB component renderer (for custom FAB components)
  
  // Icon props
  cleaningIcon?: any; // Optional: custom cleaning icon (Image source) for cleaning events in MonthView
}
