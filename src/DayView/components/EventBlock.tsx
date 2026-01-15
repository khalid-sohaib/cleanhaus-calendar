import React from "react";
import { TouchableOpacity, View, ViewStyle, StyleProp } from "react-native";
import {
  Animated,
  useAnimatedStyle,
  SharedValue,
} from "../../utils/reanimated";
import { CalendarEvent } from "../../types";
import { CalendarTheme } from "../../utils/theme";
import { getCalendarEventColor } from "../../utils/theme";
import {
  EventBlockConfig,
  getEventBlockConfig,
} from "../config/EventBlockConfig";
import { styles } from "../styles/EventBlockStyles";
import {
  DEFAULT_PROPERTY_COLORS,
  DEFAULT_PROPERTY_COLORS_DARK,
} from "../../utils/propertyColors";
import { CONTENT_PADDING_TOP } from "../constants";

interface EventBlockProps {
  event: CalendarEvent;
  onPress: (event: CalendarEvent) => void;
  theme: CalendarTheme;
  propertyColor?: string;
  allEvents?: CalendarEvent[];
  style?: StyleProp<ViewStyle>;
  compact?: boolean; // Compact mode for week view
  availableProperties?: Array<{ id: number }>;
  scrollY?: SharedValue<number>;
  contentPaddingTop?: number; // Top padding of ScrollView content (defaults to CONTENT_PADDING_TOP)
}

/**
 * Unified EventBlock Component
 *
 * Single component that renders all event types with type-based customization.
 * Uses configuration to determine layout, styling, and behavior.
 */
export const EventBlock: React.FC<EventBlockProps> = React.memo(
  ({
    event,
    onPress,
    theme,
    propertyColor,
    allEvents = [],
    style,
    compact = false,
    availableProperties = [],
    scrollY,
    contentPaddingTop = CONTENT_PADDING_TOP,
  }) => {
    const eventType = event.meta?.type || "default";
    const baseColor =
      propertyColor ||
      getCalendarEventColor(
        event,
        theme,
        availableProperties,
        DEFAULT_PROPERTY_COLORS,
        DEFAULT_PROPERTY_COLORS_DARK
      );

    // Get configuration for this event type
    const config = getEventBlockConfig(eventType);

    // Extract event data based on configuration
    const eventData = config.dataExtractor(event, allEvents);

    // Use compact styles for week view
    const containerStyle = compact ? styles.containerCompact : styles.container;
    const eventContainerStyle = compact
      ? styles.eventContainerCompact
      : styles.eventContainer;

    // Extract card position from style prop
    // Style prop is an array: [styles.eventBlock, { top: position.top, height: position.height, ... }]
    let cardTop = 0;
    let cardHeight = 0;

    if (Array.isArray(style)) {
      // If style is an array, check all items for top/height
      for (const styleItem of style) {
        if (
          styleItem &&
          typeof styleItem === "object" &&
          !Array.isArray(styleItem)
        ) {
          const item = styleItem as any;
          if (item.top !== undefined && item.top !== null) cardTop = item.top;
          if (item.height !== undefined && item.height !== null)
            cardHeight = item.height;
        }
      }
    } else if (style && typeof style === "object" && !Array.isArray(style)) {
      // If style is a single object
      const styleObj = style as any;
      cardTop = styleObj?.top ?? 0;
      cardHeight = styleObj?.height ?? 0;
    }

    // Get card padding (different for compact vs normal)
    const cardPaddingVertical = compact ? 2 : 8; // From eventContainer styles
    const cardPaddingHorizontal = compact ? 4 : 8; // From eventContainer styles

    // Calculate constants for animated style (these don't change during scroll)
    const cardTopInScrollContent = cardTop + contentPaddingTop;
    const textTopInScrollContent = cardTopInScrollContent + cardPaddingVertical;
    const stickyContentHeight = compact ? 60 : 120; // Approximate height for header + content

    // Check if footer exists and calculate its position (done once, outside animated style)
    const footerSection = config.sections.find(
      (s) =>
        (!s.condition || s.condition(eventData)) &&
        (typeof s.containerStyle === "function"
          ? s.containerStyle(theme)
          : s.containerStyle) === styles.cardFooter
    );
    // Footer height: paddingTop (8) + border (1) + text line (~20-25) = ~30-35px
    const footerHeight = footerSection ? (compact ? 25 : 35) : 0;
    // Footer starts after header + content in the card
    const footerTopInCard = stickyContentHeight;

    const minTranslate = -cardPaddingVertical;
    // Adjust maxTranslate to prevent sticky content from overlapping footer
    const maxTranslate =
      cardHeight - cardPaddingVertical - stickyContentHeight - footerHeight;

    // Animated style that runs on UI thread for smooth 60fps animation
    const animatedStickyStyle = useAnimatedStyle(() => {
      if (!scrollY || cardHeight === 0) {
        return { transform: [{ translateY: 0 }] };
      }

      const textTopInViewport = textTopInScrollContent - scrollY.value;
      const cardBottomInViewport =
        cardTopInScrollContent + cardHeight - scrollY.value;

      // Calculate footer position in viewport
      const footerTopInViewport =
        cardTopInScrollContent +
        cardPaddingVertical +
        footerTopInCard -
        scrollY.value;

      // Sticky content bottom position in viewport (when at current translate position)
      const stickyContentBottomInViewport =
        textTopInViewport + stickyContentHeight;

      // Should stick when:
      // 1. Text top is above viewport (scrolled past)
      // 2. Card bottom is still below viewport (card is visible)
      // 3. Sticky content bottom hasn't reached footer top (prevent overlap)
      const shouldStick =
        textTopInViewport < 0 &&
        cardBottomInViewport > stickyContentHeight &&
        (footerHeight === 0 ||
          stickyContentBottomInViewport < footerTopInViewport);

      if (!shouldStick) {
        return { transform: [{ translateY: 0 }] };
      }

      const textCurrentViewportPos =
        cardTop + contentPaddingTop - scrollY.value + cardPaddingVertical;
      const desiredTranslate = -textCurrentViewportPos;

      // Clamp: can't go above card top or below card bottom
      const clamped = Math.max(
        minTranslate,
        Math.min(desiredTranslate, maxTranslate)
      );

      return {
        transform: [{ translateY: clamped }],
      };
    }, [
      cardTop,
      cardHeight,
      cardPaddingVertical,
      stickyContentHeight,
      cardTopInScrollContent,
      textTopInScrollContent,
      minTranslate,
      maxTranslate,
      contentPaddingTop,
      footerHeight,
      footerTopInCard,
    ]);

    return (
      <TouchableOpacity
        style={[containerStyle, style]}
        onPress={() => onPress(event)}
        activeOpacity={0.7}
      >
        <View
          style={[
            eventContainerStyle, // Common styles for all event types (compact or normal)
            config.containerStyle, // Event-specific styles
            { backgroundColor: config.backgroundColor(theme) },
            ...config.conditionalStyles.map((condition) =>
              condition.predicate(eventData) ? condition.style(theme) : {}
            ),
            {
              flexDirection: "column",
              position: "relative",
              overflow: "hidden", // Clip sticky text at card boundaries
            },
          ]}
        >
          {/* Render sticky header + content */}
          {(() => {
            const getSectionStyle = (section: any) => {
              if (!section) return null;
              return typeof section.containerStyle === "function"
                ? section.containerStyle(theme)
                : section.containerStyle;
            };

            const headerSection = config.sections.find(
              (s) =>
                (!s.condition || s.condition(eventData)) &&
                getSectionStyle(s) === styles.cardHeader
            );
            const contentSection = config.sections.find(
              (s) =>
                (!s.condition || s.condition(eventData)) &&
                getSectionStyle(s) === styles.cardContent
            );

            if (!headerSection || !contentSection) return null;

            const headerContainerStyle = getSectionStyle(headerSection);
            const contentContainerStyle = getSectionStyle(contentSection);

            return (
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    top: cardPaddingVertical,
                    left: cardPaddingHorizontal,
                    right: cardPaddingHorizontal,
                    zIndex: 10,
                  },
                  animatedStickyStyle,
                ]}
              >
                <View style={headerContainerStyle}>
                  {headerSection.render(
                    event,
                    eventData,
                    theme,
                    baseColor,
                    compact
                  )}
                </View>
                <View style={contentContainerStyle}>
                  {contentSection.render(
                    event,
                    eventData,
                    theme,
                    baseColor,
                    compact
                  )}
                </View>
              </Animated.View>
            );
          })()}

          {/* Render all sections (header/content as invisible placeholders, footer normally) */}
          {config.sections.map((section, index) => {
            if (section.condition && !section.condition(eventData)) {
              return null;
            }

            const containerStyle =
              typeof section.containerStyle === "function"
                ? section.containerStyle(theme)
                : section.containerStyle;

            const isHeaderOrContent =
              containerStyle === styles.cardHeader ||
              containerStyle === styles.cardContent;

            return (
              <View
                key={index}
                style={
                  isHeaderOrContent
                    ? [containerStyle, { opacity: 0 }]
                    : containerStyle
                }
                pointerEvents={isHeaderOrContent ? "none" : "auto"}
              >
                {section.render(event, eventData, theme, baseColor, compact)}
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  }
);
