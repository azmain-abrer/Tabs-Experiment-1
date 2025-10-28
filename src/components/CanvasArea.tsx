import { useState, useEffect, useRef } from 'react';
import { motion, MotionValue, useMotionValue } from 'motion/react';
import { Tab } from '../types';
import BlankTab from './BlankTab';

/**
 * CanvasArea Component
 * Handles sliding canvas content synchronized with address bar
 * Phase 1f: Position-based animation using shared dragProgress MotionValue
 */

interface CanvasAreaProps {
  tabs: Tab[];
  activeTabId: string;
  dragProgress: MotionValue<number>;
  dragDirection: 'left' | 'right' | null;
  dragDirectionRef: React.RefObject<'left' | 'right' | null>;
  onCanvasTypeSelect: (type: 'doc' | 'sheet' | 'comm' | 'chat') => void;
}

export default function CanvasArea({
  tabs,
  activeTabId,
  dragProgress,
  dragDirection,
  dragDirectionRef,
  onCanvasTypeSelect,
}: CanvasAreaProps) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 390
  );

  // Displayed tab index (lags during drag for smooth visual transition)
  const activeIndex = tabs.findIndex(t => t.id === activeTabId);
  const [displayedTabIndex, setDisplayedTabIndex] = useState(activeIndex);
  
  // Track last drag direction for showing adjacent tab during transition
  const lastDragDirectionRef = useRef<'left' | 'right' | null>(null);
  const previewNewTabIdRef = useRef(`preview-new-${Date.now()}`);

  // Track if there's meaningful drag progress (prevents flash at drag start)
  const [hasDragProgress, setHasDragProgress] = useState(false);

  // Update displayed index only when not dragging
  useEffect(() => {
    if (!dragDirection) {
      setDisplayedTabIndex(activeIndex);
      lastDragDirectionRef.current = null;
      previewNewTabIdRef.current = `preview-new-${Date.now()}`;
    }
  }, [activeIndex, dragDirection]);

  // Stable motion values for canvas positions
  const currentTabXRef = useRef(useMotionValue(0));
  const adjacentTabXRef = useRef(useMotionValue(0));
  const currentTabX = currentTabXRef.current;
  const adjacentTabX = adjacentTabXRef.current;

  // Use the passed ref for immediate direction access (avoids timing issues)

  const screenWidth = viewportWidth;

  // Update positions based on drag progress (identical to TabBar logic)
  useEffect(() => {
    const updatePositions = (progress: number) => {
      const direction = dragDirectionRef.current;
      if (direction === 'left') {
        currentTabX.set(-progress * screenWidth);
        adjacentTabX.set(screenWidth - (progress * screenWidth));
      } else if (direction === 'right') {
        currentTabX.set(progress * screenWidth);
        adjacentTabX.set(-screenWidth + (progress * screenWidth));
      } else {
        currentTabX.set(0);
        adjacentTabX.set(0);
      }
      
      // Update drag progress state to control visibility (prevents flash)
      setHasDragProgress(progress > 0.01);
    };

    updatePositions(dragProgress.get());
    const unsubscribe = dragProgress.on('change', updatePositions);
    return () => unsubscribe();
  }, [dragProgress, screenWidth, currentTabX, adjacentTabX, dragDirectionRef]);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current and adjacent tabs
  const currentTab = tabs[displayedTabIndex];
  const targetTab = tabs[activeIndex];

  const effectiveDragDirection = dragDirection || lastDragDirectionRef.current;
  // Only show adjacent tab when there's actual drag progress (prevents flash at drag start)
  const showAdjacentTab = (effectiveDragDirection !== null && hasDragProgress) || displayedTabIndex !== activeIndex;

  const adjacentTab = effectiveDragDirection === 'right' && displayedTabIndex > 0 
    ? tabs[displayedTabIndex - 1]
    : effectiveDragDirection === 'left'
    ? (displayedTabIndex < tabs.length - 1 
        ? tabs[displayedTabIndex + 1] 
        : { 
            id: previewNewTabIdRef.current, 
            name: 'Blank Tab', 
            canvasType: null, 
            createdAt: Date.now(), 
            isActive: false, 
            commentCount: 0 
          } as Tab)
    : targetTab;

  // Update last drag direction when transitioning
  useEffect(() => {
    if (dragDirection) {
      lastDragDirectionRef.current = dragDirection;
    }
  }, [dragDirection]);

  // Render canvas content based on tab
  const renderCanvasContent = (tab: Tab | null) => {
    if (!tab) return null;

    // Blank tab
    if (tab.canvasType === null) {
      return <BlankTab onCanvasTypeSelect={onCanvasTypeSelect} />;
    }

    // Canvas type placeholders
    if (tab.canvasType === 'doc') {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="font-['Outfit',_sans-serif] text-neutral-500">
            Doc Canvas (Coming Soon)
          </p>
        </div>
      );
    }
    
    if (tab.canvasType === 'sheet') {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="font-['Outfit',_sans-serif] text-neutral-500">
            Sheet Canvas (Coming Soon)
          </p>
        </div>
      );
    }
    
    if (tab.canvasType === 'comm') {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="font-['Outfit',_sans-serif] text-neutral-500">
            Comm Canvas (Coming Soon)
          </p>
        </div>
      );
    }
    
    if (tab.canvasType === 'chat') {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="font-['Outfit',_sans-serif] text-neutral-500">
            Chat Canvas (Coming Soon)
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Current tab content */}
      <motion.div
        className="absolute inset-0"
        style={{ x: currentTabX, willChange: 'transform' }}
      >
        {renderCanvasContent(currentTab)}
      </motion.div>

      {/* Adjacent tab content (previous or next) */}
      {showAdjacentTab && adjacentTab && (
        <motion.div
          className="absolute inset-0"
          style={{ x: adjacentTabX, willChange: 'transform' }}
        >
          {renderCanvasContent(adjacentTab)}
        </motion.div>
      )}
    </div>
  );
}
