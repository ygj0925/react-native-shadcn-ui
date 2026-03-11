import { Tabs } from 'expo-router';
import { MessageCircleMore } from 'lucide-react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useColorScheme } from 'nativewind';
export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <Tabs screenOptions={{
      headerShadowVisible: true,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'index',
          tabBarIcon: ({ color, focused }) => (
            focused ? (
              <Ionicons name="chatbox-ellipses" size={20} color={colorScheme === 'dark' ? "white" : "black"} />
            ) : (
              <Ionicons name="chatbox-ellipses-outline" size={20} color={colorScheme === 'dark' ? "white" : "black"} />
            )
          ),
        }} />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            focused ? (
              <FontAwesome name="search" size={20} color={colorScheme === 'dark' ? "white" : "black"} />
            ) : (
              <Feather name="search" size={20} color={colorScheme === 'dark' ? "white" : "black"} />
            )
          ),
        }} />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            focused ? (
              <MaterialCommunityIcons name="creation" size={20} color={colorScheme === 'dark' ? "white" : "black"} />
            ) : (
              <MaterialCommunityIcons name="creation-outline" size={20} color={colorScheme === 'dark' ? "white" : "black"} />
            )
          ),
        }} />
      <Tabs.Screen
        name="love"
        options={{
          title: 'Love',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            focused ? (
              <MaterialCommunityIcons name="clover" size={20} color={colorScheme === 'dark' ? "white" : "black"} />
            ) : (
              <MaterialCommunityIcons name="clover-outline" size={20} color={colorScheme === 'dark' ? "white" : "black"} />
            )
          ),
        }} />
      <Tabs.Screen
        name="my"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            focused ? (
              <FontAwesome5 name="user-alt" size={20} color={colorScheme === 'dark' ? "white" : "black"} />
            ) : (
              <FontAwesome5 name="user" size={20} color={colorScheme === 'dark' ? "white" : "black"} />
            )
          ),
        }} />
    </Tabs>
  );
}
