import React from "react";
import { View, Text, StyleSheet, useWindowDimensions, Platform } from "react-native";
import { CalendarTheme } from "../../utils/theme";
import {
  HEADER_HEIGHT,
  HEADER_FONT_SIZE,
  HEADER_FONT_WEIGHT,
  HEADER_PADDING_VERTICAL,
  HEADER_PADDING_HORIZONTAL,
  TIME_COLUMN_WIDTH,
} from "../constants";
import { VerticalDividers } from "../../shared/VerticalDividers";
import dayjs from "dayjs";

interface WeekHeaderProps {
  weekStart: Date;
  theme: CalendarTheme;
  propertyBar?: React.ReactNode | null;
  propertyBarHeight?: number; // computed height from parent
  containerWidth?: number; // actual container width (optional, falls back to window width)
}

/**
 * WeekHeader Component
 * Displays day headers (S, M, T, W, T, F, S) with dates
 */
export const WeekHeader: React.FC<WeekHeaderProps> = React.memo(
  ({ weekStart, theme, propertyBar, propertyBarHeight = 0, containerWidth }) => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    // SSR-safe: useWindowDimensions may not be available during SSR
    const windowDimensions = useWindowDimensions();
    // Use containerWidth if provided, otherwise fall back to window width
    const width = containerWidth || (typeof window !== 'undefined' ? windowDimensions.width : 0);
    const dayColumnWidth = Math.floor((width - TIME_COLUMN_WIDTH) / 7);
    const styles = createStyles(theme, dayColumnWidth, propertyBarHeight);

    return (
      <View style={styles.container}>
        {/* Background vertical dividers for full header (days + property bar) */}
        <VerticalDividers
          leftOffset={TIME_COLUMN_WIDTH}
          dayColumnWidth={dayColumnWidth}
          color={theme.border}
          style={{ zIndex: 0 }}
        />
        <View style={styles.headerRow}>
          {/* Time column spacer */}
          <View style={styles.timeColumnSpacer} />

          {/* Day headers */}
          {days.map((day, index) => {
            const date = dayjs(weekStart).add(index, "day");
            const isToday = date.isSame(dayjs(), "day");

            return (
              <View key={`header-${index}`} style={styles.dayHeader}>
                <Text style={[styles.dayName, { color: theme.text }]}>
                  {day}
                </Text>
                <View
                  style={[
                    styles.dateCircle,
                    isToday && { backgroundColor: theme.today },
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      {
                        color: isToday ? theme.background : theme.text,
                        fontWeight: isToday ? "700" : "400",
                      },
                    ]}
                  >
                    {date.format("D")}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Property indicator area (optional) */}
        {propertyBar ? (
          <View style={styles.propertyBarRow}>{propertyBar}</View>
        ) : null}
      </View>
    );
  }
);

const createStyles = (
  theme: CalendarTheme,
  dayColumnWidth: number,
  propertyBarHeight: number
) =>
  StyleSheet.create({
    container: {
      flexDirection: "column",
      // total header height includes optional property bar
      minHeight: HEADER_HEIGHT + (propertyBarHeight || 0),
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      backgroundColor: "transparent",
      position: "relative",
      zIndex: 1,
      // Web-specific: Make header sticky to top when scrolling vertically
      ...(Platform.OS === "web" &&
        typeof window !== "undefined" && {
          // @ts-ignore - web-specific CSS properties
          position: "sticky",
          top: 0,
          backgroundColor: theme.background, // Ensure background covers content when sticky
        }),
    },
    headerRow: {
      flexDirection: "row",
      height: HEADER_HEIGHT,
    },
    timeColumnSpacer: {
      width: TIME_COLUMN_WIDTH,
    },
    dayHeader: {
      width: dayColumnWidth,
      paddingVertical: HEADER_PADDING_VERTICAL,
      paddingHorizontal: HEADER_PADDING_HORIZONTAL,
      alignItems: "center",
      justifyContent: "center",
    },
    dayName: {
      fontSize: 9,
      textAlign: "center",
      marginBottom: 2,
    },
    dateCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
    },
    dateText: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
    propertyBarRow: {
      minHeight: propertyBarHeight,
      position: "relative",
    },
  });
