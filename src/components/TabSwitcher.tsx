import { motion, AnimatePresence } from 'motion/react';
import { forwardRef } from 'react';
import { Tab } from '../types';
import svgPaths from '../imports/svg-hk6v9dtb4t';

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
 * - Swipe left to delete functionality (REMOVED)
 * - Simplified animations for better performance
 * - Smart tab switching when closing active tab
 * Phase 2c: New tab creation
 * - Added "New Tab" button to create tabs from switcher
 * - Removed swipe-to-delete, keeping only close button
 */

interface TabSwitcherProps {
  isOpen: boolean;
  tabs: Tab[];
  activeTabId: string | null;
  taskName: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onClose: () => void;
}

export default function TabSwitcher({
  isOpen,
  tabs,
  activeTabId,
  taskName,
  onTabSelect,
  onTabClose,
  onNewTab,
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
          className="fixed inset-0 z-[100] bg-black"
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

          {/* Bottom action buttons */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 px-6 bg-black">
            <div className="flex gap-3">
              {/* New Tab Button */}
              <button
                onClick={() => {
                  onNewTab();
                  onClose();
                }}
                className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 backdrop-blur-md rounded-full font-['Outfit',_sans-serif] text-white transition-colors text-center flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                New Tab
              </button>
              
              {/* Done Button */}
              <button
                onClick={onClose}
                className="flex-1 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full font-['Outfit',_sans-serif] text-white transition-colors text-center"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Separate component for individual tab cards
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
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="relative cursor-pointer flex flex-col items-center gap-3"
    >
      {/* Tab Card Rectangle */}
      <div 
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('button')) {
            onSelect();
          }
        }}
        className="relative aspect-[3/4] w-40 rounded-2xl overflow-hidden shadow-lg"
      >
        {/* Content layer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
          {/* Render appropriate canvas icon */}
          {tab.canvasType === 'doc' && (
            <svg width="64" height="72" viewBox="0 0 63 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d={svgPaths.p2b3600}
                fill="#0A84FF"
              />
            </svg>
          )}
          
          {tab.canvasType === 'sheet' && (
            <svg width="64" height="72" viewBox="0 0 63 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d={svgPaths.p21295200}
                fill="#34C759"
              />
            </svg>
          )}
          
          {tab.canvasType === 'comm' && (
            <svg width="64" height="72" viewBox="0 0 63 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path 
                  clipRule="evenodd"
                  d={svgPaths.p3b07a100}
                  fill="#FF453A"
                  fillRule="evenodd"
                />
                <path 
                  d={svgPaths.p32a7aa80}
                  fill="#FF453A"
                />
              </g>
            </svg>
          )}
          
          {tab.canvasType === 'chat' && (
            <svg width="64" height="72" viewBox="0 0 63 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d={svgPaths.p129b9600}
                fill="#BF5AF2"
              />
            </svg>
          )}
          
          {!tab.canvasType && (
            <svg width="64" height="72" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M10.2846 3.9375V0.5625C10.2846 0.2475 10.0332 0 9.71322 0H1.14273C0.514229 0 0 0.50625 0 1.125V16.875C0 17.4938 0.514229 18 1.14273 18H14.8555C15.484 18 15.9982 17.4938 15.9982 16.875V6.1875C15.9982 5.8725 15.7468 5.625 15.4269 5.625H11.9987C11.0502 5.625 10.2846 4.87125 10.2846 3.9375ZM11.4273 0.5625V3.375C11.4273 3.99375 11.9415 4.5 12.57 4.5H15.4269C15.9411 4.5 16.1925 3.8925 15.8268 3.54375L12.3986 0.16875C12.0444 -0.19125 11.4273 0.0674999 11.4273 0.5625Z" 
                fill="#8E8E93"
              />
            </svg>
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
          className="absolute top-2 right-2 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10 bg-[rgb(245,88,88)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Tab Name - positioned below the card */}
      <p className="font-['Outfit',_sans-serif] text-sm text-white px-4 text-center capitalize w-full overflow-hidden text-ellipsis whitespace-nowrap text-[16px]">
        {tab.name}
      </p>
    </motion.div>
  );
});

// Add display name for better debugging
TabCardMotion.displayName = 'TabCardMotion';
