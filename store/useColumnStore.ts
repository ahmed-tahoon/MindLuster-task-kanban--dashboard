import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { COLUMNS as DEFAULT_COLUMNS, TaskColumn } from '@/types/task';

export interface ColumnDef {
  id: TaskColumn;
  label: string;
  color: string;
}

interface ColumnStore {
  columns: ColumnDef[];
  addColumn: (label: string) => void;
  removeColumn: (id: TaskColumn) => void;
}

export const useColumnStore = create<ColumnStore>()(
  persist(
    devtools((set, get) => ({
      columns: DEFAULT_COLUMNS,
      addColumn: (label: string) => {
        const id = label
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-');
        const exists = get().columns.some((c) => c.id === id);
        if (exists) return;
        const colorPalette = ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
        const color = colorPalette[get().columns.length % colorPalette.length];
        set({ columns: [...get().columns, { id, label, color }] });
      },
      removeColumn: (id: TaskColumn) => {
        const next = get().columns.filter((c) => c.id !== id);
        set({ columns: next });
      },
    })),
    { name: 'column-store' }
  )
);


