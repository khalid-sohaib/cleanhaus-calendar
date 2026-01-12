import React from "react";
import { View } from "react-native";
import { CalendarTheme } from "../utils/theme";
import { HourGrid } from "./HourGrid";
import { TimeColumn } from "./TimeColumn";

interface TimeRailProps {
  theme: CalendarTheme;
  hourHeight: number;
  timeColumnWidth: number;
  totalHeight: number;
  use24Hour?: boolean;
  gridLineHeight?: number;
  timePaddingHorizontal?: number;
  timeTextOffset?: number;
  timeFontSize?: number;
  timeFontWeight?: string;
}

/**
 * TimeRail - Combines HourGrid and TimeColumn
 *
 * Always used together in DayView and WeekView.
 * Provides the time column on the left and hour grid lines in the background.
 */
export const TimeRail: React.FC<TimeRailProps> = React.memo(
  ({
    theme,
    hourHeight,
    timeColumnWidth,
    totalHeight,
    use24Hour = false,
    gridLineHeight = 1,
    timePaddingHorizontal = 2,
    timeTextOffset = -5,
    timeFontSize = 10,
    timeFontWeight = "400",
  }) => {
    return (
      <>
        <HourGrid
          theme={theme}
          hourHeight={hourHeight}
          timeColumnWidth={timeColumnWidth}
          gridLineHeight={gridLineHeight}
        />
        <View>
          <TimeColumn
            height={totalHeight}
            width={timeColumnWidth}
            hourHeight={hourHeight}
            theme={theme}
            use24Hour={use24Hour}
            timePaddingHorizontal={timePaddingHorizontal}
            timeTextOffset={timeTextOffset}
            timeFontSize={timeFontSize}
            timeFontWeight={timeFontWeight}
          />
        </View>
      </>
    );
  }
);
