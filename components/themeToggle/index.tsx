import * as React from 'react';
import { Button } from '@/components/ui/button';
import Feather from '@expo/vector-icons/Feather';
import { useColorScheme } from 'nativewind';

const THEME_ICONS = {
  light: <Feather name="sun" size={20} color="black" />,
  dark: <Feather name="moon" size={20} color="white" />,
};

const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="rounded-full ios:size-9 web:mx-4">
      {THEME_ICONS[colorScheme ?? 'light']}
    </Button>
  );
}

export { ThemeToggle };
