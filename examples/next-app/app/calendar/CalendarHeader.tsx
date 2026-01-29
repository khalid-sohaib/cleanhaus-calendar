"use client";

import React from "react";
import { getDateLabel } from "@khalid-sohaib/calendar";
import type { ViewMode } from "@khalid-sohaib/calendar";
import dayjs from "dayjs";

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
  flexShrink: 0,
};

const navGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: 14,
  fontWeight: 500,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  backgroundColor: "#fff",
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: "#111827",
  minWidth: 200,
  textAlign: "center",
};

const viewButtonStyle = (active: boolean): React.CSSProperties => ({
  ...buttonStyle,
  backgroundColor: active ? "#4f46e5" : "#fff",
  color: active ? "#fff" : "#374151",
  borderColor: active ? "#4f46e5" : "#d1d5db",
});

export interface CalendarHeaderProps {
  date: Date;
  view: ViewMode;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewMode) => void;
}

function navigateDate(
  currentDate: Date,
  direction: "prev" | "next",
  viewMode: ViewMode
): Date {
  if (viewMode === "day") {
    return dayjs(currentDate).add(direction === "next" ? 1 : -1, "day").toDate();
  }
  if (viewMode === "week") {
    return dayjs(currentDate).add(direction === "next" ? 7 : -7, "day").toDate();
  }
  return dayjs(currentDate)
    .add(direction === "next" ? 1 : -1, "month")
    .toDate();
}

export function CalendarHeader({
  date,
  view,
  onDateChange,
  onViewChange,
}: CalendarHeaderProps) {
  const handlePrev = () => onDateChange(navigateDate(date, "prev", view));
  const handleNext = () => onDateChange(navigateDate(date, "next", view));
  const handleToday = () => onDateChange(new Date());

  return (
    <header style={headerStyle}>
      <div style={navGroupStyle}>
        <button type="button" style={buttonStyle} onClick={handlePrev} aria-label="Previous">
          ‹ Prev
        </button>
        <button type="button" style={buttonStyle} onClick={handleNext} aria-label="Next">
          Next ›
        </button>
        <button type="button" style={buttonStyle} onClick={handleToday} aria-label="Today">
          Today
        </button>
      </div>
      <div style={labelStyle}>{getDateLabel(date, view)}</div>
      <div style={navGroupStyle}>
        {(["month", "week", "day"] as const).map((v) => (
          <button
            key={v}
            type="button"
            style={viewButtonStyle(view === v)}
            onClick={() => onViewChange(v)}
            aria-label={`View ${v}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </header>
  );
}
