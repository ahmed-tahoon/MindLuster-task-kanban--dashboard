'use client';

import { Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Task } from '@/types/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { forwardRef } from 'react';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

/**
 * Individual task card component with drag-and-drop support
 * Entire card is draggable with smooth animations and proper button handling
 */
export default function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ 
    id: task.id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 2,
        position: 'relative',
        backgroundColor: isOver ? 'rgba(37, 99, 235, 0.08)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'saturate(180%) blur(6px)',
        border: '2px solid',
        borderColor: isDragging ? 'primary.main' : isOver ? 'primary.light' : 'divider',
        borderRadius: 2,
        boxShadow: isDragging 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transform: isDragging ? 'rotate(2deg) scale(1.05)' : 'none',
        '&:hover': {
          boxShadow: isDragging 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)' 
            : '0 6px 12px -2px rgba(0, 0, 0, 0.12)',
          borderColor: isDragging ? 'primary.main' : 'primary.light',
          // Avoid upward translate to prevent clipping inside scroll container
          transform: isDragging ? 'rotate(2deg) scale(1.05)' : 'none',
          zIndex: 2,
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography 
            variant="h6" 
            component="h3" 
            fontSize="1rem" 
            fontWeight={600}
            sx={{ 
              pointerEvents: 'none',
              flex: 1,
              pr: 1,
            }}
          >
            {task.title}
          </Typography>
          <Box 
            sx={{ 
              display: 'flex',
              gap: 0.5,
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              sx={{ 
                pointerEvents: 'auto',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              sx={{ 
                pointerEvents: 'auto',
                '&:hover': {
                  backgroundColor: 'error.lighter',
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 1.5,
            pointerEvents: 'none',
          }}
        >
          {task.description}
        </Typography>
        
        <Chip
          label={task.column.replace('-', ' ')}
          size="small"
          sx={{
            textTransform: 'capitalize',
            fontSize: '0.75rem',
            height: 24,
            pointerEvents: 'none',
          }}
        />
      </CardContent>
    </Card>
  );
}

