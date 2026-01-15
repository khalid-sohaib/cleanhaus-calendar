import React from "react";
import { View, StyleSheet } from "react-native";
import { CalendarTheme } from "../utils/theme";
import { HOURS_IN_DAY } from "../utils/dateUtils";

interface HourGridProps {
  theme: CalendarTheme;
  hourHeight: number;
  timeColumnWidth: number;
  gridLineHeight?: number;
}

/**
 * HourGrid
 * Reusable horizontal hour lines for Day and Week views.
 */
export const HourGrid: React.FC<HourGridProps> = React.memo(
  ({ theme, hourHeight, timeColumnWidth, gridLineHeight = 1 }) => {
    return (
      <View pointerEvents='none' style={styles.globalHourGrid}>
        {Array.from({ length: HOURS_IN_DAY }, (_, hour) => (
          <View
            key={`global-hour-${hour}`}
            style={[
              styles.gridLine,
              {
                top: hour * hourHeight,
                left: timeColumnWidth,
                backgroundColor: theme.border,
                height: gridLineHeight,
              },
            ]}
          />
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  globalHourGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    right: 0,
  },
});
