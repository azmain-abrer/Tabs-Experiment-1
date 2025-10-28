# Tabs Reference Guide

## Overview

Sparo is a mobile-first tabbed browser interface where users can create and manage multiple tabs within tasks. Each tab can contain different canvas types (Doc, Sheet, Comm, Chat), providing a flexible workspace for different content types.

---

## Core Concepts

### Task Structure
- **Task**: A container that holds multiple tabs (e.g., "Untitled Task 1")
- **Tab**: An individual workspace within a task that contains canvas content
- **Canvas Type**: The type of content a tab displays (Doc, Sheet, Comm, Chat, or Blank)

### Single User Model
- The app uses a hardcoded single user for MVP
- No authentication required
- All data is persisted to Supabase KV store

---

## Tab Lifecycle

### 1. Tab Creation

**Automatic Creation:**
- When no tabs exist, a blank tab is automatically created
- Ensures users always have at least one tab available

**Manual Creation:**
- Users can create new tabs via:
  - Swiping left on the last tab (drag past the end)
  - Clicking "New Tab" button in Tab Switcher
- New tabs are always created as blank tabs

**Code Location:** `App.tsx` - `createNewTab()` function

### 2. Blank Tab State

When a tab is first created, it displays a blank canvas with four options:

- **New Doc** (Blue icon)
- **New Sheet** (Green icon)  
- **New Comm** (Red icon)
- **New Chat** (Purple icon)

**Component:** `BlankTab.tsx`

**Behavior:**
- Displays a 2x2 grid of canvas type selectors
- Responsive design: M variant (< 500px) and L variant (≥ 500px)
- Question prompt: "What would you like to create?"

### 3. Canvas Type Selection

When a user selects a canvas type:

1. **Tab is renamed** to "Untitled [CanvasType]" (e.g., "Untitled Doc")
2. **Canvas type icon** replaces the blank tab icon in the tab bar
3. **Canvas content area** displays the selected canvas type

**Code Location:** `App.tsx` - `handleCanvasTypeSelect()` function

**Naming Convention:**
- No numbering (unlike tasks)
- Always "Untitled [CanvasType]"
- Users can rename tabs via inline editing

### 4. Tab Closing

**Rules:**
- Users can close any tab except the last one
- Closing the last tab automatically creates a new blank tab
- When closing the active tab, focus moves to an adjacent tab

**Smart Focus Logic:**
- If closing a tab that's not the last: activate the next tab (same index)
- If closing the last tab: activate the previous tab (index - 1)

**Code Location:** `App.tsx` - `handleTabClose()` function

---

## Tab Navigation

### 1. Tab Bar (Bottom Navigation)

**Fixed Position:**
- Always visible at the bottom of the screen
- Height: 185px (151px content + 34px safe area)
- Content area: `calc(100vh - 185px)`

**Components:**
1. **Task Name** - Displays current task name (editable)
2. **Active Tab** - Shows current tab name and icon (editable)
3. **Tab Indicators** - Visual dots showing tab position
4. **Switcher Button** - Opens full tab switcher view

**Component:** `TabBar.tsx`

### 2. Horizontal Swipe Navigation

**Drag-to-Switch Tabs:**
- Swipe left: Go to next tab (or create new tab if on last tab)
- Swipe right: Go to previous tab (rubber band effect on first tab)
- Threshold: 30% of screen width to trigger switch
- Visual feedback: Tabs slide during drag

**Implementation:**
- Address bar is draggable horizontally
- Synchronized animation between tab bar and canvas area
- Uses Motion (Framer Motion) for smooth transitions

**Components:**
- `DraggableAddressBar.tsx` - Handles drag interactions
- `TabBar.tsx` - Displays tab sliding animation
- `CanvasArea.tsx` - Slides canvas content in sync

**Direction Locking:**
- First 15px of drag determines direction (horizontal vs vertical)
- Once locked, only that direction responds
- Prevents diagonal drags

### 3. Vertical Swipe Navigation

**Drag-Up to Open Switcher:**
- Swipe up on address bar: Opens Tab Switcher
- Threshold: 60px upward drag
- Alternative: Click switcher button

**Component:** `DraggableAddressBar.tsx`

### 4. Tab Switcher (Full Screen)

**Activation:**
- Swipe up on address bar (60px threshold)
- Click switcher button in tab bar
- Prevents body scroll when open

**Features:**
- Full-screen overlay
- Scrollable list of all tabs
- Active tab highlighted with blue border
- Each tab shows: icon, name, comment count
- "New Tab" button at bottom
- Close button (X) on each tab card

**Component:** `TabSwitcher.tsx`

**Interactions:**
- Click tab card: Switch to that tab and close switcher
- Click X: Close that specific tab
- Click "New Tab": Create new blank tab
- Click anywhere outside: Close switcher

---

## Tab Indicators

### Visual Design

**Indicator Dots:**
- Show current position in tab sequence
- Maximum 5 dots displayed at once for space efficiency
- Active tab: Larger dot (12x12px) with blue fill
- Inactive tabs: Smaller dots (8x8px) with gray outline

### Smart Positioning Logic

**Scenarios:**

1. **≤ 5 tabs total:**
   - Show all tabs as dots
   - Simple 1:1 mapping

2. **> 5 tabs total:**
   - Show 5 dots representing position windows
   - Active dot position depends on current tab index
   
   **Position Rules:**
   - First 2 tabs: Active dot at position 0 or 1
   - Middle tabs: Active dot at position 2 (center)
   - Last 2 tabs: Active dot at position 3 or 4

**Example with 10 tabs:**
```
Tab 1 active:  ● ○ ○ ○ ○  (represents tabs 1-5)
Tab 2 active:  ○ ● ○ ○ ○  (represents tabs 1-5)
Tab 5 active:  ○ ○ ● ○ ○  (represents tabs 3-7)
Tab 9 active:  ○ ○ ○ ● ○  (represents tabs 6-10)
Tab 10 active: ○ ○ ○ ○ ●  (represents tabs 6-10)
```

**Component:** `TabBar.tsx` - Tab indicator rendering logic

---

## Canvas Types

### Available Types

1. **Doc** 
   - Icon: Blue document
   - Purpose: Text/document editing
   - Status: Placeholder (Coming Soon)

2. **Sheet**
   - Icon: Green spreadsheet
   - Purpose: Tabular data/spreadsheets
   - Status: Placeholder (Coming Soon)

3. **Comm**
   - Icon: Red communication bubbles
   - Purpose: Team communication
   - Status: Placeholder (Coming Soon)

4. **Chat**
   - Icon: Purple chat bubble
   - Purpose: Chat/messaging
   - Status: Placeholder (Coming Soon)

**Component:** `CanvasIcon.tsx` - Renders appropriate icon based on canvas type

### Canvas Rendering

Each canvas type currently shows a placeholder message. The canvas area is designed to be extended with actual functionality for each type.

**Component:** `CanvasArea.tsx` - `renderCanvasContent()` function

---

## Data Persistence

### Storage Architecture

**Backend:** Supabase KV Store
- Key-value storage in Postgres database
- Table: `kv_store_9c4af64c`
- Utility functions: `kv_store.tsx`

**Storage Key:** `sparo:tasks`

**Data Structure:**
```typescript
{
  tasks: [
    {
      id: "task-1234567890",
      name: "Untitled Task 1",
      tabs: [
        {
          id: "tab-1234567890",
          name: "Blank Tab" | "Untitled Doc" | etc,
          canvasType: null | "doc" | "sheet" | "comm" | "chat",
          createdAt: 1234567890,
          isActive: true | false,
          commentCount: 0
        }
      ]
    }
  ]
}
```

### Persistence Flow

1. **Initial Load:**
   - `App.tsx` calls `fetchTasksFromServer()` on mount
   - If no tasks exist, creates default task with blank tab
   - Sets local state with loaded/created task

2. **Auto-Save:**
   - `useEffect` watches task state changes
   - Debounced save after 500ms of inactivity
   - Calls `saveTasksToServer()` to persist to KV store

3. **Error Handling:**
   - Load errors: Create default task locally and show error message
   - Save errors: Log to console and show user-facing error
   - Retry option available on critical errors

**Code Locations:**
- `App.tsx` - State management and persistence logic
- `utils/supabase/api.ts` - API functions for fetch/save
- `supabase/functions/server/index.tsx` - Server endpoints

---

## Animation System

### Drag Progress Tracking

**Shared MotionValue:**
- `dragProgress` MotionValue (0 to 1) tracks drag completion
- Synchronized between TabBar and CanvasArea
- Enables perfectly coordinated animations

**Direction State:**
- `dragDirection`: 'left' | 'right' | null
- Locked during drag to prevent direction changes
- Cleared on drag end

### Tab Sliding Animation

**During Drag:**
- Current tab slides out in drag direction
- Next/previous tab slides in from opposite direction
- Both tab bar and canvas area move in sync
- Rubber band effect when dragging right on first tab

**On Release:**
- If threshold met (30%): Complete transition to new tab
- If threshold not met: Snap back to original position
- Transition duration: 250ms cubic-bezier easing

**Component Coordination:**
```
DraggableAddressBar (user input)
        ↓
    App.tsx (state management)
        ↓
  dragProgress MotionValue (shared state)
        ↓
   TabBar + CanvasArea (visual output)
```

### Transition Safety

**Race Condition Prevention:**
- `isTransitioning` flag blocks input during animations
- `isDragging` ref prevents duplicate drag starts
- Timeout cleanup on component unmount
- Direction locked until drag completes

**Code Location:** `App.tsx` - `handleSwipeStart/Move/End()` functions

---

## Touch Event Handling

### Preventing Scroll Interference

**Problem:** Touch drag on address bar was also scrolling content

**Solution:**
1. Native touch listeners with `{ passive: false }`
2. Always `preventDefault()` during drag
3. `stopPropagation()` to prevent event bubbling
4. Explicit `touchAction: 'none'` CSS

**Component:** `DraggableAddressBar.tsx`

### Event Flow

1. **Touch Start:**
   - Record initial touch position
   - Set `isDragging` flag
   - Prevent default browser behavior

2. **Touch Move:**
   - Calculate delta from start position
   - Determine direction if not yet locked (15px threshold)
   - Update drag progress
   - Prevent scrolling via `preventDefault()`

3. **Touch End:**
   - Check if threshold met (30% for switch, 60% for switcher)
   - Execute action or snap back
   - Clear drag state
   - Animate to final position

---

## Responsive Design

### Breakpoints

**Mobile-First Approach:**
- Default: < 500px (Mobile)
- Tablet/Desktop: ≥ 500px

**Responsive Components:**

1. **BlankTab:**
   - M variant: Smaller icons and text (< 500px)
   - L variant: Larger icons and text (≥ 500px)
   - Grid maintains 2x2 layout on all sizes

2. **TabBar:**
   - Scales continuously based on viewport width
   - No fixed breakpoints
   - Tab count affects available space

3. **TabSwitcher:**
   - Full screen on all devices
   - Scrollable on smaller screens
   - Centered content on larger screens

### Safe Areas

**iOS/Android Considerations:**
- Bottom safe area: 34px padding
- Prevents tab bar from being hidden by home indicators
- Applied via CSS: `pb-[34px]` on TabBar

---

## Component Architecture

### Component Hierarchy

```
App.tsx (Root)
├── CanvasArea
│   └── BlankTab (when tab.canvasType === null)
│       └── Canvas Type Buttons
├── TabBar
│   ├── Task Name (editable)
│   ├── DraggableAddressBar
│   │   ├── Active Tab Display (editable)
│   │   └── Tab Icon
│   ├── Tab Indicators
│   └── Switcher Button
└── TabSwitcher (overlay)
    ├── Task Name Display
    ├── Tab List
    │   └── Tab Cards (closeable)
    └── New Tab Button
```

### State Management

**Global State (App.tsx):**
- `task` - Current task with all tabs
- `isLoading` - Initial load state
- `error` - Error messages
- `isSwitcherOpen` - Tab switcher visibility
- `dragProgress` - Shared MotionValue for animations
- `dragDirection` - Current drag direction
- `isTransitioning` - Animation in progress flag

**Local State (Components):**
- `TabBar` - Viewport width for responsive sizing
- `CanvasArea` - Displayed tab index during transitions
- `DraggableAddressBar` - Drag offsets and animation state
- `BlankTab` - Viewport width for variant selection

### Props Flow

**Unidirectional Data Flow:**
- State lives in App.tsx
- Props passed down to children
- Callbacks passed down for state updates
- No prop drilling - direct parent-child relationships

---

## Key Files Reference

### Core Components

| File | Purpose | Key Responsibilities |
|------|---------|---------------------|
| `App.tsx` | Root component | State management, data persistence, coordination |
| `TabBar.tsx` | Bottom navigation | Tab display, indicators, drag handling |
| `TabSwitcher.tsx` | Full-screen overlay | Tab list, switching, closing, creating |
| `CanvasArea.tsx` | Content display | Canvas rendering, slide animations |
| `DraggableAddressBar.tsx` | Drag interaction | Touch handling, direction locking, swipe detection |
| `BlankTab.tsx` | Canvas selector | Canvas type selection grid |
| `CanvasIcon.tsx` | Icon rendering | SVG icons for canvas types |

### Utilities & Types

| File | Purpose |
|------|---------|
| `types/index.ts` | TypeScript type definitions |
| `utils/supabase/api.ts` | API functions for data fetch/save |
| `utils/supabase/client.ts` | Supabase client initialization |
| `supabase/functions/server/index.tsx` | Server endpoints |
| `supabase/functions/server/kv_store.tsx` | KV store utilities |

### Figma Imports

| Directory | Content |
|-----------|---------|
| `imports/*.tsx` | Figma-exported component code |
| `imports/svg-*.ts` | SVG path data for icons |

---

## Implementation Phases (Completed)

### Phase 1: Core Tab System
- ✅ 1a: Basic tab structure and state management
- ✅ 1b: Tab creation and automatic blank tab
- ✅ 1c: Canvas type selection and tab renaming
- ✅ 1d: Tab bar with active tab display
- ✅ 1e: Horizontal swipe to switch tabs
- ✅ 1f: Synchronized canvas sliding animation
- ✅ 1g: Drag-to-create new tab on last tab
- ✅ 1h: Rubber band effect on first tab

### Phase 2: Enhanced Features
- ✅ 2a: Smart tab closing behavior
- ✅ 2b: Refined tab indicators (max 5 dots)
- ✅ 2c: Task name editing
- ✅ 2d: Tab Switcher view
- ✅ 2e: Vertical drag to open switcher
- ✅ 2f: New Tab button in switcher
- ✅ 2g: Tab closing from switcher

### Phase 3: Polish & Persistence
- ✅ 3a: Supabase KV store integration
- ✅ 3b: Auto-save with debouncing
- ✅ 3c: Error handling and retry logic
- ✅ 3d: PWA functionality
- ✅ 3e: Manifest and icons
- ✅ 3f: Touch event handling fixes

---

## Performance Optimizations

### Animation Performance
- `willChange: 'transform'` on animated elements
- Motion MotionValues for shared state (no re-renders)
- Transform-based animations (GPU accelerated)
- Debounced auto-save (500ms)

### Memory Management
- Ref-based drag state (no render triggers)
- Cleanup of event listeners on unmount
- Timeout cleanup to prevent memory leaks

### Render Optimization
- Local state where possible
- Memoized callbacks with useCallback
- Early returns in useEffect dependencies

---

## Common Patterns

### Tab Finding
```typescript
const activeTab = task.tabs.find(tab => tab.isActive);
const activeIndex = task.tabs.findIndex(tab => tab.id === activeTab?.id);
```

### Tab State Updates
```typescript
setTask(prevTask => ({
  ...prevTask,
  tabs: prevTask.tabs.map(tab =>
    tab.id === targetId 
      ? { ...tab, /* updates */ }
      : tab
  )
}));
```

### Direction Locking Pattern
```typescript
if (dragDirectionRef.current === null) {
  if (Math.abs(deltaX) > THRESHOLD || Math.abs(deltaY) > THRESHOLD) {
    dragDirectionRef.current = Math.abs(deltaX) > Math.abs(deltaY) 
      ? 'horizontal' 
      : 'vertical';
  }
}
```

---

## Future Enhancements

### Potential Features
- Multi-task support with task switcher
- Tab reordering via drag-and-drop
- Tab duplication
- Tab search/filtering
- Actual canvas implementations (Doc, Sheet, Comm, Chat)
- Collaborative features
- Tab groups/organization
- Keyboard shortcuts
- Desktop-optimized layouts

### Known Limitations
- Single task only (MVP)
- Canvas types are placeholders
- No offline support (beyond session)
- No tab history/undo

---

## Debugging Tips

### Common Issues

1. **Tabs not switching:**
   - Check `isTransitioning` flag isn't stuck
   - Verify drag threshold is met (30%)
   - Ensure no console errors blocking state updates

2. **Scroll interference:**
   - Verify `{ passive: false }` on touch listeners
   - Check `preventDefault()` is being called
   - Confirm `touch-action: none` is applied

3. **Animation glitches:**
   - Clear `dragProgress` to 0 on start
   - Ensure `dragDirection` is cleared after transition
   - Check for race conditions with `isDragging` ref

4. **Data not persisting:**
   - Verify Supabase connection
   - Check KV store table exists
   - Review auto-save debounce timing
   - Check browser console for save errors

### Debug Logging

Add temporary logs in key locations:
```typescript
console.log('Drag progress:', dragProgress.get());
console.log('Direction:', dragDirection);
console.log('Active tab:', activeTab?.name);
console.log('Tabs saved:', result);
```

---

## TypeScript Types

### Core Types

```typescript
// Canvas content types
type CanvasType = 'doc' | 'sheet' | 'comm' | 'chat';

// Tab structure
interface Tab {
  id: string;
  name: string;
  canvasType: CanvasType | null;
  createdAt: number;
  isActive: boolean;
  commentCount: number;
}

// Task structure
interface Task {
  id: string;
  name: string;
  tabs: Tab[];
}

// API response types
interface ApiResponse {
  success: boolean;
  error?: string;
  tasks?: Task[];
}
```

**Location:** `types/index.ts`

---

## Best Practices

### When Adding New Features

1. **Plan the state changes** - What needs to be tracked?
2. **Consider mobile first** - Touch targets, gestures, screen size
3. **Test edge cases** - First tab, last tab, single tab, many tabs
4. **Maintain sync** - Keep tab bar and canvas area coordinated
5. **Preserve data** - Ensure auto-save handles new fields
6. **Update types** - Add TypeScript types for new data structures

### When Debugging

1. **Check state flow** - Is state updating correctly?
2. **Verify callbacks** - Are callbacks being passed and called?
3. **Test transitions** - Are animations completing properly?
4. **Review refs** - Are refs being used for latest values?
5. **Inspect persistence** - Is data saving and loading?

### Code Style

- Use descriptive variable names
- Add comments for complex logic
- Extract reusable functions
- Keep components focused
- Follow React hooks rules
- Use TypeScript strictly

---

## Conclusion

This tab management system provides a fluid, mobile-first experience for managing multiple workspaces. The implementation balances performance, user experience, and code maintainability while setting the foundation for future canvas functionality.

Key strengths:
- Smooth drag-based navigation
- Intelligent tab indicators
- Robust state management
- Reliable persistence
- Extensible architecture

For questions or clarifications, refer to the relevant component files or the implementation phase documentation in `Specs.md`.
