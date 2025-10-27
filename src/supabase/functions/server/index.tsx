import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Hardcoded user ID for MVP
const HARDCODED_USER_ID = "sparo-user-1";
const TASKS_KEY = `${HARDCODED_USER_ID}:tasks`;

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
app.get("/make-server-9c4af64c/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all tasks and tabs for the user
app.get("/make-server-9c4af64c/tasks", async (c) => {
  try {
    const tasks = await kv.get(TASKS_KEY);
    
    if (!tasks) {
      return c.json({ success: true, tasks: [] });
    }

    return c.json({ success: true, tasks: JSON.parse(tasks) });
  } catch (err) {
    console.error("Error fetching tasks from KV store:", err);
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// Save all tasks (create or update)
app.post("/make-server-9c4af64c/tasks", async (c) => {
  try {
    const body = await c.req.json();
    const { tasks } = body;

    if (!tasks || !Array.isArray(tasks)) {
      return c.json({ success: false, error: "tasks array is required" }, 400);
    }

    await kv.set(TASKS_KEY, JSON.stringify(tasks));

    return c.json({ success: true });
  } catch (err) {
    console.error("Error saving tasks to KV store:", err);
    return c.json({ success: false, error: String(err) }, 500);
  }
});

Deno.serve(app.fetch);