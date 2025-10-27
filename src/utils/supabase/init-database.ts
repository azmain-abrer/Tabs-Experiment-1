/**
 * Database Initialization Utility
 * This runs the SQL to create tables in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export async function initializeDatabase() {
  const supabase = createClient(supabaseUrl, publicAnonKey);

  try {
    // Call the init-db endpoint on the server
    const response = await fetch(
      `${supabaseUrl}/functions/v1/make-server-9c4af64c/init-db`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return { success: false, error: String(error) };
  }
}
