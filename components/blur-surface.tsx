import * as React from 'react';
import { Platform, View, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView, type BlurTint } from 'expo-blur';
import { useColorScheme } from 'nativewind';

type BlurSurfaceProps = ViewProps & {
  intensity?: number;
  tint?: BlurTint;
  style?: ViewStyle | ViewStyle[];
};

/**
 * Cross-platform frosted glass surface.
 *
 * - iOS: native BlurView with system chrome material
 * - Android / Web: semi-transparent background fallback (expo-blur also has a
 *   reasonable web implementation, but we keep a className fallback so that
 *   NativeWind dark mode and theming stay consistent).
 */
export function BlurSurface({
  intensity = 80,
  tint,
  className,
  style,
  children,
  ...rest
}: BlurSurfaceProps) {
  const { colorScheme } = useColorScheme();

  if (Platform.OS === 'ios') {
    const resolvedTint: BlurTint =
      tint ?? (colorScheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight');
    return (
      <BlurView intensity={intensity} tint={resolvedTint} style={style} {...rest}>
        {children}
      </BlurView>
    );
  }

  return (
    <View className={`bg-background/85 ${className ?? ''}`} style={style} {...rest}>
      {children}
    </View>
  );
}
