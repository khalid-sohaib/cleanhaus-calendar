# Next.js Example

Reference implementation for using the Calendar component in a Next.js app. This example targets **Next.js 16** and demonstrates a **calendar header** (prev/next, Today, date/time display, view switcher) plus **most Calendar props** for a production-like reference.

## Stack

- **Next.js 16** – App Router
- **Webpack for dev** – The calendar plugin requires webpack. Next 16 uses Turbopack by default, so this example uses `next dev --webpack` (see `package.json` scripts).

## Prerequisites

- **Node 20.9+** (required by Next 16)

## Dependencies

This example installs **all peer dependencies** of the calendar package; none are omitted. That includes:

- `react`, `react-dom`, `react-native`, `react-native-web`, **react-native-reanimated**, `dayjs`, `calendarize`

`react-native-reanimated` is required for the component and is not optional for this demo.

## Run from this repo

1. Build the package once at repo root:
   ```bash
   npm run build
   ```

2. From repo root:
   ```bash
   npm run example:install
   npm run example:dev
   ```
   Or from this directory:
   ```bash
   cd examples/next-app
   npm install --legacy-peer-deps
   npm run dev
   ```
   (Next 16 and react-native have overlapping peer deps; `--legacy-peer-deps` is used so all dependencies install.)

3. Open [http://localhost:3000](http://localhost:3000) and go to **Calendar** to see the demo.

## Calendar header

The demo includes a **CalendarHeader** above the Calendar that:

- **Prev / Next** – Context-aware: day (±1 day), week (±7 days), month (±1 month)
- **Today** – Jumps to the current date
- **Date/time label** – Shows the current context (e.g. "January 2025", "Jan 13 – 19, 2025", or a single day)
- **View switcher** – Month / Week / Day tabs that stay in sync with the Calendar

This shows how to control the Calendar from outside (date, view) and is implemented in `app/calendar/CalendarHeader.tsx` and `app/calendar/page.tsx`.

## Props demonstrated

This example uses the following Calendar props so you can copy patterns into your own app:

| Prop | Usage in example |
|------|-------------------|
| `events` | 3 multi-day bookings per property; cleaning between bookings where scheduled; unassigned in gaps with no cleaning (meta types: property, cleaning, unassigned; cleaning events include `status`) |
| `date` / `onDateChange` | Driven by header prev/next and Today |
| `view` / `onViewChange` | Synced with header view switcher |
| `onEventPress` | Alert with event title and time range |
| `onDateTimeChange` | Navigates to day view and sets date/time (e.g. when tapping a time slot) |
| `theme` | Partial override (e.g. `today`, `primary` colors) |
| `availableProperties` | All properties with names (for DayView lanes and colors) |
| `propertiesToShow` | Subset of properties to show in DayView |
| `autoScrollToNow` | `true` in day view so the view scrolls to current time |
| `showFAB` / `onFABPress` | Floating action button with handler |

For the full API, data format, and all props see the main [README](../../README.md).

## Use in your own app

1. Install the package and **all** peer dependencies (see main [README](../../README.md) for GitHub Packages setup if using the published package):
   ```bash
   npm install @khalid-sohaib/calendar react react-dom react-native react-native-web react-native-reanimated dayjs calendarize
   ```

2. Add `next.config.ts` with the calendar plugin:
   ```ts
   import type { NextConfig } from "next";
   const withCalendar = require("@khalid-sohaib/calendar/next-plugin");
   const nextConfig: NextConfig = {};
   export default withCalendar(nextConfig);
   ```

3. For **Next.js 16+**, use webpack for development (this package does not support Turbopack yet):
   ```json
   "dev": "next dev --webpack"
   ```

4. Use the Calendar in a **client component** (`"use client"`) inside a container with explicit height (e.g. `height: "100vh"` or a flex layout with a constrained height). See `app/calendar/page.tsx` and `app/calendar/CalendarHeader.tsx` in this example.
