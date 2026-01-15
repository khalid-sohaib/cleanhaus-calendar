import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CalendarTheme } from "../../utils/theme";
import { PropertyIndicatorData } from "../types";
import {
  PROPERTY_BAR_HEIGHT,
  TIME_COLUMN_WIDTH,
  PROPERTY_BAR_VERTICAL_GAP,
} from "../constants";

interface PropertyIndicatorProps {
  indicator: PropertyIndicatorData;
  theme: CalendarTheme;
  dayColumnWidth: number;
  row: number;
}

/**
 * PropertyIndicator Component
 * Horizontal bar spanning across days to show property presence
 * Supports multiple rows when indicators overlap
 */
export const PropertyIndicator: React.FC<PropertyIndicatorProps> = React.memo(
  ({ indicator, theme, dayColumnWidth, row }) => {
    const width = (indicator.endDay - indicator.startDay + 1) * dayColumnWidth;
    const left = indicator.startDay * dayColumnWidth;

    return (
      <View
        style={[
          styles.container,
          {
            left: left + TIME_COLUMN_WIDTH,
            width,
            top: row * (PROPERTY_BAR_HEIGHT + PROPERTY_BAR_VERTICAL_GAP),
            backgroundColor: indicator.color,
          },
        ]}
      >
        <Text style={[styles.label, { color: "#FFFFFF" }]} numberOfLines={1}>
          {indicator.propertyName}
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    height: PROPERTY_BAR_HEIGHT,
    borderRadius: 4,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    overflow: "hidden",
  },
});
