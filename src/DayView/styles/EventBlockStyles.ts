import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    minHeight: 80,
    overflow: "hidden",
    flex: 1,
    minWidth: 120, // Minimum width constraint
    maxWidth: "100%", // Maximum width constraint
  },

  // Compact variant for week view
  containerCompact: {
    borderRadius: 0,
    minHeight: 40,
    overflow: "hidden",
    flex: 1,
    minWidth: 60,
    maxWidth: "100%",
  },

  // Common container styles for all event types
  eventContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 4,
    // display: "none",
  },

  // Compact variant for week view
  eventContainerCompact: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },

  // Common shadow styles for service events
  serviceShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Common border styles
  serviceBorder: {
    borderWidth: 1,
  },

  // Common alert border styles (for urgent/unassigned events)
  alertBorder: {
    borderWidth: 2,
  },

  // Card-like structure styles
  cardHeader: {
    // paddingBottom: 8,
    gap: 4,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 4,
    gap: 4,
  },
  cardFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "transparent", // Will be overridden by theme
  },

  // Common title style for all event types
  title: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },

  // Compact title for week view
  titleCompact: {
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },

  // Booking styles
  platformText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },

  // Compact platform text for week view
  platformTextCompact: {
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  underline: {
    height: 2,
    // borderRadius: 1.5,
  },
  guestName: {
    fontSize: 12,
    fontWeight: "500",
    fontStyle: "italic",
  },
  bookingAssigneeName: {
    fontSize: 13,
    fontWeight: "500",
  },
  bookingDates: {
    fontSize: 13,
    fontWeight: "400",
  },
  checkinTime: {
    fontSize: 13,
    fontWeight: "400",
  },

  // Service styles
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    height: 20,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Compact status badge for week view
  statusBadgeCompact: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 8,
    height: 16,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeTextCompact: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  eventContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  topContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  timeRange: {
    fontSize: 14,
    fontWeight: "400",
  },

  // Compact time range for week view
  timeRangeCompact: {
    fontSize: 10,
    fontWeight: "400",
  },
  urgencyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  urgencyIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  urgencyIconText: {
    fontSize: 10,
    fontWeight: "700",
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  alertsContainer: {
    gap: 4,
  },
  assigneeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatarImage: {
    width: 16,
    height: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "600",
  },
  assigneeName: {
    fontSize: 14,
    fontWeight: "400",
  },
  checkinSection: {},
  checkinText: {
    fontSize: 14,
    fontWeight: "700",
  },

  // Default styles
  defaultTitle: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
  },
  defaultTime: {
    fontSize: 9,
    fontWeight: "400",
  },

  // Compact default styles for week view
  defaultTitleCompact: {
    fontSize: 9,
    fontWeight: "500",
    lineHeight: 11,
  },
  defaultTimeCompact: {
    fontSize: 7,
    fontWeight: "400",
  },

  // Compact guest name, assignee, dates, check-in time
  guestNameCompact: {
    fontSize: 10,
    fontWeight: "500",
    fontStyle: "italic",
  },
  bookingAssigneeNameCompact: {
    fontSize: 10,
    fontWeight: "500",
  },
  bookingDatesCompact: {
    fontSize: 10,
    fontWeight: "400",
  },
  checkinTimeCompact: {
    fontSize: 10,
    fontWeight: "400",
  },
  assigneeNameCompact: {
    fontSize: 10,
    fontWeight: "400",
  },
});
