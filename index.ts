// Calendar Package - Core calendar components only
export { CustomCalendar as Calendar } from "./Calendar";
export { MonthView } from "./MonthView";
export type { MonthViewProps } from "./MonthView/types";
export { DayView } from "./DayView";
export type { DayViewProps } from "./DayView";
export { WeekView } from "./WeekView";
export type { WeekViewProps } from "./WeekView/types";
export { CalendarFAB } from "./CalendarFAB";
export type { CalendarFABProps } from "./CalendarFAB";
export * from "./types";

// Utilities
export * from "./utils/dateUtils";
export * from "./utils/weekDayUtils";
export * from "./utils/theme";
export * from "./utils/propertyColors";

// Hooks
export { useSwipeGesture } from "./hooks";
export type { SwipeGestureConfig } from "./hooks";
