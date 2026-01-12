import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CalendarEvent } from "../../types";
import { CalendarTheme } from "../../utils/theme";
import { getStatusColor } from "../../utils/eventHelpers";
import {
  formatCheckInTime,
  formatBookingDates,
  getAssigneeInfo,
  hasEnoughHeightForAlerts,
  getJobTitle,
  getEventAlerts,
  formatEventTime,
  getAlertColor,
  extractEntityId,
} from "../../utils/eventHelpers";
import { formatTime } from "../../utils/dateUtils";
import {
  isJobUrgent as isJobUrgentUtil,
  getCleaningAssigneeForBooking,
} from "../utils";
import { styles } from "../styles/EventBlockStyles";

// Helper function to extract guest name
function extractGuestName(event: CalendarEvent): string | null {
  if (event.meta?.type !== "property") return null;

  return (
    event.meta?.guestName ||
    event.meta?.customerName ||
    event.meta?.guest?.name ||
    event.meta?.customer?.name ||
    null
  );
}

// Inline AlertRow component for use in event blocks
const AlertRow: React.FC<{
  alert: any;
  theme: CalendarTheme;
}> = ({ alert, theme }) => {
  const alertColor = getAlertColor(alert.type, theme);

  return (
    <View style={inlineStyles.alertItem}>
      <View style={[inlineStyles.alertIcon, { backgroundColor: alertColor }]}>
        <Text style={[inlineStyles.alertIconText, { color: theme.background }]}>
          {alert.icon}
        </Text>
      </View>
      <Text style={[inlineStyles.alertText, { color: theme.text }]}>
        {alert.message}
      </Text>
    </View>
  );
};

const inlineStyles = StyleSheet.create({
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  alertIconText: {
    fontSize: 10,
    fontWeight: "700",
  },
  alertText: {
    fontSize: 12,
    fontWeight: "400",
  },
});

export interface EventBlockConfig {
  containerStyle: any;
  backgroundColor: (theme: CalendarTheme) => string;
  conditionalStyles: Array<{
    predicate: (data: any) => boolean;
    style: (theme: CalendarTheme) => any;
  }>;
  sections: Array<{
    condition?: (data: any) => boolean;
    containerStyle?: any | ((theme: CalendarTheme) => any);
    render: (
      event: CalendarEvent,
      data: any,
      theme: CalendarTheme,
      baseColor: string,
      compact?: boolean
    ) => React.ReactNode;
  }>;
  dataExtractor: (event: CalendarEvent, allEvents: CalendarEvent[]) => any;
}

// Booking Event Configuration
const BOOKING_CONFIG: EventBlockConfig = {
  containerStyle: {
    // No additional styles needed - using common eventContainer styles
  },
  backgroundColor: (theme) => theme.eventBookingBg,
  conditionalStyles: [
    // Removed red border for no cleaning - unassigned blocks now handle this alert
  ],
  sections: [
    // Header Section (above underline)
    {
      containerStyle: styles.cardHeader,
      render: (event, data, theme, baseColor, compact) => (
        <>
          {/* Source */}
          {data.hasSource && (
            <Text
              style={[
                compact ? styles.platformTextCompact : styles.platformText,
                { color: theme.purple },
              ]}
              numberOfLines={1}
              ellipsizeMode='clip'
            >
              {event.meta?.source}
            </Text>
          )}
          <View style={styles.titleRow}>
            {/* Property Name */}
            <Text
              style={[
                compact ? styles.titleCompact : styles.title,
                { color: theme.text },
              ]}
              numberOfLines={1}
              ellipsizeMode='clip'
            >
              {event.title}
            </Text>
          </View>
        </>
      ),
    },
    // Content Section (underline + everything after)
    {
      containerStyle: styles.cardContent,
      render: (event, data, theme, baseColor, compact) => (
        <>
          {/* Underline/Separator */}
          <View style={[styles.underline, { backgroundColor: baseColor }]} />

          {/* Guest Name */}
          {data.guestName && (
            <Text
              style={[
                compact ? styles.guestNameCompact : styles.guestName,
                { color: theme.textSecondary },
              ]}
              numberOfLines={1}
              ellipsizeMode='clip'
            >
              Guest: {data.guestName}
            </Text>
          )}

          {/* Assignee */}
          <Text
            style={[
              compact
                ? styles.bookingAssigneeNameCompact
                : styles.bookingAssigneeName,
              {
                color: data.cleaningAssignee?.name ? theme.text : theme.alert,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode='clip'
          >
            {data.cleaningAssignee?.name || "No cleaner assigned"}
          </Text>

          {/* Booking Dates */}
          <Text
            style={[
              compact ? styles.bookingDatesCompact : styles.bookingDates,
              { color: theme.text },
            ]}
            numberOfLines={1}
            ellipsizeMode='clip'
          >
            {data.bookingDates}
          </Text>

          {/* Check-in Information */}
          <Text
            style={[
              compact ? styles.checkinTimeCompact : styles.checkinTime,
              { color: theme.text },
            ]}
            numberOfLines={1}
            ellipsizeMode='clip'
          >
            Check-in Today: {data.formattedCheckInTime}
          </Text>
        </>
      ),
    },
  ],
  dataExtractor: (event, allEvents) => ({
    hasSource: !!event.meta?.source,
    guestName: extractGuestName(event),
    cleaningAssignee: getCleaningAssigneeForBooking(event, allEvents),
    formattedCheckInTime: event.start.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
    bookingDates:
      event.meta?.originalStartDate && event.meta?.originalEndDate
        ? formatBookingDates(
            new Date(event.meta.originalStartDate),
            new Date(event.meta.originalEndDate)
          )
        : formatBookingDates(event.start, event.end),
    hasNoCleaning: !getCleaningAssigneeForBooking(event, allEvents)?.name,
  }),
};

// Service Event Configuration
const SERVICE_CONFIG: EventBlockConfig = {
  containerStyle: {
    // Service-specific styles using common styles
    ...styles.serviceBorder,
    ...styles.serviceShadow,
  },
  backgroundColor: (theme) => theme.background,
  conditionalStyles: [
    {
      predicate: (data) => data.isUrgent,
      style: (theme) => ({
        ...styles.alertBorder,
        borderColor: theme.alert,
      }),
    },
  ],
  sections: [
    // Header Section (status badge + title)
    {
      containerStyle: styles.cardHeader,
      render: (event, data, theme, baseColor, compact) => (
        <>
          {/* Status Badge */}
          <View
            style={[
              compact ? styles.statusBadgeCompact : styles.statusBadge,
              {
                backgroundColor: getStatusColor(event?.meta?.status, theme),
              },
            ]}
          >
            <Text
              style={[
                compact
                  ? styles.statusBadgeTextCompact
                  : styles.statusBadgeText,
                { color: theme.text },
              ]}
            >
              {event?.meta?.status}
            </Text>
          </View>

          {/* Title */}
          <View style={styles.titleRow}>
            <Text
              style={[
                compact ? styles.titleCompact : styles.title,
                { color: theme.text },
              ]}
              numberOfLines={1}
              ellipsizeMode='clip'
            >
              {data.jobTitle}
            </Text>
          </View>
        </>
      ),
    },
    // Content Section (underline + everything after)
    {
      containerStyle: styles.cardContent,
      render: (event, data, theme, baseColor, compact) => (
        <>
          {/* Underline/Separator */}
          <View style={[styles.underline, { backgroundColor: baseColor }]} />

          {/* Time Range */}
          <Text
            style={[
              compact ? styles.timeRangeCompact : styles.timeRange,
              { color: theme.text },
            ]}
            numberOfLines={1}
            ellipsizeMode='clip'
          >
            {data.timeRange}
          </Text>

          {/* Urgency Indicator */}
          {data.isUrgent && (
            <View style={styles.urgencyContainer}>
              <View
                style={[styles.urgencyIcon, { backgroundColor: theme.alert }]}
              >
                <Text
                  style={[styles.urgencyIconText, { color: theme.background }]}
                >
                  !
                </Text>
              </View>
              <Text style={[styles.urgencyText, { color: theme.alert }]}>
                Due within 3 hours
              </Text>
            </View>
          )}

          {/* Alerts */}
          {data.showAlerts && (
            <View style={styles.alertsContainer}>
              {data.alerts.map((alert: any, index: number) => (
                <AlertRow key={index} alert={alert} theme={theme} />
              ))}
            </View>
          )}

          {/* Assignee */}
          <View style={styles.assigneeContainer}>
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatarImage,
                  { backgroundColor: theme.textSecondary },
                ]}
              >
                <Text style={[styles.avatarText, { color: theme.background }]}>
                  {data.assigneeInfo.initials}
                </Text>
              </View>
            </View>
            <Text
              style={[
                compact ? styles.assigneeNameCompact : styles.assigneeName,
                { color: theme.text },
              ]}
              numberOfLines={1}
              ellipsizeMode='clip'
            >
              {data.assigneeInfo.name}
            </Text>
          </View>
        </>
      ),
    },
    // Footer Section (check-in info)
    {
      containerStyle: (theme: CalendarTheme) => ({
        ...styles.cardFooter,
        borderTopColor: theme.borderLight,
      }),
      render: (event, data, theme) => (
        <Text style={[styles.checkinText, { color: theme.text }]}>
          Check-in: {data.formattedCheckInTime || "N/A"}
        </Text>
      ),
    },
  ],
  dataExtractor: (event, allEvents) => ({
    assigneeInfo: getAssigneeInfo(event),
    alerts: getEventAlerts(event, allEvents),
    showAlerts: hasEnoughHeightForAlerts(event),
    isUrgent: isJobUrgentUtil(event, allEvents),
    jobTitle: getJobTitle(event),
    timeRange: `${formatTime(event.start)} - ${formatTime(event.end)}`,
    formattedCheckInTime: event.meta?.checkInDate
      ? formatTime(event.meta.checkInDate)
      : formatCheckInTime(event.meta?.checkIn || ""),
  }),
};

// Unassigned Event Configuration
const UNASSIGNED_CONFIG: EventBlockConfig = {
  containerStyle: {
    ...styles.alertBorder,
  },
  backgroundColor: (theme) => {
    // Low opacity red background
    const baseColor = theme.alert;
    // Convert hex to rgba with 0.15 opacity
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  },
  conditionalStyles: [
    {
      predicate: () => true, // Always show red border
      style: (theme) => ({
        borderColor: theme.alert,
      }),
    },
  ],
  sections: [
    // Header Section (alert icon + title)
    {
      containerStyle: styles.cardHeader,
      render: (event, data, theme, baseColor, compact) => (
        <>
          {/* Alert Icon */}
          <View style={styles.urgencyContainer}>
            <View
              style={[styles.urgencyIcon, { backgroundColor: theme.alert }]}
            >
              <Text
                style={[styles.urgencyIconText, { color: theme.background }]}
              >
                !
              </Text>
            </View>
            <Text
              style={[
                compact ? styles.titleCompact : styles.title,
                { color: theme.alert },
              ]}
              numberOfLines={1}
              ellipsizeMode='clip'
            >
              Unassigned
            </Text>
          </View>
        </>
      ),
    },
    // Content Section (booking details)
    {
      containerStyle: styles.cardContent,
      render: (event, data, theme, baseColor, compact) => (
        <>
          {/* Property Name */}
          <Text
            style={[
              compact ? styles.titleCompact : styles.title,
              { color: theme.text },
            ]}
            numberOfLines={1}
            ellipsizeMode='clip'
          >
            {data.propertyName || event.meta?.entityName || "Unknown Property"}
          </Text>

          {/* Booking Dates Range */}
          {data.bookingDates && (
            <Text
              style={[
                compact ? styles.bookingDatesCompact : styles.bookingDates,
                { color: theme.textSecondary },
              ]}
              numberOfLines={1}
              ellipsizeMode='clip'
            >
              {data.bookingDates}
            </Text>
          )}

          {/* Gap Period */}
          {data.gapPeriod && (
            <Text
              style={[
                compact ? styles.timeRangeCompact : styles.timeRange,
                { color: theme.alert },
              ]}
              numberOfLines={1}
              ellipsizeMode='clip'
            >
              {data.gapPeriod}
            </Text>
          )}

          {/* Address */}
          {data.address && (
            <Text
              style={[
                compact ? styles.bookingDatesCompact : styles.bookingDates,
                { color: theme.textSecondary },
              ]}
              numberOfLines={1}
              ellipsizeMode='clip'
            >
              {data.address}
            </Text>
          )}

          {/* Description */}
          {data.description && (
            <Text
              style={[
                compact ? styles.bookingDatesCompact : styles.bookingDates,
                { color: theme.textSecondary, fontStyle: "italic" },
              ]}
              numberOfLines={2}
              ellipsizeMode='tail'
            >
              {data.description}
            </Text>
          )}
        </>
      ),
    },
  ],
  dataExtractor: (event, allEvents) => {
    // Extract property name from eventId or meta
    const entityId = extractEntityId(event.eventId);
    const propertyName =
      event.meta?.entityName ||
      `Property ${entityId !== null ? entityId : "Unknown"}`;

    // Format gap period (checkout to check-in)
    const formatDateTime = (date: Date): string => {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    const gapPeriod = `Gap: ${formatDateTime(event.start)} - ${formatDateTime(
      event.end
    )}`;

    // Get booking dates
    const bookingDates = formatBookingDates(event.start, event.end);

    return {
      propertyName,
      bookingDates,
      gapPeriod,
      address: event.meta?.address,
      description:
        event.meta?.description || "No cleaning job scheduled for turnover",
    };
  },
};

// Default Event Configuration
const DEFAULT_CONFIG: EventBlockConfig = {
  containerStyle: {
    // No additional styles needed - using common eventContainer styles
  },
  backgroundColor: (theme) => theme.eventDefaultBg,
  conditionalStyles: [],
  sections: [
    // Header Section (title)
    {
      containerStyle: styles.cardHeader,
      render: (event, data, theme) => (
        <View style={styles.titleRow}>
          <Text
            style={[styles.defaultTitle, { color: theme.text }]}
            numberOfLines={2}
          >
            {event.title}
          </Text>
        </View>
      ),
    },
    // Content Section (time)
    {
      containerStyle: styles.cardContent,
      render: (event, data, theme) => (
        <Text style={[styles.defaultTime, { color: theme.textSecondary }]}>
          {formatEventTime(event)}
        </Text>
      ),
    },
  ],
  dataExtractor: () => ({}),
};

// Configuration Registry
const CONFIG_REGISTRY: Record<string, EventBlockConfig> = {
  property: BOOKING_CONFIG,
  cleaning: SERVICE_CONFIG,
  service: SERVICE_CONFIG,
  otherService: SERVICE_CONFIG,
  unassigned: UNASSIGNED_CONFIG,
  default: DEFAULT_CONFIG,
};

export function getEventBlockConfig(eventType: string): EventBlockConfig {
  return CONFIG_REGISTRY[eventType] || CONFIG_REGISTRY.default;
}
