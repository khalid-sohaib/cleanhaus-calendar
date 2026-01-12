# Calendar Component Library

A production-ready, cross-platform calendar component for React Native, React, and Next.js. Features custom Month, Week, and Day views with horizontal time positioning and multi-day event spanning.

## 🚀 Platform Support

- ✅ **React Native** (iOS/Android)
- ✅ **React** (Web with react-native-web)
- ✅ **Next.js** (Web with react-native-web)

## 📦 Installation

```bash
npm install @cleanhaus/calendar
```

### Peer Dependencies

```bash
npm install react react-native react-native-web react-native-reanimated dayjs calendarize
```

**Minimum Versions:**
- `react`: >=18.0.0
- `react-native`: >=0.70.0
- `react-native-web`: >=0.19.0
- `react-native-reanimated`: >=3.0.0
- `dayjs`: ^1.11.0
- `calendarize`: ^1.1.0

## ⚙️ Next.js Setup

### Quick Setup (Recommended)

**1. Install dependencies:**
```bash
npm install @cleanhaus/calendar react react-native react-native-web react-native-reanimated dayjs calendarize
```

**2. Update `next.config.js`:**
```javascript
const withCalendar = require('@cleanhaus/calendar/next-plugin');

module.exports = withCalendar({
  // Your existing Next.js config
});
```

**3. Use the component:**
```tsx
import { Calendar } from '@cleanhaus/calendar';

export default function MyPage() {
  return <Calendar events={events} date={new Date()} onDateChange={setDate} />;
}
```

The plugin automatically handles React Native Web aliasing, package transpilation, and webpack configuration.

### Manual Setup

If you prefer manual configuration:

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    };
    return config;
  },
  transpilePackages: ['@cleanhaus/calendar'],
};
```

## 📖 Usage

### Basic Calendar

```tsx
import { Calendar, CalendarEvent } from "@cleanhaus/calendar";

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

### Month View Only

```tsx
import { MonthView } from "@cleanhaus/calendar";

<MonthView
  events={events}
  targetDate={new Date()}
  containerHeight={600}
  onPressEvent={(event) => console.log(event)}
  onPressCell={(date) => console.log(date)}
  maxVisibleRows={3}
/>
```

## 🔄 Data Transformation

**Important**: The Calendar component expects events in a specific format. You **must** transform your API data before passing it to the component. The component does not automatically normalize or transform data.

### Required Format

All events must conform to the `CalendarEvent` interface:

```typescript
interface CalendarEvent {
  id: string;              // Required: Unique event identifier
  eventId: string;         // Required: Group identifier (e.g., "property-1")
  title: string;           // Required: Event title
  start: Date;             // Required: Must be Date object, not string
  end: Date;               // Required: Must be Date object, not string
  meta?: {                 // Optional: Event metadata
    type?: "property" | "cleaning" | "service" | "otherService" | "unassigned";
    [key: string]: any;
  };
}
```

### Example Transformation

```typescript
import { Calendar, CalendarEvent } from "@cleanhaus/calendar";

// Your API data structure
interface ApiEvent {
  id: number;
  entityId: number;
  name: string;
  startTime: string;  // ISO string from API
  endTime: string;    // ISO string from API
  type: string;
  // ... other fields
}

// Transform function
function transformApiEvents(apiData: ApiEvent[]): CalendarEvent[] {
  return apiData.map((item) => ({
    id: item.id.toString(),
    eventId: `entity-${item.entityId}`,  // Convert to required format
    title: item.name,
    start: new Date(item.startTime),      // Convert ISO string to Date
    end: new Date(item.endTime),          // Convert ISO string to Date
    meta: {
      type: item.type as CalendarEvent["meta"]["type"],
      // ... other metadata
    },
  }));
}

// Use in component
function MyCalendar() {
  const [apiData, setApiData] = useState<ApiEvent[]>([]);
  const [date, setDate] = useState(new Date());

  // Transform API data to CalendarEvent format
  const events = useMemo(() => transformApiEvents(apiData), [apiData]);

  return (
    <Calendar
      events={events}  // Pass transformed events
      date={date}
      onDateChange={setDate}
      onEventPress={(event) => console.log(event)}
    />
  );
}
```

### Common Pitfalls

#### ❌ Dates as Strings

**Problem**: APIs often return dates as ISO strings, but the component requires `Date` objects.

```typescript
// ❌ WRONG: Passing string dates
const events = [
  {
    id: "1",
    eventId: "property-1",
    title: "Booking",
    start: "2025-01-15T10:00:00Z",  // String - will cause errors
    end: "2025-01-20T14:00:00Z",    // String - will cause errors
  },
];

// ✅ CORRECT: Convert to Date objects
const events = [
  {
    id: "1",
    eventId: "property-1",
    title: "Booking",
    start: new Date("2025-01-15T10:00:00Z"),  // Date object
    end: new Date("2025-01-20T14:00:00Z"),    // Date object
  },
];
```

**Solution**: Always convert date strings to `Date` objects:

```typescript
function transformDates(apiEvent: ApiEvent): CalendarEvent {
  return {
    // ... other fields
    start: new Date(apiEvent.startTime),  // Convert string to Date
    end: new Date(apiEvent.endTime),      // Convert string to Date
  };
}
```

#### ❌ Missing Required Fields

**Problem**: Missing `id`, `eventId`, or `title` will cause rendering issues.

```typescript
// ❌ WRONG: Missing required fields
const events = [
  {
    // id missing
    // eventId missing
    title: "Booking",
    start: new Date(),
    end: new Date(),
  },
];

// ✅ CORRECT: All required fields present
const events = [
  {
    id: "1",                    // Required
    eventId: "property-1",      // Required
    title: "Booking",           // Required
    start: new Date(),
    end: new Date(),
  },
];
```

**Solution**: Ensure all required fields are present in your transformer:

```typescript
function transformApiEvents(apiData: ApiEvent[]): CalendarEvent[] {
  return apiData.map((item) => {
    // Validate required fields
    if (!item.id || !item.entityId || !item.name) {
      console.warn("Skipping event with missing required fields:", item);
      return null;
    }

    return {
      id: item.id.toString(),           // Ensure id exists
      eventId: `entity-${item.entityId}`, // Ensure eventId exists
      title: item.name || "Untitled",     // Ensure title exists
      start: new Date(item.startTime),
      end: new Date(item.endTime),
    };
  }).filter((event): event is CalendarEvent => event !== null);
}
```

#### ❌ Invalid Date Objects

**Problem**: Creating `Date` objects from invalid strings results in `Invalid Date`.

```typescript
// ❌ WRONG: Invalid date string
const start = new Date("invalid-date-string");  // Invalid Date
console.log(start.getTime());  // NaN

// ✅ CORRECT: Validate dates
function ensureValidDate(value: string | Date): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
}

// Use in transformer
const start = ensureValidDate(apiEvent.startTime);
```

#### ❌ Wrong eventId Format

**Problem**: `eventId` must be a string in the format `"entity-{id}"` or `"property-{id}"` for proper grouping.

```typescript
// ❌ WRONG: Numeric or wrong format
eventId: 123                    // Number - should be string
eventId: "property1"            // Missing hyphen

// ✅ CORRECT: Proper format
eventId: "entity-123"           // Correct format
eventId: "property-456"         // Also valid
```

**Solution**: Format `eventId` consistently in your transformer:

```typescript
function transformApiEvents(apiData: ApiEvent[]): CalendarEvent[] {
  return apiData.map((item) => ({
    // ... other fields
    eventId: `entity-${item.entityId}`,  // Consistent format
  }));
}
```

### Best Practices

1. **Transform at the data layer**: Create a dedicated transformer function that converts API data to `CalendarEvent[]`
2. **Validate dates**: Always check if dates are valid before using them
3. **Handle errors**: Filter out invalid events rather than crashing
4. **Use TypeScript**: Leverage TypeScript types to catch errors at compile time
5. **Memoize transformations**: Use `useMemo` to avoid re-transforming on every render

```typescript
// Example with error handling and memoization
function useCalendarEvents(apiData: ApiEvent[] | undefined) {
  return useMemo(() => {
    if (!apiData) return [];

    return apiData
      .map((item) => {
        try {
          const start = new Date(item.startTime);
          const end = new Date(item.endTime);

          // Validate dates
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn("Invalid date in event:", item);
            return null;
          }

          // Validate required fields
          if (!item.id || !item.entityId || !item.name) {
            console.warn("Missing required fields in event:", item);
            return null;
          }

          return {
            id: item.id.toString(),
            eventId: `entity-${item.entityId}`,
            title: item.name,
            start,
            end,
            meta: {
              type: item.type as CalendarEvent["meta"]["type"],
            },
          };
        } catch (error) {
          console.error("Error transforming event:", item, error);
          return null;
        }
      })
      .filter((event): event is CalendarEvent => event !== null);
  }, [apiData]);
}
```

## 📦 Types

### CalendarEvent

```typescript
interface CalendarEvent {
  id: string;              // Unique event identifier
  eventId: string;         // Group identifier (e.g., "property-1")
  title: string;           // Event title
  start: Date;             // Start date/time
  end: Date;               // End date/time
  meta?: {                 // Optional metadata
    type?: "property" | "cleaning" | "service" | "otherService" | "unassigned";
    source?: string;       // e.g., "booking", "airbnb"
    status?: string;       // e.g., "pending", "complete"
    color?: string;        // Optional override color
    [key: string]: any;    // Additional custom properties
  };
}
```

**Event Types:**
- `property`: Bookings/reservations (subtle background with title)
- `cleaning`: Cleaning jobs (solid color bar)
- `service`: Standard service (yellow solid bar)
- `otherService`: Custom service type
- `unassigned`: Unassigned/placeholder events

## 🎨 Key Features

### Horizontal Time Positioning

Events are positioned based on exact hour/minute within each day cell:
- Event at 9:00 AM → starts at 37.5% of cell width
- Event at 12:00 PM → starts at 50% of cell width
- Event at 6:00 PM → starts at 75% of cell width

### Multi-Day Event Spanning

Events spanning multiple days render as continuous bars across day cells.

### Global Row Assignment

All events with the same `eventId` appear in the same row for easy visual tracking.

### Type-Based Rendering

Events render based on `meta.type`, ensuring consistent appearance regardless of timezone conversions.

## ⚙️ Platform-Specific Notes

### Web Platform
- **Swipe gestures**: Disabled on web (use navigation buttons instead)
- **Reanimated**: Requires react-native-reanimated web support for animations
- **Images**: Static image assets may need web-compatible paths
- **Dimensions**: Uses `useWindowDimensions` for responsive layout

### React Native Platform
- **Swipe gestures**: Fully supported for month navigation
- **Reanimated**: Native performance optimizations enabled
- **Images**: Supports require() for static assets

## 🎯 Props Reference

### Calendar Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `events` | `CalendarEvent[]` | Yes | Array of events to display |
| `view` | `ViewMode` | No | Current view mode (default: "month") |
| `date` | `Date` | Yes | Current date/month to display |
| `onDateChange` | `(date: Date) => void` | Yes | Handler for date navigation |
| `onEventPress` | `(event: CalendarEvent) => void` | Yes | Handler for event press |
| `onViewChange` | `(view: ViewMode) => void` | No | Handler for view mode change |
| `theme` | `CalendarTheme` | No | Custom theme object |
| `availableProperties` | `Property[]` | No | Property list for color assignment |

### MonthView Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `events` | `CalendarEvent[]` | Yes | - | Events to display |
| `targetDate` | `Date` | Yes | - | Month to display |
| `containerHeight` | `number` | Yes | - | Total height in pixels |
| `onPressEvent` | `(event) => void` | No | - | Event press handler |
| `onPressCell` | `(date) => void` | No | - | Date cell press handler |
| `maxVisibleRows` | `number` | No | 3 | Max event rows per week |

## 🔧 Utilities

### Date Utilities

```typescript
import { formatDate, navigateDate, getDateLabel } from "@cleanhaus/calendar";

// Format date
const formatted = formatDate(new Date(), { month: "long", year: "numeric" });

// Navigate calendar
const nextMonth = navigateDate(new Date(), "next", "month");

// Get display label
const label = getDateLabel(new Date(), "month");
```

## 🐛 Troubleshooting

### Events not appearing
- ✅ Check that `eventId` is set correctly
- ✅ Verify `start` and `end` are valid Date objects
- ✅ Ensure `containerHeight` is sufficient (minimum 400px)
- ✅ Check that `meta.type` is one of the valid types

### Events in wrong rows
- ✅ Verify all events for the same property have the same `eventId`
- ✅ Check that `eventId` is a string (not undefined or null)

### Performance issues
- ✅ Reduce `maxVisibleRows` if rendering many events
- ✅ Filter events before passing to component
- ✅ Use `React.memo` on parent components

## 📚 Resources

- [react-native-big-calendar](https://github.com/acro5piano/react-native-big-calendar)
- [dayjs](https://day.js.org/)
- [calendarize](https://github.com/lukeed/calendarize)

## 📄 License

Part of the project codebase. For internal use.

---

**Version**: 2.1.0  
**Last Updated**: October 2025
