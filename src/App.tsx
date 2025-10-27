import { useState, useEffect, useRef } from 'react';
import { useMotionValue, animate } from 'motion/react';
import TabBar from './components/TabBar';
import CanvasArea from './components/CanvasArea';
import TabSwitcher from './components/TabSwitcher';
import { Tab, Task, CanvasType } from './types';
import { fetchTasks, saveTasks } from './utils/supabase/api';

/**
 * Main App Component
 * Phase 1b: Added Supabase persistence
 * Phase 1f: Added drag progress infrastructure for synchronized animations
 * Phase 2a: Added tab switcher activation (button tap and upward swipe)
 * Phase 2b: Added tab closing (button tap and swipe-to-delete with simplified animations)
 */

export default function App() {
  // Task state - will be loaded from Supabase
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab Switcher state
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Drag state for synchronized tab animations
  const dragProgress = useMotionValue(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const lastClientX = useRef(0); // Track last position for direction calculation
  const transitionTimeoutRef = useRef<number | null>(null);

  // Load tasks from Supabase on mount
  useEffect(() => {
    loadTasksFromServer();
  }, []);

  // Save tasks to Supabase whenever task state changes
  useEffect(() => {
    if (task && !isLoading) {
      saveTasksToServer();
    }
  }, [task, isLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  async function loadTasksFromServer() {
    setIsLoading(true);
    setError(null);

    const result = await fetchTasks();

    if (!result.success) {
      setError(`Failed to load tasks: ${result.error}`);
      // Create default task locally if fetch fails
      createDefaultTask();
      setIsLoading(false);
      return;
    }

    // If no tasks exist, create default task
    if (result.tasks.length === 0) {
      createDefaultTask();
    } else {
      // Load first task (for MVP, we only have one task)
      setTask(result.tasks[0]);
    }

    setIsLoading(false);
  }

  async function saveTasksToServer() {
    if (!task) return;

    const result = await saveTasks([task]);

    if (!result.success) {
      console.error('Failed to save tasks:', result.error);
      setError(`Failed to save: ${result.error}`);
    }
  }

  function createDefaultTask() {
    const defaultTask: Task = {
      id: `task-${Date.now()}`,
      name: 'Untitled Task 1',
      tabs: [
        {
          id: `tab-${Date.now()}`,
          name: 'Blank Tab 1',
          canvasType: null,
          createdAt: Date.now(),
          isActive: true,
          commentCount: 0,
        },
      ],
    };
    setTask(defaultTask);
  }

  // Get the currently active tab
  const activeTab = task?.tabs.find((tab) => tab.isActive);

  // Handle canvas type selection from BlankTab
  const handleCanvasTypeSelect = (type: CanvasType) => {
    if (!activeTab || !task) return;

    // Count existing "Untitled" tabs of this canvas type in the task
    const canvasTypeName = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize: doc -> Doc
    const untitledTabsOfType = task.tabs.filter((tab) => 
      tab.name.startsWith(`Untitled ${canvasTypeName}`)
    ).length;

    // Generate new tab name: "Untitled [CanvasType] [number]"
    const newTabName = `Untitled ${canvasTypeName} ${untitledTabsOfType + 1}`;

    // Update the active tab's canvas type and name
    setTask((prevTask) => {
      if (!prevTask) return prevTask;
      return {
        ...prevTask,
        tabs: prevTask.tabs.map((tab) =>
          tab.id === activeTab.id 
            ? { ...tab, canvasType: type, name: newTabName } 
            : tab
        ),
      };
    });
  };

  // Handle tab name change from TabBar
  const handleTabNameChange = (tabId: string, newName: string) => {
    if (!task) return;

    setTask((prevTask) => {
      if (!prevTask) return prevTask;
      return {
        ...prevTask,
        tabs: prevTask.tabs.map((tab) =>
          tab.id === tabId 
            ? { ...tab, name: newName } 
            : tab
        ),
      };
    });
  };

  // Drag handlers for synchronized animations
  const handleSwipeStart = (clientX: number) => {
    if (isTransitioning) {
      return false;
    }
    
    isDragging.current = true;
    dragStartX.current = clientX;
    lastClientX.current = clientX;
    setDragDirection(null);
    return true;
  };

  const handleSwipeMove = (clientX: number) => {
    if (!isDragging.current || isTransitioning || !task || !activeTab) {
      return;
    }

    // Track last position for direction calculation
    lastClientX.current = clientX;

    const deltaX = clientX - dragStartX.current;
    const screenWidth = window.innerWidth;
    const currentIndex = task.tabs.findIndex((tab) => tab.id === activeTab.id);
    
    // Determine direction on first meaningful movement
    if (!dragDirection && Math.abs(deltaX) > 5) {
      if (deltaX < 0) {
        setDragDirection('left');  // Swipe left = go forward/create new
      } else if (deltaX > 0 && currentIndex > 0) {
        setDragDirection('right');  // Swipe right = go back (only if not first tab)
      }
    }

    // Calculate progress based on deltaX (don't wait for state update)
    // Swipe left (deltaX negative) = go forward
    if (deltaX < 0) {
      const progress = Math.min(Math.abs(deltaX) / screenWidth, 1);
      dragProgress.set(progress);
    } 
    // Swipe right (deltaX positive) = go back (only if not on first tab)
    else if (deltaX > 0 && currentIndex > 0) {
      const progress = Math.min(deltaX / screenWidth, 1);
      dragProgress.set(progress);
    } 
    // Back to start position
    else if (deltaX === 0) {
      dragProgress.set(0);
    }
  };

  const handleSwipeEnd = () => {
    // Early exit if not dragging or already transitioning
    if (!isDragging.current || isTransitioning) {
      return;
    }

    // Mark as not dragging immediately to prevent duplicate calls
    isDragging.current = false;

    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    // Exit if no task/tab (but don't prevent snap animation)
    if (!task || !activeTab) {
      dragProgress.set(0);
      setDragDirection(null);
      return;
    }

    const threshold = 0.3;  // 30% of screen width
    const progress = dragProgress.get();
    const currentIndex = task.tabs.findIndex((tab) => tab.id === activeTab.id);

    // Calculate direction from actual drag delta (more reliable than async state)
    const deltaX = lastClientX.current - dragStartX.current;
    let actualDirection: 'left' | 'right' | null = null;
    
    if (deltaX < 0) {
      actualDirection = 'left';
    } else if (deltaX > 0 && currentIndex > 0) {
      actualDirection = 'right';
    }

    // Threshold met - switch tabs
    if (progress > threshold && actualDirection) {
      setIsTransitioning(true);
      
      // Safety timeout to prevent stuck state
      transitionTimeoutRef.current = window.setTimeout(() => {
        dragProgress.set(0);
        setDragDirection(null);
        setIsTransitioning(false);
        transitionTimeoutRef.current = null;
      }, 1000);
      
      // Perform tab action IMMEDIATELY using calculated direction
      if (actualDirection === 'left') {
        if (currentIndex === task.tabs.length - 1) {
          createNewTab();
        } else {
          switchToTab(currentIndex + 1);
        }
      } else if (actualDirection === 'right') {
        switchToTab(currentIndex - 1);
      }
      
      // Animate visual transition smoothly
      animate(dragProgress, 1, {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
        onComplete: () => {
          if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
          }
          // Double requestAnimationFrame ensures React has fully committed
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              dragProgress.set(0);
              setDragDirection(null);
              setIsTransitioning(false);
            });
          });
        },
      });
    } else {
      // Snap back (threshold not met or no direction)
      setIsTransitioning(true);
      
      // Safety timeout
      transitionTimeoutRef.current = window.setTimeout(() => {
        console.warn('Snap-back timeout - forcing reset');
        dragProgress.set(0);
        setDragDirection(null);
        setIsTransitioning(false);
        transitionTimeoutRef.current = null;
      }, 500);
      
      animate(dragProgress, 0, {
        duration: 0.2,
        ease: 'easeOut',
        onComplete: () => {
          if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
          }
          setDragDirection(null);
          setIsTransitioning(false);
        }
      });
    }
  };

  // Switch to a specific tab by index
  const switchToTab = (index: number) => {
    setTask((prevTask) => {
      if (!prevTask) return prevTask;
      return {
        ...prevTask,
        tabs: prevTask.tabs.map((tab, i) => ({
          ...tab,
          isActive: i === index,
        })),
      };
    });
  };

  // Create a new blank tab
  const createNewTab = () => {
    if (!task) {
      return;
    }

    // Count existing blank tabs
    const blankTabCount = task.tabs.filter((tab) => 
      tab.name.startsWith('Blank Tab')
    ).length;

    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      name: `Blank Tab ${blankTabCount + 1}`,
      canvasType: null,
      createdAt: Date.now(),
      isActive: true,
      commentCount: 0,
    };

    setTask((prevTask) => {
      if (!prevTask) return prevTask;
      const updatedTask = {
        ...prevTask,
        tabs: [
          // Deactivate all existing tabs
          ...prevTask.tabs.map((tab) => ({ ...tab, isActive: false })),
          // Add new active tab
          newTab,
        ],
      };
      return updatedTask;
    });
  };

  // Handle tab switcher toggle
  const handleSwitcherToggle = () => {
    setIsSwitcherOpen(!isSwitcherOpen);
  };

  // Handle tab selection from switcher
  const handleTabSelect = (tabId: string) => {
    if (!task) return;
    
    setTask((prevTask) => {
      if (!prevTask) return prevTask;
      return {
        ...prevTask,
        tabs: prevTask.tabs.map((tab) => ({
          ...tab,
          isActive: tab.id === tabId,
        })),
      };
    });
    
    // Close switcher after selecting a tab
    setIsSwitcherOpen(false);
  };

  // Handle upward swipe to open switcher
  const handleSwipeUp = () => {
    setIsSwitcherOpen(true);
  };

  // Handle tab closing from switcher
  const handleTabClose = (tabId: string) => {
    if (!task) return;

    const tabIndex = task.tabs.findIndex((tab) => tab.id === tabId);
    const isClosingActiveTab = task.tabs[tabIndex]?.isActive;
    const isLastTab = task.tabs.length === 1;

    // If closing the last tab, create a new blank tab instead
    if (isLastTab) {
      const blankTabCount = task.tabs.filter((tab) => 
        tab.name.startsWith('Blank Tab')
      ).length;

      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        name: `Blank Tab ${blankTabCount + 1}`,
        canvasType: null,
        createdAt: Date.now(),
        isActive: true,
        commentCount: 0,
      };

      setTask((prevTask) => {
        if (!prevTask) return prevTask;
        return {
          ...prevTask,
          tabs: [newTab],
        };
      });
      return;
    }

    // Remove the tab
    setTask((prevTask) => {
      if (!prevTask) return prevTask;

      const updatedTabs = prevTask.tabs.filter((tab) => tab.id !== tabId);

      // If we closed the active tab, activate an adjacent tab
      if (isClosingActiveTab) {
        // Try to activate the next tab, or the previous tab if we closed the last one
        const newActiveIndex = tabIndex < updatedTabs.length ? tabIndex : tabIndex - 1;
        updatedTabs[newActiveIndex].isActive = true;
      }

      return {
        ...prevTask,
        tabs: updatedTabs,
      };
    });
  };

  // Tab bar height to offset content (matches TabBar.tsx)
  const tabBarHeight = 185; // 151px content + 34px safe area

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="font-['Outfit',_sans-serif] text-neutral-500">Loading...</p>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen bg-white p-6">
        <p className="font-['Outfit',_sans-serif] text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#7482FF] text-white px-6 py-2 rounded-full font-['Outfit',_sans-serif]"
        >
          Retry
        </button>
      </div>
    );
  }

  // Don't render if task hasn't loaded yet
  if (!task) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Tab Content Area - fills viewport above tab bar */}
      <div
        className="h-[calc(100vh-185px)]" // Height is viewport minus tab bar height
      >
        <CanvasArea
          tabs={task.tabs}
          activeTabId={activeTab?.id || ''}
          dragProgress={dragProgress}
          dragDirection={dragDirection}
          onCanvasTypeSelect={handleCanvasTypeSelect}
        />
      </div>

      {/* Tab Bar - fixed to bottom */}
      <TabBar
        taskName={task.name}
        tabs={task.tabs}
        activeTabId={activeTab?.id || ''}
        tabCount={task.tabs.length}
        dragProgress={dragProgress}
        dragDirection={dragDirection}
        onSwipeStart={handleSwipeStart}
        onSwipeMove={handleSwipeMove}
        onSwipeEnd={handleSwipeEnd}
        onTabNameChange={handleTabNameChange}
        onSwitcherToggle={handleSwitcherToggle}
        onSwipeUp={handleSwipeUp}
        isFirstTab={task.tabs.findIndex((tab) => tab.id === activeTab?.id) === 0}
        isLastTab={task.tabs.findIndex((tab) => tab.id === activeTab?.id) === task.tabs.length - 1}
        isSingleTab={task.tabs.length === 1}
      />

      {/* Tab Switcher - full-screen overlay */}
      <TabSwitcher
        isOpen={isSwitcherOpen}
        tabs={task.tabs}
        activeTabId={activeTab?.id || null}
        taskName={task.name}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onClose={handleSwitcherToggle}
      />
    </div>
  );
}
