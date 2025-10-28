import { useState, useEffect, useRef } from 'react';
import { motion, MotionValue, useMotionValue } from 'motion/react';
import { Tab } from '../types';
import CanvasIcon from './CanvasIcon';
import svgPaths from '../imports/svg-52gs2ctpyt';
import imgBorder from 'figma:asset/fe0d9e45bec9572f879783d0ba7961b8fc734caa.png';

/**
 * TabBar component with synchronized sliding animations
 * Phase 1f: Implements position-based animation using shared dragProgress MotionValue
 * Phase 2a: Added vertical swipe detection for tab switcher activation
 * Updated: Added inactive tab indicators for left/right tabs
 */

interface TabBarProps {
  taskName: string;
  tabs: Tab[];
  activeTabId: string;
  tabCount: number;
  dragProgress: MotionValue<number>;
  dragDirection: 'left' | 'right' | null;
  dragDirectionRef: React.RefObject<'left' | 'right' | null>;
  isTransitioning: boolean;
  onSwipeStart: (clientX: number) => boolean;
  onSwipeMove: (clientX: number) => void;
  onSwipeEnd: () => void;
  onTabNameChange: (tabId: string, newName: string) => void;
  onTaskNameChange: (newName: string) => void;
  onSwitcherToggle: () => void;
  onSwipeUp: () => void;
  isFirstTab: boolean;
  isLastTab: boolean;
  isSingleTab: boolean;
}

export default function TabBar({ 
  taskName, 
  tabs,
  activeTabId,
  tabCount, 
  dragProgress,
  dragDirection,
  dragDirectionRef,
  isTransitioning,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
  onTabNameChange,
  onTaskNameChange,
  onSwitcherToggle,
  onSwipeUp,
  isFirstTab,
  isLastTab,
  isSingleTab,
}: TabBarProps) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 390
  );

  // Editing state for tab name
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [textWidth, setTextWidth] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Displayed tab index (lags during drag for smooth visual transition)
  const activeIndex = tabs.findIndex(t => t.id === activeTabId);
  const [displayedTabIndex, setDisplayedTabIndex] = useState(activeIndex);

  // Track if there's meaningful drag progress (prevents flash at drag start)
  const [hasDragProgress, setHasDragProgress] = useState(false);

  // Update displayed index only when not dragging
  useEffect(() => {
    if (!dragDirection) {
      setDisplayedTabIndex(activeIndex);
    }
  }, [activeIndex, dragDirection]);

  // Reset editing state when active tab changes or when dragging starts
  useEffect(() => {
    setIsEditing(false);
    setEditingText('');
  }, [activeTabId]);

  // Exit editing mode when drag starts
  useEffect(() => {
    if (dragDirection && isEditing) {
      setIsEditing(false);
      setEditingText('');
    }
  }, [dragDirection, isEditing]);



  // Stable motion values for address bar positions
  const currentTabXRef = useRef(useMotionValue(0));
  const adjacentTabXRef = useRef(useMotionValue(0));
  const currentTabX = currentTabXRef.current;
  const adjacentTabX = adjacentTabXRef.current;

  // Use the passed ref for immediate direction access (avoids timing issues)

  const screenWidth = viewportWidth;

  // Update positions based on drag progress
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
  const adjacentTab = dragDirection === 'right' && displayedTabIndex > 0 
    ? tabs[displayedTabIndex - 1]
    : dragDirection === 'left'
    ? (displayedTabIndex < tabs.length - 1 
        ? tabs[displayedTabIndex + 1] 
        : { id: `preview-${Date.now()}`, name: 'Blank Tab', canvasType: null, createdAt: Date.now(), isActive: false, commentCount: 0 })
    : null;

  // Only show adjacent tab when there's actual drag progress (prevents flash at drag start)
  const showAdjacentTab = dragDirection !== null && hasDragProgress;

  // Measure text width when editing changes or text changes
  useEffect(() => {
    if (measureRef.current) {
      const width = measureRef.current.offsetWidth;
      setTextWidth(width);
    }
  }, [isEditing, editingText, currentTab?.name]);

  // Gesture tracking
  const isGestureActiveRef = useRef(false);
  const clickStartPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const clickTargetRef = useRef<EventTarget | null>(null);
  const dragDirectionLockRef = useRef<'horizontal' | 'vertical' | null>(null);
  const hasTriggeredSwipeUpRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Block all gestures during transitions
    if (isTransitioning) {
      return;
    }
    
    isGestureActiveRef.current = true;
    clickStartPosRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    clickTargetRef.current = e.target;
    dragDirectionLockRef.current = null;
    hasTriggeredSwipeUpRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isGestureActiveRef.current || isTransitioning) return;
    
    const deltaX = e.clientX - clickStartPosRef.current.x;
    const deltaY = e.clientY - clickStartPosRef.current.y;
    
    // Determine drag direction lock on first significant movement
    if (dragDirectionLockRef.current === null) {
      if (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15) {
        // Lock to dominant direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          dragDirectionLockRef.current = 'horizontal';
        } else {
          dragDirectionLockRef.current = 'vertical';
        }
      }
    }
    
    // Handle horizontal swipe
    if (dragDirectionLockRef.current === 'horizontal') {
      if (!hasDraggedRef.current && Math.abs(deltaX) > 5) {
        hasDraggedRef.current = true;
        const started = onSwipeStart(clickStartPosRef.current.x);
        if (started) {
          onSwipeMove(e.clientX);
        }
      } else if (hasDraggedRef.current) {
        onSwipeMove(e.clientX);
      }
    }
    
    // Handle vertical swipe (upward)
    if (dragDirectionLockRef.current === 'vertical') {
      hasDraggedRef.current = true;
      // Trigger swipe up if dragging upward past threshold
      if (deltaY < -60 && !hasTriggeredSwipeUpRef.current) {
        hasTriggeredSwipeUpRef.current = true;
        onSwipeUp();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isGestureActiveRef.current) return;
    
    const wasClick = !hasDraggedRef.current && !dragDirection;
    const wasDragging = hasDraggedRef.current;
    const wasHorizontalDrag = dragDirectionLockRef.current === 'horizontal';
    const target = clickTargetRef.current;
    
    // Release pointer capture
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    
    // Clean up gesture state
    isGestureActiveRef.current = false;
    hasDraggedRef.current = false;
    clickTargetRef.current = null;
    dragDirectionLockRef.current = null;
    hasTriggeredSwipeUpRef.current = false;
    
    // End swipe gesture ONLY if we were actually dragging horizontally
    if (wasDragging && wasHorizontalDrag) {
      onSwipeEnd();
    }
    
    // Only check for name click if this was a true click (no drag at all)
    if (wasClick && currentTab && !isEditing) {
      const clickedOnName = target instanceof Element && (
        target.classList.contains('tab-name-text') ||
        target.closest('.tab-name-text') !== null
      );
      
      if (clickedOnName) {
        // Use setTimeout to avoid interfering with drag end logic
        setTimeout(() => {
          setIsEditing(true);
          setEditingText(currentTab.name);
          setOriginalName(currentTab.name);
        }, 0);
      }
    }
  };

  // Tab name editing handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };

  const handleInputPointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    // Prevent drag gesture from starting when clicking on input
    e.stopPropagation();
  };

  const handleNameBlur = () => {
    saveTabName();
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTabName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setEditingText('');
    }
  };

  const saveTabName = () => {
    if (!currentTab) return;
    
    const trimmedName = editingText.trim();
    
    // If empty or unchanged, keep original name
    if (trimmedName === '' || trimmedName === originalName) {
      setIsEditing(false);
      setEditingText('');
      return;
    }
    
    // Save the new name
    onTabNameChange(currentTab.id, trimmedName);
    setIsEditing(false);
    setEditingText('');
  };

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const tabBarHeight = 185; // 151px content + 34px safe area

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 ${isTransitioning ? 'pointer-events-none' : ''}`}
      style={{ height: `${tabBarHeight}px` }}
    >
      <div className="backdrop-blur-[5px] backdrop-filter bg-[rgba(255,255,255,0.8)] relative size-full">
        <div aria-hidden="true" className="absolute border-[#f2f2f7] border-[1px_0px_0px] border-solid bottom-0 left-0 pointer-events-none right-0 top-[-0.5px]" />
        
        {/* Tab Actions */}
        <TabActions tabCount={tabCount} onSwitcherClick={onSwitcherToggle} />
        
        {/* Tab Switcher with sliding address bars */}
        <div className="absolute h-[51px] left-0 overflow-hidden right-0 top-[27px] p-[0px]" style={{ touchAction: 'none' }} data-name="Tab-Switcher">
          {/* Left indicator - shows when there are tabs to the left */}
          {!isFirstTab && !dragDirection && (
            <InactiveTabIndicator 
              direction="left" 
              tab={tabs[tabs.findIndex(t => t.id === activeTabId) - 1]} 
            />
          )}

          {/* Right indicator - shows when there are tabs to the right */}
          {!isLastTab && !dragDirection && (
            <InactiveTabIndicator 
              direction="right" 
              tab={tabs[tabs.findIndex(t => t.id === activeTabId) + 1]} 
            />
          )}

          {/* Current tab address bar */}
          <motion.div
            className="absolute h-[51px] left-[40px] right-[40px] top-1/2 translate-y-[-50%]"
            style={{ x: currentTabX, willChange: 'transform' }}
          >
            <div 
              className="bg-white h-full rounded-[100px] cursor-pointer"
              style={{ touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div className="overflow-clip relative rounded-[inherit] size-full">
                <ActionsEditHistory />
                <div 
                  ref={containerRef}
                  className="absolute box-border content-stretch flex gap-[8px] items-center justify-center left-1/2 px-0 py-[5px] top-1/2 translate-x-[-50%] translate-y-[-50%]"
                  style={{ width: textWidth ? `${textWidth + 16 + 8}px` : undefined }}
                >
                  <div className="h-[18px] relative shrink-0 w-[16px]">
                    <CanvasIcon canvasType={currentTab?.canvasType || null} />
                  </div>
                  <div className="box-border content-stretch flex items-center pb-px pt-0 px-0 relative shrink-0">
                    {/* Hidden element to measure text width */}
                    <span
                      ref={measureRef}
                      className="absolute invisible capitalize font-['Outfit:Regular',_sans-serif] font-normal leading-[normal] text-[16px] whitespace-pre pointer-events-none"
                      aria-hidden="true"
                    >
                      {isEditing ? editingText : (currentTab?.name || 'Blank Tab')}
                    </span>
                    
                    {(isEditing && !dragDirection) ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editingText}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                        onKeyDown={handleNameKeyDown}
                        onPointerDown={handleInputPointerDown}
                        style={{ width: textWidth ? `${textWidth}px` : undefined }}
                        className="capitalize font-['Outfit:Regular',_sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-center text-neutral-950 bg-transparent border-none outline-none p-0 m-0 min-w-[2ch]"
                      />
                    ) : (
                      <p 
                        className="tab-name-text capitalize font-['Outfit:Regular',_sans-serif] font-normal leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-center text-neutral-950 text-nowrap whitespace-pre cursor-pointer"
                        style={{ width: textWidth ? `${textWidth}px` : undefined }}
                      >
                        {currentTab?.name || 'Blank Tab'}
                      </p>
                    )}
                  </div>
                </div>
                <ActionsUndo />
              </div>
              <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[100px]" />
            </div>
          </motion.div>

          {/* Adjacent tab address bar (sliding in/out) */}
          {showAdjacentTab && adjacentTab && (
            <motion.div
              className="absolute h-[51px] left-[40px] right-[40px] top-1/2 translate-y-[-50%]"
              style={{ x: adjacentTabX, willChange: 'transform' }}
            >
              <div className="bg-white h-full rounded-[100px]">
                <div className="overflow-clip relative rounded-[inherit] size-full">
                  <ActionsEditHistory />
                  <div className="absolute box-border content-stretch flex gap-[8px] items-center justify-center left-1/2 px-0 py-[5px] top-1/2 translate-x-[-50%] translate-y-[-50%] w-[112px]">
                    <div className="h-[18px] relative shrink-0 w-[16px]">
                      <CanvasIcon canvasType={adjacentTab.canvasType || null} />
                    </div>
                    <div className="box-border content-stretch flex items-center pb-px pt-0 px-0 relative shrink-0">
                      <p className="capitalize font-['Outfit:Regular',_sans-serif] font-normal leading-[normal] max-w-[88px] overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-center text-neutral-950 text-nowrap whitespace-pre">
                        {adjacentTab.name}
                      </p>
                    </div>
                  </div>
                  <ActionsUndo />
                </div>
                <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[100px]" />
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Task Name pill */}
        <TaskName taskName={taskName} onTaskNameChange={onTaskNameChange} />
      </div>
    </div>
  );
}

// Action button components
function ActionsEditHistory() {
  return (
    <div className="absolute left-[10px] size-[31px] top-1/2 translate-y-[-50%]" data-name="Actions/Edit-History">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
        <g id="Actions/Edit-History">
          <rect fill="var(--fill-0, #F2F2F7)" height="31" rx="15.5" width="31" />
          <path d={svgPaths.p32b3d000} fill="var(--fill-0, #8E8E93)" id="Icons/Edit-History" stroke="var(--stroke-0, #8E8E93)" strokeWidth="0.2" />
        </g>
      </svg>
    </div>
  );
}

function ActionsUndo() {
  return (
    <div className="absolute right-[10px] size-[31px] top-1/2 translate-y-[-50%]" data-name="Actions/Undo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
        <g id="Actions/Undo">
          <rect fill="var(--fill-0, #F2F2F7)" height="31" rx="15.5" width="31" />
          <path d={svgPaths.p3c560400} id="Icons/Undo" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </g>
      </svg>
    </div>
  );
}

function TabActions({ tabCount, onSwitcherClick }: { tabCount: number; onSwitcherClick: () => void }) {
  return (
    <div className="absolute box-border content-stretch flex h-[58px] items-center justify-between left-0 px-[20px] py-0 right-0 top-[93px] px-[30px] py-[0px]" data-name="Tab-Actions">
      <ActionsHome />
      <ActionsSwitcher tabCount={tabCount} onClick={onSwitcherClick} />
      <ButtonsSparoOn />
      <ActionsComments />
      <ActionsShare />
    </div>
  );
}

function ActionsHome() {
  return (
    <div className="relative shrink-0 size-[35px]" data-name="Actions/Home">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35 35">
        <g id="Actions/Home">
          <path d={svgPaths.p26b57200} fill="var(--fill-0, #7482FF)" id="Icons/Home" stroke="var(--stroke-0, #7482FF)" strokeWidth="0.2" />
        </g>
      </svg>
    </div>
  );
}

function ActionsSwitcher({ tabCount, onClick }: { tabCount: number; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="relative shrink-0 size-[35px] cursor-pointer active:opacity-70 transition-opacity" 
      data-name="Actions/Switcher"
    >
      <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Icons/Switch">
        <div className="absolute inset-[-0.83%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
            <path d={svgPaths.p1dea80f0} fill="var(--fill-0, #7482FF)" id="Icons/Switch" stroke="var(--stroke-0, #7482FF)" strokeWidth="0.2" />
          </svg>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col items-center justify-center left-[calc(50%+2px)] overflow-clip top-[calc(50%+1px)] translate-x-[-50%] translate-y-[-50%]" data-name="Tab-Count">
        <p className="capitalize font-['Outfit:Bold',_sans-serif] font-bold h-[10px] leading-none max-w-[13px] relative shrink-0 text-[#7482ff] text-[10px] text-center w-[12px]">{tabCount}</p>
      </div>
    </button>
  );
}

function ButtonsSparoOn() {
  return (
    <div className="relative shrink-0 size-[58px]" data-name="Buttons/Sparo-On">
      <div className="absolute left-[5px] size-[48px] top-[5px]" data-name="Background">
        <div className="absolute inset-[-16.67%_-20.83%_-25%_-20.83%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 68 68">
            <g filter="url(#filter0_d_13_718)" id="Background">
              <circle cx="34" cy="32" fill="var(--fill-0, white)" fillOpacity="0.8" r="24" shapeRendering="crispEdges" />
              <circle cx="34" cy="32" r="23.5" shapeRendering="crispEdges" stroke="var(--stroke-0, #AA6EEE)" strokeOpacity="0.2" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="68" id="filter0_d_13_718" width="68" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="effect1_dropShadow_13_718" />
                <feOffset dy="2" />
                <feGaussianBlur stdDeviation="4" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_13_718" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_13_718" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute h-[26px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[28px]" data-name="Icons/Sparo">
        <div className="absolute inset-[-3.85%_-3.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 28">
            <g clipPath="url(#paint0_angular_13_730_clip_path)" data-figma-skip-parse="true">
              <g transform="matrix(0 0.013 -0.0177051 0 15 14)">
                <foreignObject height="2307.69" width="2307.69" x="-1153.85" y="-1153.85">
                  <div style={{ background: "conic-gradient(from 90deg,rgba(188, 130, 243, 1) 0deg,rgba(198, 134, 255, 1) 29.4231deg,rgba(255, 186, 113, 1) 68.4deg,rgba(255, 103, 119, 1) 131.538deg,rgba(170, 110, 238, 1) 181.731deg,rgba(141, 152, 255, 1) 230.4deg,rgba(244, 185, 234, 1) 311.538deg,rgba(188, 130, 243, 1) 360deg)", height: "100%", width: "100%", opacity: "1" }} xmlns="http://www.w3.org/1999/xhtml" />
                </foreignObject>
              </g>
            </g>
            <path d={svgPaths.p2ee80480} id="Icons/Sparo" />
            <defs>
              <clipPath id="paint0_angular_13_730_clip_path">
                <path d={svgPaths.p2ee80480} id="Icons/Sparo" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute left-1/2 size-[58px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Border">
        <div className="absolute inset-[-37.931%]">
          <img alt="" className="block max-w-none size-full" height="102" src={imgBorder} width="102" />
        </div>
      </div>
    </div>
  );
}

function ActionsComments() {
  return (
    <div className="relative shrink-0 size-[35px]" data-name="Actions/Comments">
      <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Icons/Comments">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g id="Icons/Comments">
            <mask fill="white" id="path-1-inside-1_13_720">
              <path clipRule="evenodd" d={svgPaths.p3ed860c0} fillRule="evenodd" />
            </mask>
            <path d={svgPaths.p1a2dd280} fill="var(--stroke-0, #7482FF)" mask="url(#path-1-inside-1_13_720)" />
          </g>
        </svg>
      </div>
      <div className="absolute content-stretch flex flex-col items-center justify-center left-1/2 overflow-clip top-[calc(50%-0.5px)] translate-x-[-50%] translate-y-[-50%]" data-name="Comment-Count">
        <p className="capitalize font-['Outfit:Bold',_sans-serif] font-bold h-[10px] leading-none max-w-[13px] relative shrink-0 text-[#7482ff] text-[10px] text-center w-[12px]"></p>
      </div>
    </div>
  );
}

function ActionsShare() {
  return (
    <div className="relative shrink-0 size-[35px]" data-name="Actions/Share">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35 35">
        <g id="Actions/Share">
          <g id="Icons/Share">
            <path d={svgPaths.p249d5100} stroke="var(--stroke-0, #7482FF)" strokeWidth="2.1" />
            <path d={svgPaths.pe3500} stroke="var(--stroke-0, #7482FF)" strokeWidth="2.1" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function TaskName({ taskName, onTaskNameChange }: { taskName: string; onTaskNameChange: (newName: string) => void }) {
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [originalTaskName, setOriginalTaskName] = useState('');
  const taskInputRef = useRef<HTMLInputElement>(null);
  const taskContainerRef = useRef<HTMLDivElement>(null);
  const [taskInputWidth, setTaskInputWidth] = useState<number | undefined>(undefined);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTask && taskInputRef.current) {
      taskInputRef.current.focus();
      taskInputRef.current.select();
    }
  }, [isEditingTask]);

  // Measure text width for dynamic input sizing
  useEffect(() => {
    if (isEditingTask && taskContainerRef.current) {
      const measureSpan = taskContainerRef.current.querySelector('.task-measure-text') as HTMLSpanElement;
      if (measureSpan) {
        setTaskInputWidth(measureSpan.offsetWidth);
      }
    }
  }, [editingTaskText, isEditingTask]);

  const handleTaskClick = () => {
    setIsEditingTask(true);
    setEditingTaskText(taskName);
    setOriginalTaskName(taskName);
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTaskText(e.target.value);
  };

  const handleTaskBlur = () => {
    saveTaskName();
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTaskName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingTask(false);
      setEditingTaskText('');
    }
  };

  const saveTaskName = () => {
    const trimmedName = editingTaskText.trim();
    
    // If empty or unchanged, keep original name
    if (trimmedName === '' || trimmedName === originalTaskName) {
      setIsEditingTask(false);
      setEditingTaskText('');
      return;
    }
    
    // Save the new name
    onTaskNameChange(trimmedName);
    setIsEditingTask(false);
    setEditingTaskText('');
  };

  return (
    <div className="absolute bg-[#f2f2f7] box-border content-stretch flex items-center justify-center left-1/2 min-w-[100px] overflow-clip px-[12px] py-[4px] rounded-[100px] top-[-12px] translate-x-[-50%]" data-name="Task-Name">
      <div 
        ref={taskContainerRef}
        className="box-border content-stretch flex gap-[10px] items-center justify-center pb-px pt-0 px-0 relative shrink-0"
      >
        {isEditingTask ? (
          <>
            <input
              ref={taskInputRef}
              type="text"
              value={editingTaskText}
              onChange={handleTaskChange}
              onBlur={handleTaskBlur}
              onKeyDown={handleTaskKeyDown}
              className="capitalize font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] max-w-[200px] relative shrink-0 text-[#8e8e93] text-[12px] text-center bg-transparent border-none outline-none p-0 m-0 min-w-0"
              style={{ width: taskInputWidth ? `${taskInputWidth}px` : 'auto' }}
            />
            <span 
              className="task-measure-text capitalize font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] text-[12px] absolute opacity-0 pointer-events-none whitespace-pre"
              aria-hidden="true"
            >
              {editingTaskText || taskName}
            </span>
          </>
        ) : (
          <p 
            onClick={handleTaskClick}
            className="capitalize font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] max-w-[200px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#8e8e93] text-[12px] text-center text-nowrap whitespace-pre cursor-pointer"
          >
            {taskName}
          </p>
        )}
      </div>
    </div>
  );
}

// Inactive tab indicator - shows peeking tabs on left/right edges
function InactiveTabIndicator({ direction, tab }: { direction: 'left' | 'right'; tab?: Tab }) {
  if (!tab) return null;

  // Adjusted positioning to create visible gaps between tabs
  const positionClass = direction === 'left' 
    ? 'left-[-330px]'  // Position off-screen to the left with gap
    : 'right-[-330px]'; // Position off-screen to the right with gap

  return (
    <div 
      className={`absolute bg-white h-[51px] ${positionClass} rounded-[100px] top-1/2 translate-y-[-50%] w-[360px] pointer-events-none`}
      data-name="Inactive Tab"
    >
      <div className="h-[51px] overflow-clip relative rounded-[inherit] w-[360px]">
        <div className="absolute box-border content-stretch flex gap-[8px] items-center justify-center left-1/2 px-0 py-[5px] top-1/2 translate-x-[-50%] translate-y-[-50%] w-[112px]">
          <div className="h-[18px] relative shrink-0 w-[16px]">
            <CanvasIcon canvasType={tab.canvasType || null} />
          </div>
          <div className="box-border content-stretch flex items-center pb-px pt-0 px-0 relative shrink-0">
            <p className="capitalize font-['Outfit:Regular',_sans-serif] font-normal leading-[normal] max-w-[88px] overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-center text-neutral-950 text-nowrap whitespace-pre">
              {tab.name}
            </p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[100px]" />
    </div>
  );
}
