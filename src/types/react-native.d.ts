// Type declarations for react-native during build
// This file provides minimal type definitions for build-time type checking
// Full types come from @types/react-native package
declare module 'react-native' {
  import * as React from 'react';
  
  export interface ViewStyle {
    [key: string]: any;
  }
  
  export const View: React.ComponentType<any>;
  export const ScrollView: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
  export const TouchableOpacity: React.ComponentType<any>;
  export const Image: React.ComponentType<any>;
  export const ActivityIndicator: React.ComponentType<any>;
  export const Pressable: React.ComponentType<any>;
  export const StyleSheet: any;
  export const Dimensions: {
    get: (dimension: string) => { width: number; height: number };
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'web';
  };
  export const useWindowDimensions: () => { width: number; height: number };
  export const PanResponder: any;
  
  export type PanResponderInstance = any;
  export type PanResponderGestureState = {
    dx: number;
    dy: number;
    moveX: number;
    moveY: number;
    numberActiveTouches: number;
    stateID: number;
    vx: number;
    vy: number;
    x0: number;
    y0: number;
  };
  export type NativeSyntheticEvent<T> = any;
  export type NativeTouchEvent = any;
  export type StyleProp<T> = any;
  export type LayoutChangeEvent = {
    nativeEvent: {
      layout: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };
  };
}

