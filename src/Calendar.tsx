// React Native Calendar Component - Uses only RN components
import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { CalendarProps, CalendarEvent } from "./types";
import { MonthView } from "./MonthView";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { CalendarFAB } from "./CalendarFAB";
import { CalendarTheme, mergeTheme } from "./utils/theme";
import { getDayStart, getCellPressDateTime } from "./utils/dateUtils";
import {
  DEFAULT_PROPERTY_COLORS,
  DEFAULT_PROPERTY_COLORS_DARK,
} from "./utils/propertyColors";
import { validateCalendarProps, logValidationErrors } from "./utils/validation";

export const CustomCalendar: React.FC<CalendarProps> = ({
  events = [],
  view = "month",
  date,
  onDateChange,
  onEventPress,
  onViewChange,
  onDateTimeChange,
  isLoading = false,
  availableProperties = [],
  propertiesToShow,
  theme,
  propertyColors = DEFAULT_PROPERTY_COLORS,
  propertyColorsDark = DEFAULT_PROPERTY_COLORS_DARK,
  showFAB = false,
  onFABPress,
  fabStyle,
  renderFAB,
  autoScrollToNow = false,
  cleaningIcon,
}) => {
  // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL RETURNS
  // This ensures hooks are called in the same order on every render (Rules of Hooks)
  
  // SSR-safe: Only render on client to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);
  
  // Get initial screen height as estimate for MonthView container sizing
  // SSR-safe: Use 0 as fallback for server-side rendering
  const getInitialHeight = () => {
    if (typeof window === "undefined") return 0; // SSR fallback
    try {
      return Dimensions.get("window").height;
    } catch {
      return 0; // Fallback if Dimensions.get fails
    }
  };
  const [height, setHeight] = useState(getInitialHeight);
  const [viewKey, setViewKey] = useState(0); // Track view changes to force remount

  // Mount effect - set isMounted to true after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset height and force remount when view changes to ensure proper dimension restoration
  useEffect(() => {
    setHeight(0); // Reset to force remeasurement
    setViewKey((prev) => prev + 1); // Force remount of container
  }, [view]);

  // Validate props in development mode
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const errors = validateCalendarProps({
        events,
        date,
        onDateChange,
        onEventPress,
        view,
      });
      logValidationErrors(errors);
    }
  }, [events, date, onDateChange, onEventPress, view]);

  // Merge user theme with default theme (not a hook, but needed before returns)
  const mergedTheme = mergeTheme(theme);
  
  // ✅ ALL HOOKS (including useCallback) MUST BE CALLED BEFORE CONDITIONAL RETURNS
  // Unified handler for date+time changes that navigates to day view
  const handleDateTimeChange = useCallback(
    (dateTime: Date) => {
      // Use onDateTimeChange if provided, otherwise fallback to onDateChange
      if (onDateTimeChange) {
        onDateTimeChange(dateTime);
      } else {
        onDateChange(dateTime);
      }
      // Always navigate to day view
      onViewChange?.("day");
    },
    [onDateTimeChange, onDateChange, onViewChange]
  );

  // Handle event press for MonthView
  const handleMonthViewEventPress = useCallback(
    (event: CalendarEvent) => {
      // Navigate to day view with event's start time - no other actions
      handleDateTimeChange(new Date(event.start));
      // Note: onEventPress is intentionally NOT called here to avoid modals/navigation
      // User can interact with the event in day view if needed
    },
    [handleDateTimeChange]
  );

  // Handle cell press for MonthView
  const handleMonthViewCellPress = useCallback(
    (pressedDate: Date) => {
      // Use utility to get appropriate date/time (current time if today, start of day otherwise)
      handleDateTimeChange(getCellPressDateTime(pressedDate));
    },
    [handleDateTimeChange]
  );

  // Handle "+X more" press - switch to day view for that date
  const handleShowMore = useCallback(
    (pressedDate: Date) => {
      // Use start of day for overflow clicks
      handleDateTimeChange(getDayStart(pressedDate));
    },
    [handleDateTimeChange]
  );

  // Handle event press for WeekView
  const handleWeekViewEventPress = useCallback(
    (event: CalendarEvent) => {
      // Navigate to day view with event's start time - no other actions
      handleDateTimeChange(new Date(event.start));
      // Note: onEventPress is intentionally NOT called here to avoid modals/navigation
      // User can interact with the event in day view if needed
    },
    [handleDateTimeChange]
  );

  // Handle cell press for WeekView
  const handleWeekViewCellPress = useCallback(
    (pressedDate: Date, time: Date) => {
      // Use the calculated time from click position
      handleDateTimeChange(time);
    },
    [handleDateTimeChange]
  );

  // Handle month change from swipe gestures (not a hook, just a regular function)
  const handleMonthChange = (newDate: Date) => {
    onDateChange(newDate);
  };
  
  // ✅ NOW safe to do conditional returns - ALL hooks have been called
  // During SSR, render minimal placeholder (prevents hydration mismatch)
  if (!isMounted) {
    return (
      <View style={[styles.container, { backgroundColor: mergedTheme.background }]} />
    );
  }

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: mergedTheme.background },
        ]}
      >
        <ActivityIndicator size='large' color={mergedTheme.today} />
        <Text style={[styles.loadingText, { color: mergedTheme.text }]}>
          Loading calendar...
        </Text>
      </View>
    );
  }

  // Render MonthView for month mode
  if (view === "month") {
    return (
      <View
        key={`month-${viewKey}`} // Force remount on view change
        style={[styles.container, { backgroundColor: mergedTheme.background }]}
        onLayout={(e: LayoutChangeEvent) => {
          const newHeight = e.nativeEvent.layout.height;
          if (newHeight > 0) {
            setHeight(newHeight);
          }
        }}
      >
        <MonthView
          events={events}
          targetDate={date}
          containerHeight={height || getInitialHeight()} // Fallback to initial height if not measured yet
          onPressEvent={handleMonthViewEventPress}
          onPressCell={handleMonthViewCellPress}
          onShowMore={handleShowMore}
          onMonthChange={handleMonthChange}
          maxVisibleRows={2}
          swipeEnabled={true}
          theme={mergedTheme}
          availableProperties={availableProperties}
          propertyColors={propertyColors}
          propertyColorsDark={propertyColorsDark}
          cleaningIcon={cleaningIcon}
        />
        {/* FAB removed from month view */}
      </View>
    );
  }

  // Render DayView for day mode
  if (view === "day") {
    return (
      <View
        key={`day-${viewKey}`} // Force remount on view change
        style={[styles.container, { backgroundColor: mergedTheme.background }]}
      >
        <DayView
          events={events}
          targetDate={date}
          onEventPress={onEventPress}
          theme={mergedTheme}
          availableProperties={availableProperties}
          propertiesToShow={propertiesToShow}
          autoScrollToNow={autoScrollToNow}
          propertyColors={propertyColors}
          propertyColorsDark={propertyColorsDark}
        />
        {showFAB && renderFAB ? (
          renderFAB()
        ) : showFAB ? (
          <CalendarFAB
            visible={showFAB}
            onPress={onFABPress || (() => {})}
            theme={mergedTheme}
            style={fabStyle}
          />
        ) : null}
      </View>
    );
  }

  // Render WeekView for week mode
  if (view === "week") {
    return (
      <View
        key={`week-${viewKey}`} // Force remount on view change
        style={[styles.container, { backgroundColor: mergedTheme.background }]}
      >
        <WeekView
          events={events}
          targetDate={date}
          onEventPress={handleWeekViewEventPress}
          onPressCell={handleWeekViewCellPress}
          onShowMore={handleShowMore}
          theme={mergedTheme}
          availableProperties={availableProperties}
          propertyColors={propertyColors}
          propertyColorsDark={propertyColorsDark}
        />
        {/* FAB removed from week view */}
      </View>
    );
  }

  // All supported views are handled above
  // If an invalid view is provided, default to month view
  return (
    <View
      key={`invalid-${viewKey}`} // Force remount on view change
      style={[styles.container, { backgroundColor: mergedTheme.background }]}
    >
      <Text style={[styles.errorText, { color: mergedTheme.text }]}>
        Invalid view mode: {view}. Supported: month, week, day
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // Web-specific: Ensure container has constrained height for child scrolling
    ...(typeof window !== "undefined" && {
      height: "100%",
      minHeight: 0, // Important for flex children on web
    }),
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    padding: 16,
    fontSize: 14,
    textAlign: "center",
  },
});
