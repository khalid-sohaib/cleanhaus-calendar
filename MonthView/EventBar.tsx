import React from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { CalendarEvent } from "../types";
import { EventPosition } from "./types";
import { CalendarTheme } from "../utils/theme";
import {
  getEventBackgroundColor,
  getEventRenderingConfig,
  getCalendarEventColor,
} from "../utils/theme";
import {
  DEFAULT_PROPERTY_COLORS,
  DEFAULT_PROPERTY_COLORS_DARK,
} from "../utils/propertyColors";

// Conditional image loading for web compatibility
const CLEANING_ICON = Platform.OS === "web" 
  ? null 
  : require("../shared/sparks.png");

interface EventBarProps {
  position: EventPosition;
  onPress?: (event: CalendarEvent) => void;
  theme: CalendarTheme;
  availableProperties?: Array<{ id: number }>;
  propertyColors?: string[];
  propertyColorsDark?: string[];
}

/**
 * EventBar Component
 * Renders a single event bar with horizontal time-based positioning
 * NOW USES TYPE-BASED RENDERING (not duration-based):
 * - Property/Booking events: lower opacity + triangle indicator + title in first week
 * - Cleaning/Service events: full opacity + no triangle + no title
 * - Unassigned/Gap events: low opacity + red border + alert icon + title
 *
 * Features:
 * - Vertical spacing (rowSpacing): 5px between rows
 * - Horizontal spacing (barSpacing): 5px between bars on same row
 */
export const EventBar: React.FC<EventBarProps> = ({
  position,
  onPress,
  theme,
  availableProperties = [],
  propertyColors = DEFAULT_PROPERTY_COLORS,
  propertyColorsDark = DEFAULT_PROPERTY_COLORS_DARK,
}) => {
  const { event, left, width, row } = position;
  const rowHeight = 24;
  const rowSpacing = 5;
  const barSpacing = 0; // Horizontal spacing between bars on same row
  const top = 22 + row * (rowHeight + rowSpacing); // 28px offset for date header

  const backgroundColor = getEventBackgroundColor(
    event,
    theme,
    availableProperties,
    propertyColors,
    propertyColorsDark
  );
  const renderConfig = getEventRenderingConfig(event);
  const baseColor = getCalendarEventColor(
    event,
    theme,
    availableProperties,
    propertyColors,
    propertyColorsDark
  );
  const isCleaning =
    event.meta?.type === "cleaning" && event.meta?.jobTypeId === 1;

  // Triangle dimensions (smaller and centered)
  const triangleSize = 6; // Small triangle
  const showLeadingArrow = renderConfig.showArrow && position.isFirstWeek;
  const showTrailingArrow = renderConfig.showArrow && position.isLastWeek;

  // Alert icon size (for unassigned)
  const iconSize = 12;
  const cleaningIconSize = 10;

  // Apply horizontal spacing: add small left margin and reduce width
  const adjustedLeft = left + barSpacing / 2;
  const adjustedWidth = Math.max(width - barSpacing, 4);

  return (
    <TouchableOpacity
      key={`${event.id}-${position.weekIndex}-${row}`}
      onPress={() => onPress?.(event)}
      style={{
        position: "absolute",
        left: adjustedLeft,
        width: adjustedWidth,
        top,
        height: rowHeight,
        backgroundColor,
        borderRadius: 2,
        overflow: "visible",
        zIndex: 100 + row,
        // Add border for unassigned events
        ...(renderConfig.showBorder && {
          borderWidth: 1.5,
          borderColor: baseColor,
        }),
      }}
    >
      {/* Triangle indicator (shown based on event type config, first week only) */}
      {showLeadingArrow && (
        <View
          style={{
            position: "absolute",
            left: 2,
            top: (rowHeight - triangleSize * 2) / 2, // Center vertically
            width: 0,
            height: 0,
            backgroundColor: "transparent",
            borderStyle: "solid",
            borderTopWidth: triangleSize,
            borderBottomWidth: triangleSize,
            borderLeftWidth: triangleSize,
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: baseColor,
            zIndex: 1,
          }}
        />
      )}

      {/* Trailing triangle indicator for final week */}
      {showTrailingArrow && (
        <View
          style={{
            position: "absolute",
            right: 2,
            top: (rowHeight - triangleSize * 2) / 2, // Center vertically
            width: 0,
            height: 0,
            backgroundColor: "transparent",
            borderStyle: "solid",
            borderTopWidth: triangleSize,
            borderBottomWidth: triangleSize,
            borderRightWidth: triangleSize,
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
            borderRightColor: baseColor,
            zIndex: 1,
          }}
        />
      )}

      {/* Alert icon for unassigned events */}
      {renderConfig.showIcon && position.isFirstWeek && (
        <View
          style={{
            position: "absolute",
            left: 4,
            top: (rowHeight - iconSize) / 2, // Center vertically
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize / 2,
            backgroundColor: baseColor,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <Text
            style={{
              fontSize: 8,
              color: theme.background,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            !
          </Text>
        </View>
      )}

      {/* Event title */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: isCleaning ? "center" : "flex-start",
          paddingLeft: showLeadingArrow
            ? triangleSize + 4
            : renderConfig.showIcon && position.isFirstWeek
            ? iconSize + 6
            : 2,
          paddingRight: showTrailingArrow ? triangleSize + 4 : 2,
        }}
      >
        {isCleaning ? (
          CLEANING_ICON ? (
            <Image
              source={CLEANING_ICON}
              style={{
                width: cleaningIconSize,
                height: cleaningIconSize,
                tintColor: theme.primary,
                resizeMode: "contain",
              }}
            />
          ) : (
            <Text
              style={{
                fontSize: cleaningIconSize,
                color: theme.primary,
                fontWeight: "600",
              }}
            >
              ✨
            </Text>
          )
        ) : (
          <Text
            numberOfLines={1}
            style={{
              fontSize: 9,
              color: renderConfig.showIcon ? baseColor : theme.text,
              fontWeight: renderConfig.showIcon ? "600" : "500",
            }}
          >
            {width > 30 &&
            renderConfig.showTitle &&
            (renderConfig.titleOnFirstWeekOnly ? position.isFirstWeek : true)
              ? event.meta?.type === "unassigned"
                ? "Unassigned"
                : event.title
              : ""}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
