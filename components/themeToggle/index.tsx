import * as React from 'react';
import { Button } from '@/components/ui/button';
import { THEME } from '@/lib/theme';
import Feather from '@expo/vector-icons/Feather';
import { useColorScheme } from 'nativewind';

const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const iconColor = THEME[scheme].foreground;

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="rounded-full ios:size-9 web:mx-4">
      <Feather name={scheme === 'dark' ? 'moon' : 'sun'} size={20} color={iconColor} />
    </Button>
  );
};

export { ThemeToggle };
