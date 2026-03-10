import { Tabs } from 'expo-router';
import { MessageCircleMore } from 'lucide-react-native';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShadowVisible: false,
    }}>
      <Tabs.Screen name="index" options={{
        title: 'index', tabBarIcon: ({ color, focused }) => (
          <MessageCircleMore />
        ),
      }} />
      <Tabs.Screen name="about" options={{ title: 'About' }} />
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
    </Tabs>
  );
}
