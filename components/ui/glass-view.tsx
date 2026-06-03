import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';
import { View, type ViewProps } from 'react-native';

interface GlassViewProps extends ViewProps {
  /** Blur intensity, 0-100. Default: 25 */
  intensity?: number;
  /** Override the auto-detected tint */
  tint?: 'light' | 'dark';
  /** Additional class for the inner View */
  innerClassName?: string;
}

/**
 * 毛玻璃容器组件
 *
 * 使用 expo-blur 实现原生模糊效果，自动适配 light/dark 模式。
 * Light Mode: 白色半透明背景
 * Dark Mode: 深色半透明背景
 */
export function GlassView({
  intensity = 25,
  tint,
  style,
  className,
  innerClassName,
  children,
  ...props
}: GlassViewProps) {
  const { colorScheme } = useColorScheme();
  const resolvedTint = tint ?? (colorScheme === 'dark' ? 'dark' : 'light');

  return (
    <BlurView
      intensity={intensity}
      tint={resolvedTint}
      style={[{ overflow: 'hidden' }, style]}
    >
      <View
        className={className}
        {...props}
      >
        {children}
      </View>
    </BlurView>
  );
}

interface GlassCardProps extends ViewProps {
  /** Blur intensity, 0-100. Default: 25 */
  intensity?: number;
  /** Override the auto-detected tint */
  tint?: 'light' | 'dark';
}

/**
 * 毛玻璃卡片组件
 *
 * 带圆角和边框的毛玻璃容器，适合用于卡片式布局。
 */
export function GlassCard({
  intensity = 25,
  tint,
  style,
  className,
  children,
  ...props
}: GlassCardProps) {
  const { colorScheme } = useColorScheme();
  const resolvedTint = tint ?? (colorScheme === 'dark' ? 'dark' : 'light');
  const bgClass = colorScheme === 'dark' ? 'bg-black/40' : 'bg-white/70';
  const borderClass = colorScheme === 'dark' ? 'border-white/10' : 'border-black/5';

  return (
    <BlurView
      intensity={intensity}
      tint={resolvedTint}
      style={[
        {
          overflow: 'hidden',
          borderRadius: 16,
        },
        style,
      ]}
    >
      <View
        className={`${bgClass} ${borderClass} border rounded-2xl ${className ?? ''}`}
        {...props}
      >
        {children}
      </View>
    </BlurView>
  );
}
