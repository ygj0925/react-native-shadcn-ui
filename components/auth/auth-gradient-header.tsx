import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';

export function AuthGradientHeader() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <LinearGradient
      colors={isDark
        ? ['rgba(109,40,217,0.2)', 'rgba(30,27,75,0.1)']
        : ['rgba(139,92,246,0.2)', 'rgba(167,139,250,0.1)']
      }
      style={StyleSheet.absoluteFill}
    />
  );
}
