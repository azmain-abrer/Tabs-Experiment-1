import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { forwardRef } from 'react';
import { Tab } from '../types';
import CanvasIcon from './CanvasIcon';

/**
 * TabSwitcher Component
 * Displays a grid of all tabs in Safari-style tab switcher view
 * Phase 2a: Initial implementation
 * - Full-screen dark overlay
 * - Grid of tab thumbnails
 * - Tap tab to switch to it and close switcher
 * - Shows tab count in grid
 * Phase 2b: Tab closing
 * - Close button on each tab card
 * - Swipe left to delete functionality
 * - Simplified animations for better performance
 * - Smart tab switching when closing active tab
 */

interface TabSwitcherProps {
  isOpen: boolean;
  tabs: Tab[];
  activeTabId: string | null;
  taskName: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onClose: () => void;
}

export default function TabSwitcher({
  isOpen,
  tabs,
  activeTabId,
  taskName,
  onTabSelect,
  onTabClose,
  onClose,
}: TabSwitcherProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/90"
        >
          {/* Header with task name and tab count */}
          <div className="absolute top-0 left-0 right-0 pt-12 pb-4 px-6">
            <div className="flex items-center justify-between">
              <h2 className="font-['Outfit',_sans-serif] text-white text-xl">
                {taskName}
              </h2>
              <p className="font-['Outfit',_sans-serif] text-white/60">
                {tabs.length} {tabs.length === 1 ? 'Tab' : 'Tabs'}
              </p>
            </div>
          </div>

          {/* Tab Grid */}
          <div className="absolute top-28 left-0 right-0 bottom-20 overflow-y-auto px-4">
            <div className="grid grid-cols-2 gap-4 pb-8">
              <AnimatePresence mode="popLayout">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  
                  return (
                    <TabCardMotion
                      key={tab.id}
                      tab={tab}
                      isActive={isActive}
                      onSelect={() => onTabSelect(tab.id)}
                      onClose={() => onTabClose(tab.id)}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom close button */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 px-6 bg-gradient-to-t from-black/60 to-transparent">
            <button
              onClick={onClose}
              className="w-full h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full font-['Outfit',_sans-serif] text-white transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Separate component for individual tab cards with swipe-to-delete
// Using forwardRef for AnimatePresence compatibility
const TabCardMotion = forwardRef<
  HTMLDivElement,
  { 
    tab: Tab; 
    isActive: boolean; 
    onSelect: () => void; 
    onClose: () => void;
  }
>(({ tab, isActive, onSelect, onClose }, ref) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, -75, 0], [0.5, 0.8, 1]);
  const backgroundColor = useTransform(
    x, 
    [-150, -75, 0], 
    ['rgb(239, 68, 68)', 'rgb(252, 165, 165)', 'rgb(255, 255, 255)']
  );

  const handleDragEnd = (_: any, info: any) => {
    // If dragged more than 100px to the left, delete the tab
    if (info.offset.x < -100) {
      onClose();
    }
  };

  return (
    <motion.div
      ref={ref}
      drag="x"
      dragConstraints={{ left: -150, right: 0 }}
      dragElastic={{ left: 0.2, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, opacity }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      onClick={(e) => {
        // Only select if not currently dragging
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          onSelect();
        }
      }}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg cursor-pointer"
    >
      {/* Background layer with color change */}
      <motion.div 
        style={{ backgroundColor }}
        className="absolute inset-0"
      />

      {/* Content layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        {tab.canvasType ? (
          <>
            <div className="w-12 h-12 mb-3">
              <CanvasIcon canvasType={tab.canvasType} size="large" />
            </div>
            <p className="font-['Outfit',_sans-serif] text-sm text-neutral-700 px-4 text-center capitalize">
              {tab.name}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mb-3 rounded-full bg-neutral-200 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="#737373" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-['Outfit',_sans-serif] text-sm text-neutral-500 px-4 text-center">
              {tab.name}
            </p>
          </>
        )}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute inset-0 border-4 border-blue-500 rounded-2xl pointer-events-none" />
      )}

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Delete indicator - shows when dragged left */}
      <motion.div
        style={{ opacity: useTransform(x, [-100, -50, 0], [1, 0.5, 0]) }}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </motion.div>
  );
});

// Add display name for better debugging
TabCardMotion.displayName = 'TabCardMotion';
