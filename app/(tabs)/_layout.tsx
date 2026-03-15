import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useWindowDimensions } from 'react-native';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerShadowVisible: true,
        tabBarPosition: isLargeScreen ? 'left' : 'bottom',
        tabBarVariant: isLargeScreen ? 'material' : 'uikit',
        tabBarLabelPosition: isLargeScreen ? 'below-icon' : 'beside-icon',
        tabBarStyle: isLargeScreen
          ? {
              width: 108,
              paddingTop: 12,
              paddingBottom: 12,
            }
          : {
              height: 64,
              paddingTop: 6,
              paddingBottom: 6,
            },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="chatbox-ellipses" size={20} color={iconColor} />
            ) : (
              <Ionicons name="chatbox-ellipses-outline" size={20} color={iconColor} />
            ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <FontAwesome name="search" size={20} color={iconColor} />
            ) : (
              <Feather name="search" size={20} color={iconColor} />
            ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialCommunityIcons name="creation" size={20} color={iconColor} />
            ) : (
              <MaterialCommunityIcons name="creation-outline" size={20} color={iconColor} />
            ),
        }}
      />
      <Tabs.Screen
        name="love"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialCommunityIcons name="clover" size={20} color={iconColor} />
            ) : (
              <MaterialCommunityIcons name="clover-outline" size={20} color={iconColor} />
            ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: 'My',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <FontAwesome5 name="user-alt" size={20} color={iconColor} />
            ) : (
              <FontAwesome5 name="user" size={20} color={iconColor} />
            ),
        }}
      />
    </Tabs>
  );
}
