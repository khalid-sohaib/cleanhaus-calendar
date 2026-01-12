import React from "react";
import { TouchableOpacity, StyleSheet, Text, ViewStyle } from "react-native";
import type { CalendarTheme } from "./utils/theme";

export interface CalendarFABProps {
  /**
   * Whether the FAB should be visible
   * @default true
   */
  visible?: boolean;

  /**
   * Callback when FAB is pressed
   */
  onPress: () => void;

  /**
   * Custom icon component (optional)
   * @default Plus icon (+)
   */
  icon?: React.ReactNode;

  /**
   * Theme object for colors (optional)
   * Passed from Calendar component
   */
  theme?: CalendarTheme;

  /**
   * Additional styles for the FAB container
   * Use this to override size, colors, position, etc.
   */
  style?: ViewStyle;

  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * Straightforward Floating Action Button for Calendar views
 *
 * Works out of the box with sensible defaults.
 * Uses theme colors when available, falls back to defaults.
 * Use the style prop to customize size, colors, position, etc.
 *
 * Features:
 * - Fully independent (uses only React Native core)
 * - Theme-aware (uses calendar theme colors when available)
 * - Sensible defaults (works without any props except onPress)
 * - Single style prop for all customization
 * - Cross-platform shadow support (iOS & Android)
 * - Follows React Native best practices
 */
export const CalendarFAB: React.FC<CalendarFABProps> = ({
  visible = true,
  onPress,
  icon,
  theme,
  style,
  testID = "calendar-fab",
}) => {
  if (!visible) {
    return null;
  }

  // Use theme colors if available, otherwise use defaults
  const backgroundColor = theme?.primary || "#6439D4";
  const iconColor = theme?.background || "#FFFFFF";

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor }, style]}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
    >
      {icon || <Text style={[styles.icon, { color: iconColor }]}>+</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    // Position
    position: "absolute",
    bottom: 16,
    right: 16,
    // Size
    width: 56,
    height: 56,
    borderRadius: 28,
    // Layout
    justifyContent: "center",
    alignItems: "center",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Android shadow
    elevation: 8,
    // Z-index for proper layering
    zIndex: 999,
  },
  icon: {
    fontSize: 28,
    fontWeight: "600",
    includeFontPadding: false,
    textAlignVertical: "center",
    textAlign: "center",
  },
});

export default CalendarFAB;
