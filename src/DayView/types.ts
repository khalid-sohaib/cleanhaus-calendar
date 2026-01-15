import { CalendarEvent } from "../types";

/**
 * Property group interface for DayView
 */
export interface PropertyGroup {
  propertyId: number;
  propertyName: string;
  events: CalendarEvent[];
}

/**
 * Scroll event handler type
 */
export type ScrollEventHandler = (event: any) => void;
