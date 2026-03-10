import { Text, View, StyleSheet } from 'react-native';
import { ThemeToggle } from '@/components/themeToggle';
import { Link, Stack, useRouter } from 'expo-router';

const SCREEN_OPTIONS = {
  title: 'Index',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

export default function Index() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View style={styles.container}>
        <Text className="font-mono text-sm ios:text-foreground text-muted-foreground">Home screen</Text>
        <Link href="/about" className="font-mono text-sm ios:text-foreground text-muted-foreground">
          Go to About screen
        </Link>
      </View>
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
