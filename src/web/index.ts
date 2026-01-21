/**
 * Web-specific entry point for @cleanhaus/calendar
 * Sets up polyfills and ensures react-native-web is available
 */

// Polyfill __DEV__ for web before any imports
if (typeof window !== 'undefined' && typeof (window as any).__DEV__ === 'undefined') {
  // @ts-ignore - process may not be defined in all environments
  const env = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'production';
  (window as any).__DEV__ = env !== 'production';
}

// Ensure react-native-web is available
if (typeof window !== 'undefined') {
  try {
    // @ts-ignore - require may not be defined in all environments
    if (typeof require !== 'undefined') {
      // @ts-ignore
      require('react-native-web');
    }
  } catch (e) {
    // Silently continue - components will use fallbacks
  }
}

// Re-export everything from main entry
export * from '../index';

