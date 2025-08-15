import { useState, useRef, useCallback } from 'react';

interface SwipeGestureOptions {
  threshold?: number;
  velocity?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeGestureHook {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  isSwiping: boolean;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
}

export function useSwipeGesture(
  handlers: SwipeHandlers,
  options: SwipeGestureOptions = {}
): SwipeGestureHook {
  const {
    threshold = 50,
    velocity = 0.3,
    preventDefaultTouchmoveEvent = false
  } = options;

  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const touchEnd = useRef({ x: 0, y: 0, time: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    setIsSwiping(true);
    setSwipeDirection(null);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
    
    if (!isSwiping) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    
    // Determine primary direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(deltaY > 0 ? 'down' : 'up');
    }
  }, [isSwiping, preventDefaultTouchmoveEvent]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;

    const touch = e.changedTouches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;
    
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    // Check if swipe meets threshold and velocity requirements
    const isHorizontalSwipe = Math.abs(deltaX) > threshold && velocityX > velocity;
    const isVerticalSwipe = Math.abs(deltaY) > threshold && velocityY > velocity;

    if (isHorizontalSwipe) {
      if (deltaX > 0 && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      } else if (deltaX < 0 && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      }
    } else if (isVerticalSwipe) {
      if (deltaY > 0 && handlers.onSwipeDown) {
        handlers.onSwipeDown();
      } else if (deltaY < 0 && handlers.onSwipeUp) {
        handlers.onSwipeUp();
      }
    }

    setIsSwiping(false);
    setSwipeDirection(null);
  }, [isSwiping, handlers, threshold, velocity]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping,
    swipeDirection
  };
}

// Haptic feedback hook for premium feel
export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const triggerSuccess = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]); // Success pattern
    }
  }, []);

  const triggerError = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 20, 50]); // Error pattern
    }
  }, []);

  return {
    triggerHaptic,
    triggerSuccess,
    triggerError
  };
}

export default useSwipeGesture;
