"use client";

import React, { useState, useCallback } from "react";
import {
  Calendar,
  CalendarEvent,
  ViewMode,
} from "@khalid-sohaib/calendar";
import { CalendarHeader } from "./CalendarHeader";

// Type assertion for React 18/19 FC compatibility with the library's exported component
const CalendarView = Calendar as React.ElementType;

// January 2026: 3 multi-day bookings per property, cleaning between bookings where scheduled, unassigned in gaps with no cleaning.
const sampleEvents: CalendarEvent[] = [
  // --- Property 1 (Beach House): 3 bookings, cleaning between 1→2, unassigned between 2→3 ---
  { id: "p1-b1", eventId: "property-1", title: "Booking", start: new Date(2026, 0, 2, 14, 0), end: new Date(2026, 0, 6, 10, 0), meta: { type: "property" } },
  { id: "p1-c1", eventId: "property-1", title: "Cleaning", start: new Date(2026, 0, 6, 10, 0), end: new Date(2026, 0, 6, 13, 0), meta: { type: "cleaning", status: "complete" } },
  { id: "p1-b2", eventId: "property-1", title: "Booking", start: new Date(2026, 0, 6, 15, 0), end: new Date(2026, 0, 10, 11, 0), meta: { type: "property" } },
  { id: "p1-u1", eventId: "property-1", title: "Unassigned", start: new Date(2026, 0, 10, 11, 0), end: new Date(2026, 0, 11, 14, 0), meta: { type: "unassigned" } },
  { id: "p1-b3", eventId: "property-1", title: "Booking", start: new Date(2026, 0, 11, 14, 0), end: new Date(2026, 0, 15, 10, 0), meta: { type: "property" } },
  // --- Property 2 (Mountain Cabin): 3 bookings, cleaning between each ---
  { id: "p2-b1", eventId: "property-2", title: "Booking", start: new Date(2026, 0, 3, 15, 0), end: new Date(2026, 0, 7, 11, 0), meta: { type: "property" } },
  { id: "p2-c1", eventId: "property-2", title: "Cleaning", start: new Date(2026, 0, 7, 11, 0), end: new Date(2026, 0, 7, 14, 0), meta: { type: "cleaning", status: "scheduled" } },
  { id: "p2-b2", eventId: "property-2", title: "Booking", start: new Date(2026, 0, 7, 16, 0), end: new Date(2026, 0, 11, 12, 0), meta: { type: "property" } },
  { id: "p2-c2", eventId: "property-2", title: "Cleaning", start: new Date(2026, 0, 11, 12, 0), end: new Date(2026, 0, 11, 15, 0), meta: { type: "cleaning", status: "inProgress" } },
  { id: "p2-b3", eventId: "property-2", title: "Booking", start: new Date(2026, 0, 11, 17, 0), end: new Date(2026, 0, 15, 13, 0), meta: { type: "property" } },
  // --- Property 3 (City Apartment): 3 bookings, unassigned between 1→2, cleaning between 2→3 ---
  { id: "p3-b1", eventId: "property-3", title: "Booking", start: new Date(2026, 0, 4, 10, 0), end: new Date(2026, 0, 8, 10, 0), meta: { type: "property" } },
  { id: "p3-u1", eventId: "property-3", title: "Unassigned", start: new Date(2026, 0, 8, 10, 0), end: new Date(2026, 0, 9, 14, 0), meta: { type: "unassigned" } },
  { id: "p3-b2", eventId: "property-3", title: "Booking", start: new Date(2026, 0, 9, 14, 0), end: new Date(2026, 0, 13, 10, 0), meta: { type: "property" } },
  { id: "p3-c1", eventId: "property-3", title: "Cleaning", start: new Date(2026, 0, 13, 10, 0), end: new Date(2026, 0, 13, 13, 0), meta: { type: "cleaning", status: "complete" } },
  { id: "p3-b3", eventId: "property-3", title: "Booking", start: new Date(2026, 0, 13, 15, 0), end: new Date(2026, 0, 17, 11, 0), meta: { type: "property" } },
  // --- Property 4 (Lakeside Villa): 3 bookings, cleaning between 1→2, unassigned between 2→3 ---
  { id: "p4-b1", eventId: "property-4", title: "Booking", start: new Date(2026, 0, 1, 14, 0), end: new Date(2026, 0, 5, 10, 0), meta: { type: "property" } },
  { id: "p4-c1", eventId: "property-4", title: "Cleaning", start: new Date(2026, 0, 5, 10, 0), end: new Date(2026, 0, 5, 13, 0), meta: { type: "cleaning", status: "scheduled" } },
  { id: "p4-b2", eventId: "property-4", title: "Booking", start: new Date(2026, 0, 5, 15, 0), end: new Date(2026, 0, 9, 11, 0), meta: { type: "property" } },
  { id: "p4-u1", eventId: "property-4", title: "Unassigned", start: new Date(2026, 0, 9, 11, 0), end: new Date(2026, 0, 10, 12, 0), meta: { type: "unassigned" } },
  { id: "p4-b3", eventId: "property-4", title: "Booking", start: new Date(2026, 0, 10, 14, 0), end: new Date(2026, 0, 14, 10, 0), meta: { type: "property" } },
];

const availableProperties = [
  { id: 1, name: "Beach House" },
  { id: 2, name: "Mountain Cabin" },
  { id: 3, name: "City Apartment" },
  { id: 4, name: "Lakeside Villa" },
  { id: 5, name: "Downtown Loft" },
  { id: 6, name: "Garden Cottage" },
];

const propertiesToShow = [
  { id: 1, name: "Beach House" },
  { id: 2, name: "Mountain Cabin" },
  { id: 3, name: "City Apartment" },
  { id: 4, name: "Lakeside Villa" },
];


export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("month");
  const [date, setDate] = useState(new Date(2026, 0, 1)); // January 2026 to match sample events

  const handleDateTimeChange = useCallback((dateTime: Date) => {
    setView("day");
    setDate(dateTime);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
      }}
    >
      <CalendarHeader
        date={date}
        view={view}
        onDateChange={setDate}
        onViewChange={setView}
      />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, minHeight: 0, height: "100%" }}>
          <CalendarView
            events={sampleEvents}
            view={view}
            date={date}
            onDateChange={setDate}
            onViewChange={setView}
            onEventPress={(event: CalendarEvent) => {
              alert(`Event: ${event.title}\n${event.start.toLocaleString()} – ${event.end.toLocaleString()}`);
            }}
            onDateTimeChange={handleDateTimeChange}
            theme={{
              today: "#1a1a2e",
              primary: "#4f46e5",
            }}
            availableProperties={availableProperties}
            propertiesToShow={propertiesToShow}
            autoScrollToNow={view === "day"}
            showFAB
            onFABPress={() => alert("FAB pressed")}
          />
        </div>
      </div>
    </div>
  );
}
