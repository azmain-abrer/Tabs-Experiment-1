/**
 * Supabase API Client
 * Uses the KV store for persisting tasks and tabs
 */

import { projectId, publicAnonKey } from './info';
import { Task } from '../../types';

const supabaseUrl = `https://${projectId}.supabase.co`;
const serverUrl = `${supabaseUrl}/functions/v1/make-server-9c4af64c`;

// Hardcoded user ID for MVP
export const HARDCODED_USER_ID = 'sparo-user-1';

// KV store keys
const TASKS_KEY = `${HARDCODED_USER_ID}:tasks`;

/**
 * Fetch all tasks and tabs for the user
 */
export async function fetchTasks(): Promise<{ success: boolean; tasks: Task[]; error?: string }> {
  try {
    const response = await fetch(`${serverUrl}/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error fetching tasks');
    }

    return { success: true, tasks: result.tasks || [] };
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return { success: false, error: String(error), tasks: [] };
  }
}

/**
 * Save all tasks to the server
 */
export async function saveTasks(tasks: Task[]): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${serverUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ tasks }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error saving tasks');
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to save tasks:', error);
    return { success: false, error: String(error) };
  }
}
