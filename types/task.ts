export type TaskColumn = string; // allow dynamic columns

export interface Task {
  id: string;
  title: string;
  description: string;
  column: TaskColumn;
  position?: number; // optional for backward compatibility
}

export interface TaskFormData {
  title: string;
  description: string;
  column: TaskColumn;
  position?: number;
}

export const COLUMNS: { id: TaskColumn; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: '#6B7280' },
  { id: 'in-progress', label: 'In Progress', color: '#3B82F6' },
  { id: 'review', label: 'Review', color: '#F59E0B' },
  { id: 'done', label: 'Done', color: '#10B981' },
];

