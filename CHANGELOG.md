# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-12

### Added
- Initial release of cleanhaus-calendar package
- Cross-platform calendar component (React Native + Web)
- Three view modes: Month, Week, and Day views
- Horizontal time-based event positioning
- Multi-day event spanning with global row assignment
- Type-based event rendering (property, cleaning, service, etc.)
- Web compatibility via react-native-web
- Next.js integration via next-plugin
- SSR-safe implementation
- Platform-aware gesture handling (swipe disabled on web)
- Comprehensive TypeScript types
- Theme customization support
- Property color management
- FAB component for actions
- Error boundary for robust error handling
- Comprehensive documentation and examples

### Features
- **MonthView**: Calendar grid with event bars, swipe navigation
- **WeekView**: 7-day view with time-based positioning
- **DayView**: Single-day view with property lanes and horizontal scrolling
- **CalendarFAB**: Floating action button component
- **Utilities**: Date helpers, event transformers, theme management
- **Hooks**: useSwipeGesture, useNowIndicator, useScrollSynchronization

### Technical
- TypeScript-first implementation
- React Native 0.70+ support
- React 18+ support
- React Native Reanimated 3+ for smooth animations
- Expo compatibility
- Metro bundler support
- Next.js 14+ support
- Web platform support via react-native-web

