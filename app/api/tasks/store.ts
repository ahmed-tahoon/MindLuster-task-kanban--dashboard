import type { Task } from '@/types/task';
import fs from 'fs';
import path from 'path';

let tasksStore: Task[] | null = null;

function loadInitialData(): Task[] {
  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    if (fs.existsSync(dbPath)) {
      const raw = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      if (Array.isArray(raw?.tasks)) return raw.tasks as Task[];
    }
  } catch (_) {}
  return [];
}

export function getStore(): Task[] {
  if (!tasksStore) tasksStore = loadInitialData();
  return tasksStore;
}


