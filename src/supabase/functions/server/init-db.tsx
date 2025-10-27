/**
 * Database Initialization Script
 * Run this once to create the tables for Sparo tab management
 */

export const createTablesSQL = `
-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tabs table
CREATE TABLE IF NOT EXISTS tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  canvas_type TEXT CHECK (canvas_type IN ('doc', 'sheet', 'comm', 'chat')),
  is_active BOOLEAN DEFAULT false,
  comment_count INTEGER DEFAULT 0,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tabs_task_id ON tabs(task_id);
CREATE INDEX IF NOT EXISTS idx_tabs_position ON tabs(task_id, position);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tabs_updated_at ON tabs;
CREATE TRIGGER update_tabs_updated_at BEFORE UPDATE ON tabs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;
