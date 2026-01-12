import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CalendarTheme } from "../../utils/theme";
import {
  HEADER_HEIGHT,
  HEADER_FONT_SIZE,
  HEADER_FONT_WEIGHT,
  HEADER_PADDING_VERTICAL,
  HEADER_PADDING_HORIZONTAL,
} from "../constants";

interface PropertyHeaderProps {
  propertyName: string;
  propertyId: number;
  theme: CalendarTheme;
  width: number;
}

/**
 * PropertyHeader Component
 *
 * Individual property header cell for the sticky header row.
 */
export const PropertyHeader: React.FC<PropertyHeaderProps> = React.memo(
  ({ propertyName, propertyId, theme, width }) => {
    return (
      <View
        key={`header-${propertyId}`}
        style={[
          styles.propertyHeader,
          {
            width: width,
            borderRightColor: theme.borderLight,
          },
        ]}
      >
        <Text
          style={[styles.propertyName, { color: theme.text }]}
          numberOfLines={2}
        >
          {propertyName}
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  propertyHeader: {
    paddingVertical: HEADER_PADDING_VERTICAL,
    paddingLeft: HEADER_PADDING_HORIZONTAL,
    justifyContent: "center",
    alignItems: "flex-start",
    borderRightWidth: 1,
  },
  propertyName: {
    fontSize: HEADER_FONT_SIZE,
    fontWeight: HEADER_FONT_WEIGHT,
    textAlign: "center",
    lineHeight: 16,
  },
});
