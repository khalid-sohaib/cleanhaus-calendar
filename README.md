# @cleanhaus/calendar

Cross-platform calendar component for React Native and Next.js with Month, Week, and Day views. Features horizontal time positioning, multi-day event spanning, and type-based event rendering.

## Installation

### Setup GitHub Packages Authentication

This package is published to GitHub Packages. You need to configure authentication before installing.

**1. Create a GitHub Personal Access Token (PAT):**
- Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate a new token with `read:packages` scope
- Copy the token (you won't see it again)

**2. Configure npm authentication:**

Create a `.npmrc` file in your project root:

```
@cleanhaus:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GH_PACKAGES_TOKEN}
```

**3. Set the environment variable:**

**For Next.js:**
Add to your `.env.local` file:
```
GH_PACKAGES_TOKEN=your_token_here
```

**For React Native:**
Export in your shell or add to your environment:
```bash
export GH_PACKAGES_TOKEN=your_token_here
```

**4. Install the package:**

```bash
npm install @cleanhaus/calendar
```

### Peer Dependencies

```bash
npm install react react-native react-native-web react-native-reanimated dayjs calendarize
```

**Compatibility:**
- React >=18.0.0
- React Native >=0.70.0
- react-native-web >=0.19.0 (optional, for web)
- react-native-reanimated >=3.0.0
- dayjs ^1.11.0
- calendarize ^1.1.0
- Node >=18.0.0

## Quick Start

### React Native

No additional configuration needed. Install and use:

```tsx
import { Calendar, CalendarEvent } from "@cleanhaus/calendar";
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

function App() {
  const [date, setDate] = useState(new Date());

  return (
    <Calendar
      events={events}
      view="month"
      date={date}
      onDateChange={setDate}
      onEventPress={(event) => {
        // Handle event press
      }}
    />
  );
}
```

### Next.js

**1. Configure Next.js:**

```typescript
// next.config.ts
import type { NextConfig } from "next";

const withCalendar = require("@cleanhaus/calendar/next-plugin");

const nextConfig: NextConfig = {
  // Your existing config
};

export default withCalendar(nextConfig);
```

**2. Development (Next.js 16+):**

Next.js 16+ uses Turbopack by default for development, but this package requires webpack configuration. Use the `--webpack` flag during development:

```json
{
  "scripts": {
    "dev": "next dev --webpack"
  }
}
```

**Note:** Production builds automatically use webpack, so no additional configuration is needed for deployment.

**3. Layout Requirements:**

The Calendar component requires its parent container to have explicit `height` and `width` defined. This ensures proper sizing and prevents layout issues, especially on web platforms.

**For Web (Next.js/React):**
```tsx
// Option 1: Full viewport height
<div style={{ height: "100vh", width: "100%" }}>
  <Calendar {...props} />
</div>

// Option 2: Fixed height
<div style={{ height: "600px", width: "100%" }}>
  <Calendar {...props} />
</div>

// Option 3: Flex container (parent must have height)
<div style={{ display: "flex", height: "100vh" }}>
  <div style={{ flex: 1 }}>
    <Calendar {...props} />
  </div>
</div>
```

**For React Native:**
```tsx
// Typically works automatically with flex: 1
<View style={{ flex: 1 }}>
  <Calendar {...props} />
</View>
```

**4. Use the component:**

```tsx
"use client";

import { Calendar, CalendarEvent, ViewMode } from "@cleanhaus/calendar";
import { useState } from "react";

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("month");
  const [date, setDate] = useState(new Date());

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

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Calendar
        events={events}
        view={view}
        date={date}
        onDateChange={setDate}
        onViewChange={setView}
        onEventPress={(event) => {
          // Handle event press
        }}
      />
    </div>
  );
}
```

## Data Format

Events must follow this structure:

```typescript
interface CalendarEvent {
  id: string;              // Unique identifier
  eventId: string;         // Group identifier (e.g., "property-1")
  title: string;           // Event title
  start: Date;             // Start date/time (must be Date object)
  end: Date;               // End date/time (must be Date object)
  meta?: {
    type?: "property" | "cleaning" | "service" | "otherService" | "unassigned";
    [key: string]: any;
  };
}
```

**Important:** Always convert date strings to `Date` objects. The component does not accept string dates.

### Transforming API Data

```typescript
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

### Using with Properties

```typescript
const properties = [
  { id: 1, name: "Beach House" },
  { id: 2, name: "Mountain Cabin" },
];

<Calendar
  events={events}
  date={date}
  availableProperties={properties}  // Recommended for DayView
  onDateChange={setDate}
  onEventPress={handleEventPress}
/>
```

## API Reference

### Calendar Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `events` | `CalendarEvent[]` | Yes | - | Array of events to display |
| `date` | `Date` | Yes | - | Current date/month |
| `onDateChange` | `(date: Date) => void` | Yes | - | Called when date changes |
| `onEventPress` | `(event: CalendarEvent) => void` | Yes | - | Called when event is pressed |
| `view` | `"month" \| "week" \| "day"` | No | `"month"` | View mode |
| `onViewChange` | `(view: ViewMode) => void` | No | - | Called when view mode changes |
| `onDateTimeChange` | `(dateTime: Date) => void` | No | - | Unified handler for date+time changes (navigates to day view) |
| `isLoading` | `boolean` | No | `false` | Show loading spinner |
| `theme` | `Partial<CalendarTheme>` | No | - | Custom theme override |
| `availableProperties` | `Array<{ id: number; name?: string }>` | No | `[]` | All properties in your system. Determines DayView lanes (shows even if empty) and ensures consistent colors. |
| `propertiesToShow` | `Array<{ id: number; name?: string }>` | No | - | Subset of `availableProperties` to show in DayView. Omit to show all. |
| `propertyColors` | `string[]` | No | - | Custom property colors array |
| `propertyColorsDark` | `string[]` | No | - | Custom dark property colors array |
| `cleaningIcon` | `any` | No | - | Custom icon for cleaning events |
| `showFAB` | `boolean` | No | `false` | Show floating action button |
| `onFABPress` | `() => void` | No | - | FAB press handler |
| `fabStyle` | `ViewStyle` | No | - | Custom FAB styles |
| `renderFAB` | `() => React.ReactElement \| null` | No | - | Custom FAB component renderer |
| `autoScrollToNow` | `boolean` | No | `false` | Auto-scroll to current time in day view |

### Exports

- `Calendar` - Main calendar component
- `CalendarEvent` - Event type
- `ViewMode` - View mode type (`"day" | "week" | "month"`)
- `MonthView`, `WeekView`, `DayView` - Individual view components
- `CalendarFAB` - Floating action button component
- Utilities: `dateUtils`, `weekDayUtils`, `theme`, `propertyColors`
- Hooks: `useSwipeGesture`

## Features

- **Month View**: Calendar grid with event bars and swipe navigation
- **Week View**: 7-day view with time-based positioning
- **Day View**: Single-day view with property lanes, sticky headers, and synchronized horizontal scrolling
- **Multi-day Events**: Continuous bars across day cells
- **Type-based Rendering**: Different styles for different event types
- **Theme Customization**: Customizable colors and styles
- **Cross-platform**: Works on React Native (iOS/Android) and Web (Next.js)
- **SSR-safe**: Prevents hydration errors automatically
- **Sticky Headers**: Property headers stay visible while scrolling vertically in Day View

## Troubleshooting

**Events not appearing:**
- Ensure `start` and `end` are `Date` objects (not strings)
- Verify `eventId` is set correctly
- Check that events fall within the visible date range

**Next.js issues:**
- Use `--webpack` flag for development: `npm run dev -- --webpack`
- Clear Next.js cache: `rm -rf .next`
- Ensure `react-native-web` is installed
- Verify the plugin is correctly applied in `next.config.ts`

**Layout and sizing issues:**
- **Calendar not sizing correctly on web**: Ensure the parent container has explicit `height` and `width` defined (e.g., `height: "100vh"` or `height: "600px"`)
- **Vertical scrolling in month view**: The parent container must have a constrained height for the calendar to calculate proper dimensions
- **Calendar appears too small or too large**: Adjust the parent container's height to control the calendar size

**Module not found errors:**
- Restart the development server
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## License

MIT

## Links

- [Repository](https://github.com/cleanhaus/calendar-component)
- [Issues](https://github.com/cleanhaus/calendar-component/issues)
