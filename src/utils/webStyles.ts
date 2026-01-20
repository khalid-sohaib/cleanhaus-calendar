/**
 * Web-specific style overrides for React Native Web
 * 
 * These styles are applied conditionally in component render to avoid hydration issues
 * in Next.js SSR. Styles are only applied after client-side mount and only on web platform.
 */

import { ViewStyle } from 'react-native';
import { Platform } from 'react-native';

/**
 * Web-specific style overrides
 * These are applied conditionally in component render to avoid hydration issues
 */
export const webStyles = {
  container: {
    height: '100%' as const,
    minHeight: 0,
  } as ViewStyle,
  
  scrollContainer: {
    height: '100%',
    maxHeight: '100%',
    minHeight: 0,
    overflowY: 'auto' as const,
    overflowX: 'auto' as const,
    WebkitOverflowScrolling: 'touch' as const,
  } as ViewStyle,
  
  scrollContainerVertical: {
    height: '100%',
    maxHeight: '100%',
    minHeight: 0,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    WebkitOverflowScrolling: 'touch' as const,
  } as ViewStyle,
  
  stickyHeader: {
    position: 'sticky' as any,
  } as ViewStyle,
  
  horizontalScroll: {
    minHeight: 0,
    overflowX: 'auto' as const,
    overflowY: 'hidden' as const,
    WebkitOverflowScrolling: 'touch' as const,
  } as ViewStyle,
  
  horizontalScrollContainer: {
    minHeight: 0,
  } as ViewStyle,
  
  stickyHeaderScroll: {
    minHeight: 0,
  } as ViewStyle,
};

/**
 * Helper to conditionally apply web styles only after mount
 * Prevents hydration mismatches by ensuring styles are applied consistently
 * 
 * @param isMounted - Whether the component has mounted on the client
 * @param styleKey - Key of the web style to apply
 * @returns Web style object if conditions are met, null otherwise
 */
export const getWebStyles = (
  isMounted: boolean,
  styleKey: keyof typeof webStyles
): ViewStyle | null => {
  if (!isMounted || Platform.OS !== 'web') {
    return null;
  }
  return webStyles[styleKey];
};
