import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlatList, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const BOTTOM_THRESHOLD = 50;

export function useAutoScroll(isRunning: boolean) {
  const flatListRef = useRef<FlatList>(null);
  const isAtBottomRef = useRef(true);
  const isDraggingRef = useRef(false);
  const layoutHeightRef = useRef(0);
  const prevIsRunningRef = useRef(isRunning);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const updateBottomState = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      const dist = contentSize.height - contentOffset.y - layoutMeasurement.height;
      const atBottom = dist <= BOTTOM_THRESHOLD;
      if (isAtBottomRef.current !== atBottom) {
        isAtBottomRef.current = atBottom;
        setShowScrollButton(!atBottom);
      }
    },
    [],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isDraggingRef.current = false;
      updateBottomState(e);
    },
    [updateBottomState],
  );

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    layoutHeightRef.current = e.nativeEvent.layout.height;
  }, []);

  const handleContentSizeChange = useCallback((_w: number, h: number) => {
    if (isAtBottomRef.current && !isDraggingRef.current) {
      const offset = Math.max(0, h - layoutHeightRef.current);
      flatListRef.current?.scrollToOffset({ offset, animated: false });
    }
  }, []);

  useEffect(() => {
    if (!isRunning && prevIsRunningRef.current && isAtBottomRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
    prevIsRunningRef.current = isRunning;
  }, [isRunning]);

  const scrollToBottom = useCallback(() => {
    isDraggingRef.current = false;
    isAtBottomRef.current = true;
    setShowScrollButton(false);
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  return {
    flatListRef,
    showScrollButton,
    scrollToBottom,
    scrollProps: {
      scrollEventThrottle: 16,
      onLayout: handleLayout,
      onScrollBeginDrag: handleScrollBeginDrag,
      onScrollEndDrag: handleScrollEndDrag,
      onScroll: updateBottomState,
      onMomentumScrollEnd: updateBottomState,
      onContentSizeChange: handleContentSizeChange,
    },
  };
}
