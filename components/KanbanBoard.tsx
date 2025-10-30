'use client';

import { Box, Alert, CircularProgress, Snackbar } from '@mui/material';
import { useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import ConfirmDialog from './ConfirmDialog';
import { Task, TaskColumn as TaskColumnType } from '@/types/task';
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/useTaskStore';
import { useColumnStore } from '@/store/useColumnStore';

interface KanbanBoardProps {
  onEditTask: (task: Task) => void;
}

/**
 * Main Kanban board component with drag-and-drop functionality
 * Implements smooth animations and optimistic updates
 */
export default function KanbanBoard({ onEditTask }: KanbanBoardProps) {
  const { searchQuery } = useTaskStore();
  const { data, isLoading, error } = useTasks(searchQuery);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const columns = useColumnStore((s) => s.columns);
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overTaskId, setOverTaskId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskColumnType | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; taskId: string | null }>({ 
    open: false, 
    taskId: null 
  });

  // Configure drag sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Minimum drag distance to activate (reduced for smoother feel)
      },
    })
  );

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    if (!data?.data) return {};
    
    const grouped = data.data.reduce((acc, task) => {
      if (!acc[task.column]) {
        acc[task.column] = [];
      }
      acc[task.column].push(task);
      return acc;
    }, {} as Record<TaskColumnType, Task[]>);

    // sort each column by position if present
    (Object.keys(grouped) as TaskColumnType[]).forEach((col) => {
      grouped[col].sort((a, b) => {
        const pa = a.position ?? 0;
        const pb = b.position ?? 0;
        return pa - pb;
      });
    });

    return grouped;
  }, [data]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = data?.data.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      if (overTaskId !== null || overColumnId !== null) {
        setOverTaskId(null);
        setOverColumnId(null);
      }
      return;
    }
    let nextColumn: TaskColumnType | null = null;
    let nextTaskId: string | null = null;
    if (columns.some((c) => c.id === over.id)) {
      nextColumn = over.id as TaskColumnType;
    } else {
      const task = data?.data.find((t) => t.id === over.id);
      if (task) {
        nextColumn = task.column;
        nextTaskId = task.id;
      }
    }
    if (nextColumn !== overColumnId) setOverColumnId(nextColumn);
    if (nextTaskId !== overTaskId) setOverTaskId(nextTaskId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Add smooth delay before clearing active task for better animation
    setTimeout(() => setActiveTask(null), 200);
    setOverTaskId(null);
    setOverColumnId(null);
    
    if (!over || active.id === over.id) return;

    const draggedTask = data?.data.find((t) => t.id === active.id);
    if (!draggedTask) return;

    // Determine the target column and task
    let targetColumn: TaskColumnType | null = null;
    let overTask: Task | undefined = undefined;
    
    // Check if dropped directly on a column
    if (columns.some((col) => col.id === over.id)) {
      targetColumn = over.id as TaskColumnType;
    } else {
      // Check if dropped on a task
      overTask = data?.data.find((t) => t.id === over.id);
      if (overTask) {
        targetColumn = overTask.column;
      }
    }

    if (!targetColumn) return;

    // Always update the task to ensure position changes
    if (draggedTask.column !== targetColumn) {
      // Moving to different column
      const targetList = tasksByColumn[targetColumn] || [];
      // If over a task in the target column, insert before it, else at end
      if (overTask) {
        const idx = targetList.findIndex((t) => t.id === overTask.id);
        const prev = targetList[idx - 1];
        const prevPos = prev ? (prev.position ?? idx) : undefined;
        const overPos = overTask.position ?? idx + 1;
        const newPosition = prevPos !== undefined ? (prevPos + overPos) / 2 : overPos - 0.5;
        updateTask.mutate(
          { id: draggedTask.id, data: { column: targetColumn, position: newPosition } },
          {
            onSuccess: () => {
              setSnackbar({
                open: true,
                message: `✓ Moved to ${targetColumn.replace('-', ' ')} (before target)`,
                severity: 'success',
              });
            },
            onError: () => {
              setSnackbar({
                open: true,
                message: '✗ Failed to move task',
                severity: 'error',
              });
            },
          }
        );
      } else {
        const maxPos = targetList.reduce((max, t) => (t.position ?? 0) > max ? (t.position ?? 0) : max, 0);
        const newPosition = (maxPos || 0) + 1;
      updateTask.mutate(
        { id: draggedTask.id, data: { column: targetColumn, position: newPosition } },
        {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: `✓ Moved to ${targetColumn.replace('-', ' ')}`,
              severity: 'success',
            });
          },
          onError: () => {
            setSnackbar({
              open: true,
              message: '✗ Failed to move task',
              severity: 'error',
            });
          },
        }
      );
      }
    } else if (overTask && draggedTask.id !== overTask.id) {
      // Reordering within the same column
      const list = tasksByColumn[targetColumn] || [];
      // indices before drop (sorted by position)
      const draggedIndex = list.findIndex((t) => t.id === draggedTask.id);
      const overIndex = list.findIndex((t) => t.id === overTask.id);
      const droppingAfter = draggedIndex < overIndex;
      let newPos: number;
      if (droppingAfter) {
        const next = list[overIndex + 1];
        const overPos = overTask.position ?? overIndex + 1;
        const nextPos = next ? (next.position ?? overIndex + 2) : undefined;
        newPos = nextPos !== undefined ? (overPos + nextPos) / 2 : overPos + 1;
      } else {
        const prev = list[overIndex - 1];
        const overPos = overTask.position ?? overIndex + 1;
        const prevPos = prev ? (prev.position ?? overIndex) : undefined;
        newPos = prevPos !== undefined ? (prevPos + overPos) / 2 : overPos - 1;
      }
      updateTask.mutate({ id: draggedTask.id, data: { position: newPos } });
    }
  };

  const handleDeleteTask = (id: string) => {
    setDeleteConfirm({ open: true, taskId: id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.taskId) {
      deleteTask.mutate(deleteConfirm.taskId, {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: 'Task deleted successfully',
            severity: 'success',
          });
        },
        onError: () => {
          setSnackbar({
            open: true,
            message: 'Failed to delete task',
            severity: 'error',
          });
        },
      });
    }
    setDeleteConfirm({ open: false, taskId: null });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
        Failed to load tasks. Please ensure the API server is running on port 4000.
      </Alert>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            pb: 2,
            px: 1,
          }}
        >
          {columns.map((column) => {
            const base = (tasksByColumn[column.id] || []).filter((t) => t.id !== activeTask?.id);
            let placeholderIndex: number | null = null;
            if (activeTask && overColumnId === column.id) {
              const overList = base;
              let idx = overTaskId ? overList.findIndex((t) => t.id === overTaskId) : overList.length;
              if (idx < 0) idx = overList.length;
              placeholderIndex = idx;
            }
            return (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={base}
                placeholderIndex={placeholderIndex}
                onDeleteTask={handleDeleteTask}
                onEditTask={onEditTask}
                removable={!['backlog','in-progress','review','done'].includes(String(column.id))}
                onRemoveColumn={(id) => {
                  // Move tasks in removed column to backlog
                  const toMove = tasksByColumn[id as TaskColumnType] || [];
                  toMove.forEach((t) => updateTask.mutate({ id: t.id, data: { column: 'backlog' } }));
                  // Remove from column store
                  const removeColumn = (require('@/store/useColumnStore') as any).useColumnStore.getState().removeColumn;
                  removeColumn(id);
                }}
              />
            );
          })}
        </Box>

        {/* Drag Overlay for smooth drag animation */}
        <DragOverlay
          dropAnimation={{
            duration: 300,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeTask ? (
            <Box 
              sx={{ 
                cursor: 'grabbing', 
                transform: 'rotate(4deg) scale(1.05)',
                filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
              }}
            >
              <TaskCard
                task={activeTask}
                onDelete={() => {}}
                onEdit={() => {}}
              />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, taskId: null })}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

