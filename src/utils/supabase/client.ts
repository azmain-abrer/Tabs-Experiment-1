/**
 * Supabase Client and API utilities
 */

import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const serverUrl = `${supabaseUrl}/functions/v1/make-server-9c4af64c`;

// Hardcoded user ID for MVP
export const HARDCODED_USER_ID = 'sparo-user-1';

/**
 * Fetch all tasks and tabs for the user
 */
export async function fetchTasksAndTabs() {
  try {
    const response = await fetch(`${serverUrl}/tasks/${HARDCODED_USER_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return { success: true, tasks: result.tasks };
  } catch (error) {
    console.error('Failed to fetch tasks and tabs:', error);
    return { success: false, error: String(error), tasks: [] };
  }
}

/**
 * Create a new task with initial blank tab
 */
export async function createTask(taskName: string) {
  try {
    const response = await fetch(`${serverUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        userId: HARDCODED_USER_ID,
        taskName,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return { success: true, task: result.task };
  } catch (error) {
    console.error('Failed to create task:', error);
    return { success: false, error: String(error), task: null };
  }
}

/**
 * Update a tab (name and/or canvas type)
 */
export async function updateTab(tabId: string, updates: { name?: string; canvasType?: string | null }) {
  try {
    const response = await fetch(`${serverUrl}/tabs/${tabId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return { success: true, tab: result.tab };
  } catch (error) {
    console.error('Failed to update tab:', error);
    return { success: false, error: String(error), tab: null };
  }
}
