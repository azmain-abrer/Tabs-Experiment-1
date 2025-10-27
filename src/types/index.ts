// Type definitions for the Sparo app

/**
 * Canvas types that a tab can contain
 */
export type CanvasType = 'doc' | 'sheet' | 'comm' | 'chat';

/**
 * Represents a single tab within a task
 */
export interface Tab {
  id: string;
  name: string;
  canvasType: CanvasType | null; // null means blank tab (no canvas selected yet)
  createdAt: number; // Unix timestamp for chronological ordering
  isActive: boolean;
  commentCount: number;
}

/**
 * Represents a task containing multiple tabs
 */
export interface Task {
  id: string;
  name: string;
  tabs: Tab[];
}
