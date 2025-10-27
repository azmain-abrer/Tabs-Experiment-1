import { useRef, useState, useCallback, ReactNode, useEffect } from 'react';

/**
 * DraggableAddressBar Component
 * Wraps the ActiveTab address bar to add drag interactions
 * Phase 1: Horizontal drag implementation
 * - Drag left/right to switch tabs
 * - Drag left on last tab to create new tab
 * - Drag right on first tab for rubber band effect
 * Phase 2a: Vertical drag implementation
 * - Drag up to open tab switcher (60px threshold)
 * - Direction locking to prevent diagonal drags
 */

interface DraggableAddressBarProps {
  children: ReactNode;
  isFirstTab: boolean;
  isLastTab: boolean;
  isSingleTab: boolean;
  onSwipeLeft: () => void;  // Navigate to next tab or create new tab
  onSwipeRight: () => void; // Navigate to previous tab
  onSwipeUp?: () => void;   // Open tab switcher
  className?: string;
}

export default function DraggableAddressBar({
  children,
  isFirstTab,
  isLastTab,
  isSingleTab,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  className = '',
}: DraggableAddressBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const dragStartY = useRef<number>(0);
  const dragCurrentX = useRef<number>(0);
  const dragCurrentY = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragDirectionRef = useRef<'horizontal' | 'vertical' | null>(null);
  const mouseHandlersRef = useRef<{
    move: ((e: MouseEvent) => void) | null;
    up: ((e: MouseEvent) => void) | null;
  }>({ move: null, up: null });
  
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const SWIPE_THRESHOLD = 60; // pixels to trigger action
  const DIRECTION_THRESHOLD = 15; // pixels to determine drag direction
  const RUBBER_BAND_RESISTANCE = 3; // resistance factor for rubber band

  // Attach native touch listeners with passive: false to ensure preventDefault works
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
      }
    };

    // Use { passive: false } to allow preventDefault on touchmove
    container.addEventListener('touchmove', handleNativeTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchmove', handleNativeTouchMove);
    };
  }, []);

  // Cleanup mouse listeners on unmount
  useEffect(() => {
    return () => {
      if (mouseHandlersRef.current.move) {
        window.removeEventListener('mousemove', mouseHandlersRef.current.move);
      }
      if (mouseHandlersRef.current.up) {
        window.removeEventListener('mouseup', mouseHandlersRef.current.up);
      }
    };
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    // Prevent duplicate start events
    if (isDraggingRef.current) {
      return;
    }
    
    isDraggingRef.current = true;
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    dragCurrentX.current = clientX;
    dragCurrentY.current = clientY;
    dragDirectionRef.current = null; // Reset direction
    setOffsetX(0);
    setOffsetY(0);
    setIsAnimating(false);
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;

    dragCurrentX.current = clientX;
    dragCurrentY.current = clientY;
    
    const deltaX = clientX - dragStartX.current;
    const deltaY = clientY - dragStartY.current;

    // Determine drag direction on first significant movement
    if (dragDirectionRef.current === null) {
      if (Math.abs(deltaX) > DIRECTION_THRESHOLD || Math.abs(deltaY) > DIRECTION_THRESHOLD) {
        // Lock to the dominant direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          dragDirectionRef.current = 'horizontal';
        } else {
          dragDirectionRef.current = 'vertical';
        }
      }
    }

    // Only apply offset in the locked direction
    if (dragDirectionRef.current === 'horizontal') {
      let newOffsetX = deltaX;

      // Apply rubber band effect when dragging right on first/single tab
      if ((isFirstTab || isSingleTab) && deltaX > 0) {
        newOffsetX = deltaX / RUBBER_BAND_RESISTANCE;
      }

      setOffsetX(newOffsetX);
      setOffsetY(0);
    } else if (dragDirectionRef.current === 'vertical') {
      // For vertical, only allow upward drag (negative deltaY)
      const newOffsetY = deltaY < 0 ? deltaY : 0;
      setOffsetY(newOffsetY);
      setOffsetX(0);
    }
  }, [isFirstTab, isSingleTab, DIRECTION_THRESHOLD]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) {
      return;
    }

    const deltaX = dragCurrentX.current - dragStartX.current;
    const deltaY = dragCurrentY.current - dragStartY.current;
    const dragDirection = dragDirectionRef.current;

    // Clear dragging state FIRST
    isDraggingRef.current = false;
    dragDirectionRef.current = null;
    
    setIsAnimating(true);
    setOffsetX(0);
    setOffsetY(0);

    // Handle horizontal swipe
    if (dragDirection === 'horizontal' && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        // Swiped left - go to next tab or create new tab
        onSwipeLeft();
      } else if (deltaX > 0 && !isFirstTab && !isSingleTab) {
        // Swiped right - go to previous tab (only if not first/single)
        onSwipeRight();
      }
    }
    
    // Handle vertical swipe (upward)
    if (dragDirection === 'vertical' && deltaY < 0 && Math.abs(deltaY) > SWIPE_THRESHOLD) {
      // Swiped up - open tab switcher
      if (onSwipeUp) {
        onSwipeUp();
      }
    }
  }, [isFirstTab, isLastTab, isSingleTab, onSwipeLeft, onSwipeRight, onSwipeUp, SWIPE_THRESHOLD]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Prevent default to stop compatibility mouse events and scrolling
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    // ALWAYS prevent default to stop scrolling interference
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start drag if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    // Remove any existing listeners first
    if (mouseHandlersRef.current.move) {
      window.removeEventListener('mousemove', mouseHandlersRef.current.move);
    }
    if (mouseHandlersRef.current.up) {
      window.removeEventListener('mouseup', mouseHandlersRef.current.up);
    }
    
    handleDragStart(e.clientX, e.clientY);

    // Create new handlers
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      moveEvent.preventDefault();
      handleDragMove(moveEvent.clientX, moveEvent.clientY);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault();
      handleDragEnd();
      
      // Clean up listeners
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mouseHandlersRef.current.move = null;
      mouseHandlersRef.current.up = null;
    };

    // Store handlers and add listeners
    mouseHandlersRef.current.move = handleMouseMove;
    mouseHandlersRef.current.up = handleMouseUp;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  // Calculate transform for visual feedback
  const transform = `translate(${offsetX}px, ${offsetY}px)`;

  // Transition style - smooth when animating, instant when dragging
  const transition = isAnimating 
    ? 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)' 
    : 'none';

  return (
    <div
      ref={containerRef}
      className={`touch-none select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{
        transform,
        transition,
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        touchAction: 'none', // Explicit CSS to prevent all touch behaviors
      }}
    >
      {children}
    </div>
  );
}
