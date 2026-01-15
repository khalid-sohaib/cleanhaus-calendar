/**
 * Calendar Error Boundary Component
 * Provides error handling and fallback UI for calendar components
 */

import React, { Component, ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CalendarTheme, DEFAULT_THEME } from "../utils/theme";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  theme?: CalendarTheme;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for Calendar Components
 * Catches errors in calendar component tree and displays fallback UI
 * All colors come from theme prop
 */
export class CalendarErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const theme = this.props.theme || DEFAULT_THEME;

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View
          style={[styles.container, { backgroundColor: theme.errorBoundaryBg }]}
        >
          <Text style={[styles.title, { color: theme.errorBoundaryText }]}>
            📅 Calendar Error
          </Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            Something went wrong while loading the calendar.
          </Text>
          {process.env.NODE_ENV !== "production" && this.state.error && (
            <Text style={[styles.error, { color: theme.errorBoundaryError }]}>
              {this.state.error.toString()}
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.errorBoundaryButtonBg },
            ]}
            onPress={this.handleReset}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.buttonText,
                { color: theme.errorBoundaryButtonText },
              ]}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  error: {
    fontSize: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
