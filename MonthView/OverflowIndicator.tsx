import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { CalendarTheme } from "../utils/theme";

interface OverflowIndicatorProps {
  count: number;
  onPress: () => void;
  theme: CalendarTheme;
}

/**
 * OverflowIndicator Component
 * Displays "+X more" badge when there are hidden events in a day cell
 * Clicking switches to day view to show all events
 */
export const OverflowIndicator: React.FC<OverflowIndicatorProps> = ({
  count,
  onPress,
  theme,
}) => {
  if (count <= 0) return null;

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 0,
        left: 4,
        right: 4,
        paddingVertical: 2,
        paddingHorizontal: 4,
        // backgroundColor: `${theme.text}10`,
        zIndex: 200,
      }}
      onPress={(e) => {
        e.stopPropagation(); // Prevent day cell click
        onPress();
      }}
    >
      <Text
        style={{
          fontSize: 10,
          color: theme.text,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        +{count}
      </Text>
    </TouchableOpacity>
  );
};
