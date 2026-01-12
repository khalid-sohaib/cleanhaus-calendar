import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { CalendarTheme } from "../utils/theme";

export interface NowIndicatorProps {
  top: number;
  theme: CalendarTheme;
  color?: string;
  thickness?: number;
  lineLeft?: number;
  lineRight?: number;
  lineWidth?: number;
  dotSize?: number;
  dotLeft?: number;
  showDot?: boolean;
  style?: ViewStyle;
}

/**
 * Generic Now Indicator
 *
 * Renders a horizontal line (with optional dot) that highlights the current time.
 * Used by Day and Week calendar views.
 */
export const NowIndicator: React.FC<NowIndicatorProps> = ({
  top,
  theme,
  color,
  thickness = 2,
  lineLeft = 0,
  lineRight,
  lineWidth,
  dotSize = 10,
  dotLeft,
  showDot = true,
  style,
}) => {
  const indicatorColor = color ?? theme.nowIndicator ?? theme.primaryLight;

  return (
    <View
      pointerEvents='none'
      style={[styles.container, style, { top }]}
      accessibilityRole='none'
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: indicatorColor,
              left: (dotLeft ?? lineLeft) - dotSize / 2,
              top: -dotSize / 2 + thickness / 2,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.line,
          {
            backgroundColor: indicatorColor,
            height: thickness,
            left: lineLeft,
            ...(lineWidth !== undefined
              ? { width: lineWidth }
              : { right: lineRight ?? 0 }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
  },
  dot: {
    position: "absolute",
  },
  line: {
    position: "absolute",
    top: 0,
  },
});
