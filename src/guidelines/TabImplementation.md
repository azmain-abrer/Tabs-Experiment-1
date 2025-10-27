# Tab Switching Implementation Documentation

## Overview
This document details the complete tab switching implementation in the Sparo mobile task management app. The system supports bidirectional tab navigation via drag gestures, with synchronized animations between the canvas area and address bar.

---

## Core Architecture

### Three-Tier Component Structure

1. **App.tsx** - Main orchestrator
2. **CanvasArea.tsx** - Manages canvas content sliding
3. **TabBar.tsx** - Manages address bar sliding

---

## App.tsx - Main Tab Management

### State Management

```typescript
const [tabs, setTabs] = useState<Tab[]>([...]);
const [activeTabIndex, setActiveTabIndex] = useState(0);
const dragProgress = useMotionValue(0);
const [isTransitioning, setIsTransitioning] = useState(false);
const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
```

### Tab Interface

```typescript
interface Tab {
  id: string;
  title: string;
  canvasType: CanvasType;
  isManuallyRenamed?: boolean;
  emailData?: { to?: string; subject?: string; body?: string; };
  documentData?: { title?: string; content?: string; lastEdited?: string; };
  tableData?: TableRowData[];
  comments?: Comment[];
}
```

### Core Tab Switching Logic

#### 1. Swipe Start (Line 436-443)
```typescript
const handleSwipeStart = (clientX: number) => {
  if (isTransitioning || aiMode !== 'none' || tabSwitcherMode) return false;
  
  isDragging.current = true;
  dragStartX.current = clientX;
  setDragDirection(null);
  return true;
};
```

**Purpose**: Initializes swipe gesture tracking
**Guards**: Prevents overlapping transitions and conflicts with AI/switcher modes

#### 2. Swipe Move (Line 445-474)
```typescript
const handleSwipeMove = (clientX: number) => {
  if (!isDragging.current || isTransitioning) return;

  const deltaX = clientX - dragStartX.current;
  const screenWidth = window.innerWidth;
  
  // Determine direction
  if (deltaX < 0 && !dragDirection) {
    setDragDirection('left');  // Swipe left = go forward/create new
  } else if (deltaX > 0 && !dragDirection) {
    if (activeTabIndex > 0) {
      setDragDirection('right');  // Swipe right = go back
    }
  }

  // Calculate progress (0-1)
  if (dragDirection === 'left' && deltaX < 0) {
    const progress = Math.min(Math.abs(deltaX) / screenWidth, 1);
    dragProgress.set(progress);
  } else if (dragDirection === 'right' && deltaX > 0) {
    const progress = Math.min(deltaX / screenWidth, 1);
    dragProgress.set(progress);
  }
};
```

**Purpose**: Tracks swipe progress and determines direction
**Direction Logic**:
- Left swipe → navigate forward or create new tab
- Right swipe → navigate backward (if not on first tab)

#### 3. Swipe End (Line 476-526)
```typescript
const handleSwipeEnd = () => {
  if (!isDragging.current || isTransitioning) return;

  const threshold = 0.3;  // 30% of screen width
  const progress = dragProgress.get();

  isDragging.current = false;

  if (progress > threshold && dragDirection) {
    setIsTransitioning(true);
    
    // Perform tab action IMMEDIATELY
    if (dragDirection === 'left') {
      if (activeTabIndex === tabs.length - 1) {
        createNewTab();
      } else {
        switchToTab(activeTabIndex + 1);
      }
    } else if (dragDirection === 'right') {
      switchToTab(activeTabIndex - 1);
    }
    
    // Animate visual transition smoothly
    animate(dragProgress, 1, {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
      onComplete: () => {
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
    // Snap back (threshold not met)
    animate(dragProgress, 0, {
      duration: 0.2,
      ease: 'easeOut',
      onComplete: () => {
        setDragDirection(null);
      }
    });
  }
};
```

**Purpose**: Completes or cancels the swipe based on threshold
**Threshold**: User must swipe at least 30% of screen width to commit
**Animation Strategy**: Tab action happens immediately, visual animation completes smoothly

#### 4. Tab Management Functions

```typescript
// Switch to specific tab (Line 327-331)
const switchToTab = (index: number) => {
  if (index >= 0 && index < tabs.length && index !== activeTabIndex) {
    setActiveTabIndex(index);
  }
};

// Update tab title (Line 333-341)
const updateTabTitle = (index: number, newTitle: string) => {
  const updatedTabs = [...tabs];
  updatedTabs[index] = { 
    ...updatedTabs[index], 
    title: newTitle,
    isManuallyRenamed: true
  };
  setTabs(updatedTabs);
};

// Create new tab (Line 289-297)
const createNewTab = () => {
  const newTab: Tab = {
    id: Date.now().toString(),
    title: 'Blank Tab',
    canvasType: null
  };
  setTabs([...tabs, newTab]);
  setActiveTabIndex(tabs.length);
};

// Delete tab (Line 343-370)
const deleteTab = (index: number) => {
  if (isAnimatingRef.current) return;

  // Always maintain at least one tab
  if (tabs.length === 1) {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'Blank Tab',
      canvasType: null
    };
    setTabs([newTab]);
    setActiveTabIndex(0);
    return;
  }

  const updatedTabs = tabs.filter((_, i) => i !== index);
  setTabs(updatedTabs);

  // Adjust active tab index
  if (index === activeTabIndex) {
    setActiveTabIndex(Math.max(0, index - 1));
  } else if (index < activeTabIndex) {
    setActiveTabIndex(activeTabIndex - 1);
  }
};
```

---

## CanvasArea.tsx - Canvas Content Sliding

### Displayed Tab Index Management

```typescript
const [displayedTabIndex, setDisplayedTabIndex] = useState(activeTabIndex);

// Update only when not dragging (Line 87-96)
useEffect(() => {
  if (!dragDirection) {
    setDisplayedTabIndex(activeTabIndex);
    lastDragDirectionRef.current = null;
    previewNewTabIdRef.current = `preview-new-${Date.now()}`;
  }
}, [activeTabIndex, dragDirection, displayedTabIndex, tabs]);
```

**Purpose**: Prevents content from updating mid-drag, creating smooth visual transitions

### Canvas Position Calculation

```typescript
// Create stable motion values (Line 99-102)
const currentTabXRef = useRef(useMotionValue(0));
const adjacentTabXRef = useRef(useMotionValue(0));

// Update positions based on drag (Line 117-140)
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
  };

  updatePositions(dragProgress.get());
  const unsubscribe = dragProgress.on('change', updatePositions);
  return () => unsubscribe();
}, [dragProgress, screenWidth, currentTabX, adjacentTabX]);
```

**Position Logic**:
- **Left swipe**: Current tab moves left (-100%), adjacent enters from right (+100% → 0%)
- **Right swipe**: Current tab moves right (+100%), adjacent enters from left (-100% → 0%)

### Adjacent Tab Rendering

```typescript
// Determine which tab to show adjacent (Line 228-242)
const currentTab = tabs[displayedTabIndex];
const targetTab = tabs[activeTabIndex];

const effectiveDragDirection = dragDirection || lastDragDirectionRef.current;
const showAdjacentTab = effectiveDragDirection !== null || displayedTabIndex !== activeTabIndex;

const adjacentTab = effectiveDragDirection === 'right' && displayedTabIndex > 0 
  ? tabs[displayedTabIndex - 1]
  : effectiveDragDirection === 'left'
  ? (displayedTabIndex < tabs.length - 1 
      ? tabs[displayedTabIndex + 1] 
      : { id: previewNewTabIdRef.current, title: 'Blank Tab', canvasType: null })
  : targetTab;
```

**Preview New Tab**: When swiping left on the last tab, a preview blank tab is shown

### Canvas Rendering

```typescript
<motion.div className="absolute inset-0 overflow-hidden">
  {/* Current tab content */}
  <motion.div
    className="absolute inset-0"
    style={{ x: currentTabX, willChange: 'transform' }}
  >
    {currentTab && renderCanvasContent(currentTab, displayedTabIndex)}
  </motion.div>

  {/* Adjacent tab (previous or next) */}
  {showAdjacentTab && adjacentTab && (
    <motion.div
      className="absolute inset-0"
      style={{ x: adjacentTabX, willChange: 'transform' }}
    >
      {renderCanvasContent(adjacentTab, ...)}
    </motion.div>
  )}
</motion.div>
```

---

## TabBar.tsx - Address Bar Sliding

### Address Bar Position Synchronization

The TabBar uses the **same position calculation logic** as CanvasArea to keep the address bar synchronized:

```typescript
// Lines 109-142
const currentTabXRef = useRef(useMotionValue(0));
const adjacentTabXRef = useRef(useMotionValue(0));

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
  };

  updatePositions(dragProgress.get());
  const unsubscribe = dragProgress.on('change', updatePositions);
  return () => unsubscribe();
}, [dragProgress, screenWidth, currentTabX, adjacentTabX]);
```

### Address Bar Rendering

```typescript
<div className="px-4 pt-2 pb-3 relative overflow-visible z-10">
  <div className="relative overflow-visible" style={{ height: '44px' }}>
    {/* Current tab address bar */}
    <motion.div 
      className="absolute left-4 right-4 top-0 bg-gray-100 rounded-lg px-4 py-2.5"
      style={{ x: currentTabX, willChange: 'transform' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {CanvasIcon && <CanvasIcon className="absolute left-4 w-4 h-4" />}
      <span className="text-gray-600">{currentTab?.title || 'Blank Tab'}</span>
    </motion.div>

    {/* Adjacent tab address bar */}
    <AnimatePresence mode="sync">
      {dragDirection && (
        <motion.div
          style={{ x: adjacentTabX, willChange: 'transform' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Adjacent tab title */}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</div>
```

### Gesture Detection with Vertical Swipe

```typescript
const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
  if (!isGestureActiveRef.current) return;
  
  const deltaX = e.clientX - clickStartPosRef.current.x;
  const deltaY = e.clientY - clickStartPosRef.current.y;
  
  // Determine direction on first significant movement
  if (!swipeDirectionDeterminedRef.current && 
      (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
    swipeDirectionDeterminedRef.current = true;
    isVerticalSwipeRef.current = Math.abs(deltaY) > Math.abs(deltaX);
    
    if (!isVerticalSwipeRef.current) {
      onSwipeStart(e.clientX);
    }
  }
  
  if (swipeDirectionDeterminedRef.current && !isVerticalSwipeRef.current) {
    onSwipeMove(e.clientX);
  }
};
```

**Purpose**: Disambiguates between:
- Horizontal swipe → tab switching
- Vertical swipe up → open tab switcher
- Tap → enter title edit mode

---

## Synchronization Strategy

### Shared State Flow

```
App.tsx
├─ dragProgress (MotionValue)      ← Single source of truth for animation
├─ dragDirection (state)           ← Direction of swipe
├─ activeTabIndex (state)          ← Logical active tab
│
├─▶ CanvasArea
│   ├─ displayedTabIndex (state)   ← Visual displayed tab (lags during drag)
│   ├─ currentTabX (MotionValue)   ← Position derived from dragProgress
│   └─ adjacentTabX (MotionValue)  ← Position derived from dragProgress
│
└─▶ TabBar
    ├─ displayedTabIndex (state)   ← Visual displayed tab (matches CanvasArea)
    ├─ currentTabX (MotionValue)   ← Position derived from dragProgress
    └─ adjacentTabX (MotionValue)  ← Position derived from dragProgress
```

### Key Synchronization Points

1. **dragProgress**: Shared MotionValue ensures both components animate in lockstep
2. **displayedTabIndex**: Updated only when `!dragDirection`, preventing mid-drag content changes
3. **Position Calculation**: Identical logic in both components ensures perfect alignment

### Double RequestAnimationFrame Pattern

```typescript
onComplete: () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dragProgress.set(0);
      setDragDirection(null);
      setIsTransitioning(false);
    });
  });
}
```

**Purpose**: Ensures React has fully committed the state update before resetting animation values

---

## Edge Cases Handled

### 1. Swipe Right on First Tab
```typescript
if (deltaX > 0 && !dragDirection) {
  if (activeTabIndex > 0) {
    setDragDirection('right');
  }
}
```
**Result**: No direction set → drag has no effect

### 2. Swipe Left on Last Tab
```typescript
if (dragDirection === 'left') {
  if (activeTabIndex === tabs.length - 1) {
    createNewTab();  // Creates new blank tab
  } else {
    switchToTab(activeTabIndex + 1);  // Goes to next tab
  }
}
```
**Result**: Seamlessly creates new tab vs navigating to existing

### 3. Deleting Last Tab
```typescript
if (tabs.length === 1) {
  const newTab: Tab = { id: Date.now().toString(), title: 'Blank Tab', canvasType: null };
  setTabs([newTab]);
  setActiveTabIndex(0);
  return;
}
```
**Result**: Always maintains at least one tab

### 4. Concurrent Gestures
```typescript
if (isTransitioning || aiMode !== 'none' || tabSwitcherMode) return false;
```
**Result**: Guards prevent overlapping animations

### 5. Mid-Drag Tab Switching Prevention
```typescript
const [displayedTabIndex, setDisplayedTabIndex] = useState(activeTabIndex);

useEffect(() => {
  if (!dragDirection) {
    setDisplayedTabIndex(activeTabIndex);
  }
}, [activeTabIndex, dragDirection]);
```
**Result**: Content doesn't change until drag completes

---

## Performance Optimizations

### 1. Stable Motion Values
```typescript
const currentTabXRef = useRef(useMotionValue(0));
const adjacentTabXRef = useRef(useMotionValue(0));
const currentTabX = currentTabXRef.current;
```
**Benefit**: Motion values don't recreate on re-render

### 2. willChange CSS Property
```typescript
style={{ x: currentTabX, willChange: 'transform' }}
```
**Benefit**: Browser pre-optimizes for transform animations

### 3. Pointer Capture
```typescript
e.currentTarget.setPointerCapture(e.pointerId);
```
**Benefit**: Ensures pointer events aren't lost during fast swipes

### 4. Ref-Based Drag Direction
```typescript
const dragDirectionRef = useRef(dragDirection);
dragDirectionRef.current = dragDirection;

// Use in subscription
const updatePositions = (progress: number) => {
  const direction = dragDirectionRef.current;
  // ...
};
```
**Benefit**: Avoids stale closures in dragProgress subscription

---

## Animation Timeline

```
User starts swipe
├─ handleSwipeStart()
│  └─ isDragging = true, dragStartX = clientX
│
├─ handleSwipeMove() [continuous]
│  ├─ Determine direction (once)
│  ├─ Calculate progress: deltaX / screenWidth
│  ├─ dragProgress.set(progress)
│  │
│  ├─▶ CanvasArea updates positions
│  │   ├─ currentTabX = -progress * width (or +progress)
│  │   └─ adjacentTabX = width - (progress * width)
│  │
│  └─▶ TabBar updates positions (same calculation)
│
└─ handleSwipeEnd()
   ├─ Check if progress > 0.3
   │
   ├─ IF YES:
   │  ├─ setIsTransitioning(true)
   │  ├─ switchToTab() or createNewTab() [IMMEDIATE]
   │  ├─ animate(dragProgress, 1, { duration: 0.2 })
   │  └─ onComplete: reset state
   │
   └─ IF NO:
      └─ animate(dragProgress, 0, { duration: 0.2 }) [snap back]
```

---

## Supabase Backend Files

### /utils/supabase/info.tsx
```typescript
/* AUTOGENERATED FILE - DO NOT EDIT CONTENTS */

export const projectId = "ntjajlukvcymtsodibel"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50amFqbHVrdmN5bXRzb2RpYmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExODYwNDgsImV4cCI6MjA3Njc2MjA0OH0.k1T2g7YH8u7WL0onX5SeS_Fe37bCtq6v1HR157Bu-TA"
```

### /supabase/functions/server/kv_store.tsx
```typescript
/* AUTOGENERATED FILE - DO NOT EDIT CONTENTS */

/* Table schema:
CREATE TABLE kv_store_cce083f1 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
*/

// View at https://supabase.com/dashboard/project/ntjajlukvcymtsodibel/database/tables

// This file provides a simple key-value interface for storing Figma Make data.
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const client = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

// Set stores a key-value pair in the database.
export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_cce083f1").upsert({
    key,
    value
  });
  if (error) {
    throw new Error(error.message);
  }
};

// Get retrieves a key-value pair from the database.
export const get = async (key: string): Promise<any> => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_cce083f1").select("value").eq("key", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;
};

// Delete deletes a key-value pair from the database.
export const del = async (key: string): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_cce083f1").delete().eq("key", key);
  if (error) {
    throw new Error(error.message);
  }
};

// Sets multiple key-value pairs in the database.
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_cce083f1").upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
  if (error) {
    throw new Error(error.message);
  }
};

// Gets multiple key-value pairs from the database.
export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_cce083f1").select("value").in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

// Deletes multiple key-value pairs from the database.
export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_cce083f1").delete().in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
};

// Search for key-value pairs by prefix.
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_cce083f1").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};
```

### /supabase/functions/server/index.tsx
```typescript
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-cce083f1/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);
```

---

## Future Enhancement: Bidirectional Title Editing

To implement bidirectional title editing between the address bar and DocumentCanvas header:

### 1. Update App.tsx
Add title change handler to DocumentCanvas props:
```typescript
// In App.tsx, update the tab when document title changes
const handleDocumentTitleChange = (tabIndex: number, newTitle: string) => {
  updateTabTitle(tabIndex, newTitle);
};
```

### 2. Update DocumentCanvas.tsx
```typescript
interface DocumentCanvasProps {
  initialTitle?: string;
  initialContent?: string;
  initialLastEdited?: string;
  tabTitle?: string;  // NEW: Current tab title from App state
  onTitleChange?: (newTitle: string) => void;  // NEW: Callback to update App state
}

export function DocumentCanvas({ 
  tabTitle,  // NEW
  onTitleChange,  // NEW
  // ... other props
}: DocumentCanvasProps) {
  const [title, setTitle] = useState(tabTitle || initialTitle);
  
  // Sync with tab title when it changes externally (from address bar)
  useEffect(() => {
    if (tabTitle && tabTitle !== title) {
      setTitle(tabTitle);
    }
  }, [tabTitle]);
  
  // Update both local state and parent when title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };
  
  return (
    <div className="mb-4 pb-3 border-b border-gray-200">
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className="text-3xl font-bold text-gray-900 w-full"
      />
    </div>
  );
}
```

### 3. Wire Through CanvasContent
```typescript
// In CanvasContent.tsx
<DocumentCanvas
  tabTitle={tabTitle}  // Pass from parent
  onTitleChange={onTitleChange}  // Pass from parent
  initialTitle={documentData?.title}
  initialContent={documentData?.content}
  initialLastEdited={documentData?.lastEdited}
/>
```

---

## Debug Tips

### Enable Drag Progress Logging
```typescript
dragProgress.on('change', (value) => {
  console.log('Drag Progress:', value, 'Direction:', dragDirection);
});
```

### Visualize Tab States
```typescript
console.log({
  activeTabIndex,
  displayedTabIndex,
  dragDirection,
  isTransitioning,
  tabsLength: tabs.length
});
```

### Check Position Values
```typescript
console.log('Canvas positions:', {
  currentX: currentTabX.get(),
  adjacentX: adjacentTabX.get()
});
```

---

## Testing Checklist

- [ ] Swipe left on first tab → goes to second tab
- [ ] Swipe left on last tab → creates new blank tab
- [ ] Swipe right on second+ tab → goes to previous tab
- [ ] Swipe right on first tab → no effect (rubber-band)
- [ ] Quick swipe (<30% threshold) → snaps back
- [ ] Slow swipe (>30% threshold) → commits transition
- [ ] Address bar and canvas stay synchronized during all swipes
- [ ] Tab titles update correctly in both locations
- [ ] Vertical swipe up opens tab switcher (doesn't trigger horizontal swipe)
- [ ] Tap on address bar enters edit mode (doesn't trigger swipe)
- [ ] No jank or visual glitches during rapid swipes
- [ ] Works on both touch and pointer input devices

---

## Performance Metrics

**Target Goals**:
- Swipe response latency: <16ms (60fps)
- Animation duration: 200ms
- Threshold distance: 30% of screen width
- No dropped frames during transition

---

## Revision History

- **v1.0** (Oct 2025): Initial implementation with bidirectional tab switching
- Canvas and address bar synchronized sliding
- Preview new tab when swiping left on last tab
- Vertical swipe disambiguation for tab switcher