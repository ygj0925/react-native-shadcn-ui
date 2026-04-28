import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, TextInput, View, type TextInputProps } from 'react-native';

type InputProps = TextInputProps &
  React.RefAttributes<TextInput> & {
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
  };

const outerClassName =
  'dark:bg-input/30 border-input bg-background flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 shadow-sm shadow-black/5 sm:h-9';

const outerWebClassName = cn(
  'transition-[color,box-shadow]',
  'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
);

function Input({ className, startAdornment, endAdornment, ...props }: InputProps) {
  const hasAdornment = !!startAdornment || !!endAdornment;

  if (hasAdornment) {
    return (
      <View
        className={cn(
          outerClassName,
          props.editable === false &&
            cn(
              'opacity-50',
              Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
            ),
          Platform.select({ web: outerWebClassName }),
          className
        )}>
        {startAdornment}
        <TextInput
          className={cn(
            'text-foreground flex-1 h-full py-1 text-base leading-5 md:text-sm',
            Platform.select({
              web: cn(
                'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none'
              ),
              native: 'placeholder:text-muted-foreground/50',
            })
          )}
          {...props}
        />
        {endAdornment}
      </View>
    );
  }

  return (
    <TextInput
      className={cn(
        'dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
        props.editable === false &&
          cn(
            'opacity-50',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
          ),
        Platform.select({
          web: cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
          ),
          native: 'placeholder:text-muted-foreground/50',
        }),
        className
      )}
      {...props}
    />
  );
}

export { Input };
