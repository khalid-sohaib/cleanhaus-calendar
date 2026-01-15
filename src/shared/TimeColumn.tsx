import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CalendarTheme } from "../utils/theme";
import { formatHourLabel, HOURS_IN_DAY } from "../utils/dateUtils";

interface TimeColumnProps {
  height: number;
  width: number;
  hourHeight: number;
  theme: CalendarTheme;
  use24Hour?: boolean;
  timePaddingHorizontal?: number;
  timeTextOffset?: number;
  timeFontSize?: number;
  timeFontWeight?: string;
}

/**
 * Shared TimeColumn used by Day and Week views
 */
export const TimeColumn: React.FC<TimeColumnProps> = React.memo(
  ({
    height,
    width,
    hourHeight,
    theme,
    use24Hour = false,
    timePaddingHorizontal = 2,
    timeTextOffset = -5,
    timeFontSize = 10,
    timeFontWeight = "400",
  }) => {
    const hours = Array.from({ length: HOURS_IN_DAY }, (_, i) => i);
    const styles = createStyles();

    return (
      <View
        style={[
          styles.container,
          {
            width,
            height,
            backgroundColor: theme.background,
          },
        ]}
      >
        {hours.map((hour) => {
          const timeString = formatHourLabel(hour, use24Hour);

          return (
            <View
              key={hour}
              style={[
                styles.hourSlot,
                {
                  height: hourHeight,
                  paddingHorizontal: timePaddingHorizontal,
                  top: timeTextOffset,
                },
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  {
                    color: theme.textSecondary,
                    fontSize: timeFontSize,
                    fontWeight: timeFontWeight as any,
                  },
                ]}
              >
                {timeString}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }
);

const createStyles = () =>
  StyleSheet.create({
    container: {},
    hourSlot: {
      justifyContent: "flex-start",
      alignItems: "center",
    },
    timeText: {
      textAlign: "center",
    },
  });
