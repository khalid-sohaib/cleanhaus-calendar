# cleanhaus-calendar

A production-ready, cross-platform calendar component for React Native and Next.js. Features Month, Week, and Day views with horizontal time positioning and multi-day event spanning.

## 🚀 Platform Support

- ✅ **React Native** (iOS/Android)
- ✅ **Next.js** (Web with react-native-web)

## 📦 Installation

```bash
npm install cleanhaus-calendar
```

### Peer Dependencies

```bash
npm install react react-native react-native-web react-native-reanimated dayjs calendarize
```

**Requirements:**
- `react`: >=18.0.0 (supports React 18 & 19)
- `react-native`: >=0.70.0
- `react-native-web`: >=0.19.0
- `react-native-reanimated`: >=3.0.0
- `dayjs`: ^1.11.0
- `calendarize`: ^1.1.0
- `node`: >=18.0.0

## ⚙️ Setup

### React Native (Expo/RN)

No additional configuration needed! Just install and use:

```tsx
import { Calendar, CalendarEvent } from "cleanhaus-calendar";

const events: CalendarEvent[] = [
  {
    id: "1",
    eventId: "property-1",
    title: "Booking",
    start: new Date(2025, 0, 15, 10, 0),
    end: new Date(2025, 0, 20, 14, 0),
    meta: { type: "property" },
  },
];

<Calendar
  events={events}
  view="month"
  date={new Date()}
  onDateChange={setDate}
  onEventPress={(event) => console.log(event)}
/>
```

### Next.js Setup

**1. Install dependencies:**
```bash
npm install cleanhaus-calendar react react-native react-native-web react-native-reanimated dayjs calendarize
```

**2. Update `next.config.ts`:**
```typescript
import type { NextConfig } from "next";

const withCalendar = require("cleanhaus-calendar/next-plugin");

const nextConfig: NextConfig = {
  // Your existing config
};

export default withCalendar(nextConfig);
```

**3. Update `package.json` dev script (Next.js 16+):**
```json
{
  "scripts": {
    "dev": "next dev --webpack"
  }
}
```

**4. Use the component:**
```tsx
"use client"; // Required for App Router

import { Calendar, CalendarEvent } from "cleanhaus-calendar";
import { useState } from "react";

export default function MyPage() {
  const [view, setView] = useState<ViewMode>("month");
  const [date, setDate] = useState(new Date());

  return (
    <Calendar
      events={events}
      view={view}
      date={date}
      onDateChange={setDate}
      onEventPress={(event) => console.log(event)}
      onViewChange={setView}
    />
  );
}
```

**Note:** Next.js 16+ uses Turbopack by default. The plugin requires webpack, so use `--webpack` flag.

## 📖 Usage

### Basic Example

```tsx
import { Calendar, CalendarEvent, ViewMode } from "cleanhaus-calendar";
import { useState } from "react";

const events: CalendarEvent[] = [
  {
    id: "1",
    eventId: "property-1",
    title: "Booking",
    start: new Date(2025, 0, 15, 10, 0),
    end: new Date(2025, 0, 20, 14, 0),
    meta: { type: "property" },
  },
];

function MyCalendar() {
  const [view, setView] = useState<ViewMode>("month");
  const [date, setDate] = useState(new Date());

  return (
    <Calendar
      events={events}
      view={view}
      date={date}
      onDateChange={setDate}
      onEventPress={(event) => console.log(event)}
      onViewChange={setView}
    />
  );
}
```

### Custom Cleaning Icon

The package includes a default sparkle icon (✨) for cleaning events. Override it:

```tsx
import sparksIcon from "./assets/sparks.png";

<Calendar
  events={events}
  cleaningIcon={sparksIcon} // Optional: custom icon
  // ... other props
/>
```

## 🔄 Data Format

Events must follow this structure:

```typescript
interface CalendarEvent {
  id: string;              // Required: Unique identifier
  eventId: string;         // Required: Group identifier (e.g., "property-1")
  title: string;           // Required: Event title
  start: Date;             // Required: Must be Date object (not string!)
  end: Date;               // Required: Must be Date object (not string!)
  meta?: {
    type?: "property" | "cleaning" | "service" | "otherService" | "unassigned";
    jobTypeId?: number;    // For cleaning: 1 = cleaning, 2-4 = service types
    [key: string]: any;
  };
}
```

### Transform API Data

```typescript
// Transform API response to CalendarEvent format
function transformApiEvents(apiData: ApiEvent[]): CalendarEvent[] {
  return apiData.map((item) => ({
    id: item.id.toString(),
    eventId: `entity-${item.entityId}`,
    title: item.name,
    start: new Date(item.startTime),  // Convert ISO string to Date
    end: new Date(item.endTime),      // Convert ISO string to Date
    meta: {
      type: item.type as CalendarEvent["meta"]["type"],
    },
  }));
}
```

**Important:** Always convert date strings to `Date` objects. The component does not accept string dates.

## 🎯 Key Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `events` | `CalendarEvent[]` | Yes | Array of events |
| `view` | `"month" \| "week" \| "day"` | No | View mode (default: `"month"`) |
| `date` | `Date` | Yes | Current date/month |
| `onDateChange` | `(date: Date) => void` | Yes | Date navigation handler |
| `onEventPress` | `(event: CalendarEvent) => void` | Yes | Event press handler |
| `onViewChange` | `(view: ViewMode) => void` | No | View mode change handler |
| `cleaningIcon` | `any` | No | Custom icon for cleaning events |
| `theme` | `CalendarTheme` | No | Custom theme |
| `availableProperties` | `Property[]` | No | Properties for color assignment |

See [full props reference](#props-reference) below.

## 🎨 Features

- **Month View**: Calendar grid with event bars and swipe navigation
- **Week View**: 7-day view with time-based positioning
- **Day View**: Single-day view with property lanes
- **Multi-day Events**: Continuous bars across day cells
- **Type-based Rendering**: Different styles for property, cleaning, service events
- **Built-in Assets**: Default sparkle icon (✨) for cleaning events

## 🐛 Troubleshooting

### Events not appearing
- ✅ Ensure `start` and `end` are `Date` objects (not strings)
- ✅ Check `eventId` is set correctly
- ✅ Verify `containerHeight` is sufficient (minimum 400px)

### Next.js Issues

**Module not found:**
- ✅ Restart dev server: `npm run dev -- --webpack`
- ✅ Clear cache: `rm -rf .next`

**Element type is invalid:**
- ✅ Ensure `--webpack` flag is used
- ✅ Verify `react-native-web` is installed

**Turbopack error:**
- ✅ Use `npm run dev -- --webpack`
- ✅ Or add `turbopack: {}` to `next.config.ts`

## 📚 Props Reference

### Calendar Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `events` | `CalendarEvent[]` | Yes | - | Array of events |
| `view` | `ViewMode` | No | `"month"` | View mode |
| `date` | `Date` | Yes | - | Current date |
| `onDateChange` | `(date: Date) => void` | Yes | - | Date change handler |
| `onEventPress` | `(event: CalendarEvent) => void` | Yes | - | Event press handler |
| `onViewChange` | `(view: ViewMode) => void` | No | - | View change handler |
| `isLoading` | `boolean` | No | `false` | Show loading spinner |
| `theme` | `CalendarTheme` | No | - | Custom theme |
| `availableProperties` | `Property[]` | No | - | Properties for colors |
| `cleaningIcon` | `any` | No | - | Custom cleaning icon |
| `showFAB` | `boolean` | No | `false` | Show floating action button |
| `autoScrollToNow` | `boolean` | No | `false` | Auto-scroll to current time |

## 📄 License

MIT

---

**Version**: 1.0.0
