import React, { useMemo } from "react";
import { View } from "react-native";
import { WeekOverflowIndicator } from "../OverflowIndicator";
import { PropertyIndicator } from "./PropertyIndicator";
import {
  PROPERTY_BAR_HEIGHT,
  PROPERTY_BAR_VERTICAL_GAP,
  TIME_COLUMN_WIDTH,
} from "../constants";
import { CalendarTheme } from "../../utils/theme";

interface Props {
  theme: CalendarTheme;
  dayColumnWidth: number;
  visibleIndicators: any[];
  overflowCount: number;
  overflowByDay: number[];
  weekVisibleLimit: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  containerStyle?: any;
  contentStyle?: any;
  spacerStyle?: any;
}

export const PropertyBar: React.FC<Props> = ({
  theme,
  dayColumnWidth,
  visibleIndicators,
  overflowCount,
  overflowByDay,
  weekVisibleLimit,
  expanded,
  onToggleExpanded,
  containerStyle,
  contentStyle,
  spacerStyle,
}) => {
  const control = useMemo(() => {
    if (!(expanded || overflowCount > 0)) return null;

    const { index: maxDayIndex } = overflowByDay.reduce(
      (acc: { index: number; count: number }, cnt: number, idx: number) =>
        cnt > acc.count ? { index: idx, count: cnt } : acc,
      { index: 3, count: 0 }
    );
    const targetDay = overflowCount > 0 ? maxDayIndex : 3;
    const controlWidth = 40;

    const rows = weekVisibleLimit;
    const baseHeight =
      rows * PROPERTY_BAR_HEIGHT + (rows - 1) * PROPERTY_BAR_VERTICAL_GAP;

    return {
      left:
        TIME_COLUMN_WIDTH +
        targetDay * dayColumnWidth +
        dayColumnWidth / 2 -
        controlWidth / 2,
      top:
        baseHeight + PROPERTY_BAR_VERTICAL_GAP + (PROPERTY_BAR_HEIGHT - 16) / 2,
      width: controlWidth,
    } as const;
  }, [
    expanded,
    overflowCount,
    overflowByDay,
    weekVisibleLimit,
    dayColumnWidth,
  ]);

  return (
    <View style={containerStyle}>
      <View style={spacerStyle} />
      <View style={contentStyle}>
        {visibleIndicators.map((indicator, index) => (
          <PropertyIndicator
            key={`property-${index}`}
            indicator={indicator}
            theme={theme}
            dayColumnWidth={dayColumnWidth}
            row={indicator.row}
          />
        ))}

        {control && (
          <View
            style={{
              position: "absolute",
              left: control.left,
              top: control.top,
              width: control.width,
              alignItems: "center",
            }}
          >
            <WeekOverflowIndicator
              theme={theme}
              count={!expanded ? overflowCount : 0}
              showCount={!expanded}
              chevron={expanded ? "up" : "down"}
              onPress={onToggleExpanded}
            />
          </View>
        )}
      </View>
    </View>
  );
};
