'use client';

import { Box, Typography, Paper, Button, CircularProgress, IconButton } from '@mui/material';
import { Add as AddIcon, DeleteOutline } from '@mui/icons-material';
import { Task, TaskColumn as TaskColumnType } from '@/types/task';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

interface TaskColumnProps {
  column: {
    id: TaskColumnType;
    label: string;
    color: string;
  };
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  placeholderIndex?: number | null;
  onRemoveColumn?: (id: TaskColumnType) => void;
  removable?: boolean;
}

/**
 * Kanban column component with drag-and-drop drop zone
 * Implements infinite scroll for loading more tasks
 */
export default function TaskColumn({
  column,
  tasks,
  onDeleteTask,
  onEditTask,
  onLoadMore,
  hasMore,
  isLoadingMore,
  placeholderIndex = null,
  onRemoveColumn,
  removable = false,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasMore && onLoadMore && !isLoadingMore) {
      onLoadMore();
    }
  }, [inView, hasMore, onLoadMore, isLoadingMore]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        minWidth: 300,
        maxWidth: 350,
        height: 'fit-content',
        maxHeight: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isOver ? 'rgba(37, 99, 235, 0.06)' : 'rgba(255,255,255,0.82)',
        backdropFilter: 'saturate(180%) blur(8px)',
        border: '3px solid',
        borderColor: isOver ? column.color : 'divider',
        borderRadius: 2,
        boxShadow: isOver 
          ? `0 8px 16px -4px ${column.color}40, 0 4px 8px -2px ${column.color}30` 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        position: 'relative',
        zIndex: isOver ? 5 : 'auto',
      }}
    >
      {/* Column Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        pb={1}
        sx={{
          borderBottom: '2px solid',
          borderColor: 'divider',
          backgroundColor: column.color,
          color: '#fff',
          px: 1.5,
          py: 1,
          borderRadius: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#fff',
              opacity: 0.9,
            }}
          />
          <Typography variant="h6" fontSize="0.95rem" fontWeight={700}>
            {column.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: '0.75rem',
              color: '#fff',
            }}
          >
            {tasks.length}
          </Typography>
        </Box>
        {removable && onRemoveColumn && (
          <IconButton size="small" onClick={() => onRemoveColumn(column.id)} sx={{ color: '#fff' }}>
            <DeleteOutline fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Tasks List */}
      <Box
        ref={setNodeRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 1,
          minHeight: 200,
          // Allow shadows of first card without being cut
          pt: 1,
        }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <Box key={task.id}>
              {placeholderIndex !== null && index === placeholderIndex && (
                <Box
                  sx={{
                    height: 88,
                    border: '2px dashed',
                    borderColor: column.color,
                    borderRadius: 2,
                    mb: 2,
                    backgroundColor: 'action.hover',
                    transition: 'height 0.15s ease',
                  }}
                />
              )}
              <TaskCard task={task} onDelete={onDeleteTask} onEdit={onEditTask} />
            </Box>
          ))}
          {placeholderIndex !== null && tasks.length === placeholderIndex && (
            <Box
              sx={{
                height: 88,
                border: '2px dashed',
                borderColor: column.color,
                borderRadius: 2,
                mb: 2,
                backgroundColor: 'action.hover',
                transition: 'height 0.15s ease',
              }}
            />
          )}
        </SortableContext>

        {/* Infinite Scroll Trigger */}
        {hasMore && (
          <Box ref={loadMoreRef} sx={{ py: 2, textAlign: 'center' }}>
            {isLoadingMore && <CircularProgress size={24} />}
          </Box>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <Box
            sx={{
              py: 4,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">No tasks yet</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

