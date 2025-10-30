import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface TaskStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isCreateModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

/**
 * Zustand store for managing global task-related state
 * Includes search functionality, modal states, and drag indicators
 */
export const useTaskStore = create<TaskStore>()(
  devtools(
    (set) => ({
      // Search state
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Selected task for viewing/editing
      selectedTaskId: null,
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),

      // Modal states
      isCreateModalOpen: false,
      setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),

      // Drag state for visual feedback
      isDragging: false,
      setIsDragging: (dragging) => set({ isDragging: dragging }),
    }),
    { name: 'TaskStore' }
  )
);

