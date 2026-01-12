import React from "react";
import { View, ViewStyle } from "react-native";

interface Props {
  leftOffset: number; // usually TIME_COLUMN_WIDTH
  dayColumnWidth: number; // computed in parent
  columns?: number; // number of columns, default 7
  color: string; // theme.borderLight
  style?: ViewStyle; // optional extra style (zIndex, top/bottom overrides)
}

/**
 * Reusable vertical dividers component
 * Renders borders at the start of each column (e.g., 7 columns = 7 borders)
 */
export const VerticalDividers: React.FC<Props> = ({
  leftOffset,
  dayColumnWidth,
  columns = 7,
  color,
  style,
}) => {
  return (
    <View
      pointerEvents='none'
      style={[
        {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: leftOffset,
          right: 0,
        },
        style,
      ]}
    >
      {Array.from({ length: columns }, (_, i) => {
        const left = i * dayColumnWidth; // draw at the START of each column
        return (
          <View
            key={`divider-${i}`}
            style={{
              position: "absolute",
              left,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: color,
            }}
          />
        );
      })}
    </View>
  );
};
