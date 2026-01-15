import { CalendarEvent } from "../types";
import { CalendarTheme } from "../utils/theme";

/**
 * WeekView-specific types
 */

export interface WeekViewProps {
  events: CalendarEvent[];
  targetDate: Date;
  onEventPress: (event: CalendarEvent) => void;
  onShowMore?: (date: Date) => void; // Callback when "+X more" is clicked
  onPressCell?: (date: Date, time: Date) => void; // Callback when day cell is clicked with calculated time
  theme: CalendarTheme;
  availableProperties?: Array<{ id: number; name?: string }>;
  propertyColors?: string[]; // Optional: custom property colors array
  propertyColorsDark?: string[]; // Optional: custom dark property colors array
}

export interface PropertyIndicatorData {
  propertyName: string;
  propertyId: string;
  startDay: number; // 0-6 (Sunday to Saturday)
  endDay: number;
  color: string;
}

export interface DaySlotData {
  hour: number;
  events: CalendarEvent[];
  overflow: number;
}

export interface DayColumnData {
  date: Date;
  dayIndex: number; // 0-6
  slots: DaySlotData[];
}
