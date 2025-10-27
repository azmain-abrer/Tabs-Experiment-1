<!-- PROJECT SPECIFICATIONS -->


# What We're Building
- Safari-style Tab Bar with draggable tabs to switch tabs horizontally
- One, two, or three tabs visible at a time depending on how many tabs there are and which tab in the list of open tabs the user is switched to
- The focused tab should be the center tab and unfocused tabs should show their clipped edges on either side of the focused tab, respectively
- Dragging left or right on the address bar to switch tabs should also move the tab being shown to the left or right to be pushed off by the incoming tab now being focused on
- Dragging from right to left on the last tab's address bar (or first tab's address bar if there is only one tab open) should open a new tab which has a corresponding address bar that fades and pushes in from the right edge of the tab bar
- Dragging from left to right on the first (or single) tab should rubber band and snap back the tab's address bar (without moving the tab content area)
- Only one tab can be focused at a time
- Top edge of Tab Bar has a pill with the Task Name that the tabs belong to (Tasks will be implemented later on)
- Focused tab's address bar has history and undo buttons constrained to its left and right edges
- Address bars have tab names and an icon to the left of the tab name
- Under the address bar there are 5 action buttons: Home, Tab Switcher, Sparo, Comments, Share
- Pressing Tab Switcher button animates tabs to show in a grid view with rectangular tab previews like in mobile Safari (dragging the focused tab's address bar up does the same)
- Tab Switcher displays counter of open tabs in the Task inside the icon
- Tabs can be closed from the Tab Switcher view by swiping them off to the left
- Comments button displays counter of comments inside the tab
- Pressing Comments button opens comments modal with comments related to tab from multiple collaborators
- Share button opens modal that lets the user add collaborators via link or email
- Should also have a Progressive Web App implementation detailed in PWASetup.md that you should add at as the last step

# Styling
- Keep it simple and modern, using standard iOS light-mode colors and design patterns
- Use Outfit as the typeface throughout the project
- Follow Figma Design files styling where provided

# Backend Config
- Read this reference implementation for the TAB SYSTEM ONLY before you start coding: https://github.com/azmain-abrer/Tasks-Demo-1
- Improve upon it by simplifying overcomplicated implementations and following your Guidelines.md instructions
- Save the open tabs and focused tab, and all other relevant states, to Supabase so they persist upon reloading

---

# Updated Project Specifications

## Overview
A mobile-first tabbed browser interface where users can create and manage multiple tabs within tasks. Each tab can contain different types of canvases (Doc, Sheet, Comm, Chat).

---

## Core Components

### 1. Tab Bar Component
**Location**: Fixed to bottom of viewport  
**Responsive Sizing**: Scales continuously based on device width (S/M/L samples demonstrate scaling, not breakpoints)

**Visual Structure**:
- **Task Name Badge** (top of tab bar)
- **Active Tab Section** with:
  - Editable tab name field
  - Canvas type icon (Doc/Sheet/Comm/Chat)
  - Edit history button (left edge)
  - Undo button (right edge)
- **Inactive Tab Indicators** (when multiple tabs exist, positioned off-screen)
- **Bottom Action Row**:
  - Home icon (left)
  - Switcher button with tab count badge
  - **Sparo button** (center, prominent)
  - Comments icon with count badge
  - Share icon (right)

**States to Handle**:
- Single tab active
- Multiple tabs: first focused
- Multiple tabs: middle focused
- Multiple tabs: last focused

**Imported Components**:
- `/imports/STabBar.tsx` (small, multiple tabs - first/middle/last focused)
- `/imports/MTabBar.tsx` (medium, multiple tabs - first/middle/last focused)
- `/imports/STabBar-13-1597.tsx` (small, single tab)
- `/imports/MTabBar-13-1694.tsx` (medium, single tab)
- Associated SVG icon files

---

### 2. Tab Content Area
**Layout**: Fills entire viewport  
**Positioning**: Behind/above the tab bar  
**Initial State**: Empty (to be populated based on canvas type)

---

### 3. Blank Tab (New Tab Experience)
**Trigger**: When new tab is created  
**Responsive**: Scales continuously with device width

**Content**:
- Heading: "What would you like to create?"
- **2×2 Canvas Type Selection Grid**:
  1. **New Doc** - Blue document icon
  2. **New Sheet** - Green spreadsheet icon
  3. **New Comm** - Red/coral icon
  4. **New Chat** - Purple chat icon
- Address bar with blank tab icon + editable name field
- Bottom navigation matching tab bar design

**Imported Image**: `figma:asset/dc8310961105bed1559fb67f17bebb5f952c94c6.png`

---

### 4. Tab Switcher View
**Activation Methods**:
- Click/tap Switcher button in tab bar
- Drag focused address bar upward

**Layout**:
- Dark background
- Grid of tab thumbnails (miniature previews)
- Tabs grouped by Task name
- Chronological order (by tab creation time)

**Interactions**:
- Active tab shrinks and moves into appropriate grid position
- Smooth transition (150-300ms)
- Tabs can be closed by swiping left

**Scope for MVP**: Build ONE task with multiple tabs

---

## Canvas Types

Each tab displays one canvas type with corresponding icon and color theme:

| Type | Icon Color | Purpose |
|------|-----------|---------|
| **Doc** | Blue | Document editing |
| **Sheet** | Green | Spreadsheet/data |
| **Comm** | Red/Coral | Communication |
| **Chat** | Purple | Messaging/chat |

Icon variants visible in address bar and blank tab selection grid.

---

## Data Structure

```typescript
interface Tab {
  id: string;
  name: string;
  canvasType: 'doc' | 'sheet' | 'comm' | 'chat' | null;
  createdAt: number;
  isActive: boolean;
  commentCount: number;
}

interface Task {
  id: string;
  name: string;
  tabs: Tab[];
}
```

---

## Implementation Roadmap

### ✅ Phase 0: Planning & Setup
- [x] Review all imported Figma components
- [x] Document specifications
- [x] Review Specs.md and ask clarifying questions
- [x] Create implementation plan for Phase 1

---

### 🔄 Phase 1: Tab Bar & Basic Tab Management (IN PROGRESS)

#### ✅ 1a. Tab Bar Integration (COMPLETED)
- [x] Create responsive tab bar that scales continuously with device width
- [x] Position tab bar at bottom with proper backdrop blur
- [x] Create empty tab content area that fills viewport
- [x] Implement proper z-index layering
- [x] Create TypeScript interfaces (Tab, Task, CanvasType)
- [x] Create TabBar wrapper component switching between S/M variants
- [x] Initialize app with single blank tab

#### ✅ 1b. Tab State Management (COMPLETED)
- [x] Set up Supabase connection and KV store
- [x] Create tab data structure in React state
- [x] Sync state with Supabase for persistence
- [x] Create initial tab on app load
- [x] Handle active tab state
- [x] Update tab bar to reflect current tab count and position

#### ✅ 1c. Blank Tab & Canvas Selection (COMPLETED)
- [x] Display blank tab content when new tab created
- [x] Implement 2×2 canvas type selection grid
- [x] Handle canvas type selection interaction
- [x] Update tab state with selected canvas type
- [x] Persist selection to Supabase

#### ✅ 1d. Tab Switching via Drag (COMPLETED)
- [x] Implement horizontal drag on address bar
- [x] Switch between tabs on drag left/right
- [x] Animate tab transitions (150-300ms)
- [x] Handle edge cases (first/last tab)
- [x] Rubber band effect on first tab drag-right

#### ✅ 1e. New Tab Creation (COMPLETED)
- [x] Drag right-to-left on last tab to create new tab
- [x] Animate new address bar fade-in from right
- [x] Initialize new blank tab
- [x] Update Supabase with new tab

---

### 🔲 Phase 2: Tab Switcher View

#### 2a. Switcher Activation
- [ ] Handle Switcher button press
- [ ] Handle upward drag on address bar
- [ ] Animate active tab shrinking into grid position
- [ ] Display dark background overlay

#### 2b. Grid Layout
- [ ] Create grid of tab thumbnails
- [ ] Display task name header
- [ ] Show tab count badge on switcher button
- [ ] Implement chronological ordering

#### 2c. Tab Selection & Closing
- [ ] Handle tab selection from grid
- [ ] Animate selected tab expanding back to active state
- [ ] Implement swipe-left to close tab
- [ ] Update Supabase when tab closed
- [ ] Handle closing last tab (prevent or create new blank)

---

### 🔲 Phase 3: Sparo Button Functionality

#### 3a. Single Press - Voice Input
- [ ] Detect single press on Sparo button
- [ ] Activate microphone
- [ ] Show recording indicator/animation
- [ ] Listen until user stops speaking
- [ ] Alternative: Press anywhere on screen to stop recording
- [ ] Process voice command (implementation TBD)

#### 3b. Double Press - Text Input
- [ ] Detect double press on Sparo button
- [ ] Open keyboard with text input area (Siri-style)
- [ ] Handle text command submission
- [ ] Close input area after submission
- [ ] Process text command (implementation TBD)

---

### 🔲 Phase 4: Additional Tab Bar Features

#### 4a. Edit History & Undo
- [ ] Implement edit history button functionality
- [ ] Implement undo button functionality
- [ ] Track changes per tab
- [ ] Persist history to Supabase

#### 4b. Comments System
- [ ] Create comments data structure
- [ ] Display comment count badge
- [ ] Open comments modal on button press
- [ ] Show comments from collaborators
- [ ] Add new comment functionality
- [ ] Persist comments to Supabase

#### 4c. Share Functionality
- [ ] Create share modal
- [ ] Add collaborators via email
- [ ] Generate shareable link
- [ ] Handle permissions (read/write)
- [ ] Persist collaborators to Supabase

#### 4d. Home Button
- [ ] Define Home button functionality
- [ ] Implement navigation/action

---

### 🔲 Phase 5: Canvas Content Implementation

#### 5a. Doc Canvas
- [ ] Create Doc canvas component
- [ ] Implement basic document editing
- [ ] Persist doc content to Supabase

#### 5b. Sheet Canvas
- [ ] Create Sheet canvas component
- [ ] Implement spreadsheet functionality
- [ ] Persist sheet data to Supabase

#### 5c. Comm Canvas
- [ ] Create Comm canvas component
- [ ] Implement communication features
- [ ] Persist comm data to Supabase

#### 5d. Chat Canvas
- [ ] Create Chat canvas component
- [ ] Implement messaging functionality
- [ ] Persist chat messages to Supabase

---

### 🔲 Phase 6: Advanced Features (Future)

- [ ] Multiple task support
- [ ] Task management interface
- [ ] Tab thumbnails with actual content previews
- [ ] Drag-and-drop tab reordering
- [ ] Tab duplication
- [ ] Tab bookmarking/favorites
- [ ] Search across tabs
- [ ] Tab groups/folders

---

## Technical Constraints

- **NO localStorage** - Use React state synchronized with Supabase
- **Mobile-first** - Scale continuously to tablet/desktop
- **Preserve Figma imports** - Keep exact styling and structure
- **Smooth animations** - 150-300ms transitions
- **Touch targets** - Minimum 44×44px
- **Typeface** - Outfit font throughout

---

## Current Status

**Last Updated**: Phase 1d & 1e Completed  
**Current Phase**: Phase 1 - Tab Bar & Basic Tab Management (COMPLETED ✅)  
**Completed**:
- ✅ Phase 1a: Tab Bar Integration
- ✅ Phase 1b: Tab State Management with Supabase
- ✅ Phase 1c: Blank Tab & Canvas Selection
- ✅ Phase 1d: Tab Switching via Drag
- ✅ Phase 1e: New Tab Creation

**Next Steps**: 
1. Begin Phase 2 - Tab Switcher View
2. Or continue refining Phase 1 features as needed

---

## Implementation Log

### Phase 1d & 1e - Tab Switching and New Tab Creation (Completed) - BUGFIX UPDATE
**Date**: Latest Implementation

**Files Created**:
- `/components/DraggableAddressBar.tsx` - Drag interaction wrapper for address bar
- `/components/DebugPanel.tsx` - Debug panel for testing (temporary)

**Files Modified**:
- `/App.tsx` - Added tab switching, new tab creation, and blank tab enforcement
- `/components/TabBar.tsx` - Added drag handler props
- `/imports/STabBar-13-1597.tsx` - Integrated DraggableAddressBar
- `/imports/MTabBar-13-1694.tsx` - Integrated DraggableAddressBar
- `/components/DraggableAddressBar.tsx` - Fixed drag event handling

**Implementation Details**:
- **Drag Detection**: Touch and mouse event support with 60px swipe threshold
- **Tab Switching**: Swipe left/right to navigate between tabs with smooth 250ms transitions
- **New Tab Creation**: Swipe left on last tab or single tab creates new blank tab
- **Rubber Band Effect**: Swipe right on first/single tab shows rubber band with 3x resistance
- **Naming Logic**: New blank tabs follow "Blank Tab [N]" pattern
- **Supabase Sync**: All tab changes automatically persist to server
- **Smooth Animations**: CSS transform with cubic-bezier easing (0.4, 0, 0.2, 1)
- **Visual Feedback**: Cursor changes to grabbing during drag
- **Blank Tab Enforcement**: Always maintains at least one blank tab when all tabs have canvas types
- **Debug Logging**: Comprehensive console logs to track drag flow and state changes

**Bugfixes Applied**:
- Fixed drag event interference from clickable child elements (undo/edit buttons)
- Created transparent draggable overlay (z-10) above content to capture all drag events
- Content underneath has pointer-events-none to prevent interference
- Used useCallback and refs to prevent stale closures in event handlers
- Added debug panel to visualize tab state during development

**Interaction Flow**:
1. User drags address bar left → switches to next tab OR creates new tab if last/single
2. User drags address bar right → switches to previous tab OR rubber bands if first/single
3. Drag must exceed 60px threshold to trigger action
4. Address bar smoothly animates back to position after release
5. When a blank tab gets a canvas type assigned, system auto-creates new blank tab

### Phase 1b - Tab State Management (Completed)
**Date**: Latest Implementation

**Files Created**:
- `/utils/supabase/api.ts` - Supabase API client for tasks CRUD operations
- `/components/CanvasIcon.tsx` - Dynamic canvas type icon component

**Files Modified**:
- `/App.tsx` - Added Supabase integration with loading/error states
- `/supabase/functions/server/index.tsx` - Added KV store endpoints for tasks
- `/components/TabBar.tsx` - Updated to pass dynamic tab name and canvas type
- `/imports/MTabBar-13-1694.tsx` - Integrated dynamic props for tab name/icon
- `/imports/STabBar-13-1597.tsx` - Integrated dynamic props for tab name/icon

**Implementation Details**:
- Using Supabase KV store for persistence (simpler than custom tables for MVP)
- Hardcoded user ID: `sparo-user-1`
- Default task created if none exists: "Untitled Task 1" with single blank tab
- Task state syncs to Supabase on every change
- Loading state shown while fetching from server
- Error messages displayed with retry button
- Tab name and canvas icon now dynamic in imported TabBar components
- Canvas type selection persists to Supabase immediately

**Server Endpoints**:
- `GET /make-server-9c4af64c/tasks` - Fetch all tasks
- `POST /make-server-9c4af64c/tasks` - Save all tasks

### Phase 1a - Tab Bar Integration (Completed)
**Date**: Initial Implementation

**Files Created**:
- `/types/index.ts` - TypeScript interfaces for Tab, Task, CanvasType
- `/components/TabBar.tsx` - Responsive wrapper switching between S/M variants
- `/components/BlankTab.tsx` - Canvas type selection screen

**Files Modified**:
- `/App.tsx` - Main app with tab state management and layout

**Implementation Details**:
- Created responsive TabBar that switches between STabBar-13-1597 (small) and MTabBar-13-1694 (medium) based on viewport width
- Breakpoint: 500px (< 500px = small, >= 500px = medium)
- Tab bar fixed to bottom with z-index 50
- Content area has bottom padding to prevent overlap with tab bar
- Initial state: Single blank tab with canvasType: null
- BlankTab component shows 2×2 grid of canvas type options
- Canvas type selection updates tab state
- Placeholder views for Doc/Sheet/Comm/Chat canvases
