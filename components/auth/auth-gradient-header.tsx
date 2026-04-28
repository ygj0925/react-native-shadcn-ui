import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function AuthGradientHeader() {
  return (
    <LinearGradient
      colors={['rgba(232,213,245,0.6)', 'rgba(240,224,247,0.3)']}
      style={StyleSheet.absoluteFill}
    />
  );
}
