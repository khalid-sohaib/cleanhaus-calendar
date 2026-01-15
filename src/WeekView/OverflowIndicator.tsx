import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { CalendarTheme } from "../utils/theme";

interface Props {
  theme: CalendarTheme;
  count?: number; // for +X display
  chevron?: "up" | "down" | null; // optional chevron
  onPress?: () => void;
  style?: ViewStyle;
  showCount?: boolean; // default true when count provided
}

/**
 * OverflowIndicator for WeekView
 * - Reusable small pill used both in DayColumn and the Property Indicator bar
 * - Can show "+X" count, chevron up/down, or both
 */
export const WeekOverflowIndicator: React.FC<Props> = ({
  theme,
  count = 0,
  chevron = null,
  onPress,
  style,
  showCount = true,
}) => {
  const label = showCount && count > 0 ? `+${count}` : undefined;
  // Use Unicode chevrons instead of icon library for web compatibility
  const chevronSymbol =
    chevron === "up" ? "▲" : chevron === "down" ? "▼" : null;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => {
        onPress && onPress();
      }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {label ? (
        <Pressable
          onPress={onPress}
          accessibilityRole={onPress ? "button" : undefined}
          accessibilityLabel={chevron === "down" ? "Expand" : "Collapse"}
        >
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            {label}
          </Text>
        </Pressable>
      ) : null}
      {chevronSymbol ? (
        <Pressable
          onPress={onPress}
          accessibilityRole={onPress ? "button" : undefined}
          accessibilityLabel={chevron === "down" ? "Expand" : "Collapse"}
          style={label ? styles.chevronIcon : undefined}
        >
          <Text style={[styles.chevronText, { color: theme.text }]}>
            {chevronSymbol}
          </Text>
        </Pressable>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    // keep this element above overlapping siblings so presses land
    position: "relative",
    zIndex: 100,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
  },
  chevronIcon: {},
  chevronText: {
    fontSize: 10,
    lineHeight: 14,
  },
});
