/**
 * Shared Components for Calendar
 *
 * This folder now only contains React components that are shared across views.
 * All utilities have been moved to /calendar/utils/ folder.
 */

// Error handling component
export { CalendarErrorBoundary } from "./ErrorBoundary";

// Time components (exported for convenience, but TimeRail is recommended)
export { HourGrid } from "./HourGrid";
export { TimeColumn } from "./TimeColumn";
export { TimeRail } from "./TimeRail";
export { NowIndicator } from "./NowIndicator";
export { useNowIndicator } from "./useNowIndicator";

// Layout components
export { VerticalDividers } from "./VerticalDividers";
