'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Task, TaskColumn } from '@/types/task';
import { useColumnStore } from '@/store/useColumnStore';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; column: TaskColumn }) => void;
  task?: Task | null;
  defaultColumn?: TaskColumn;
}

/**
 * Modal component for creating and editing tasks
 * Features form validation and Material UI styling
 */
export default function TaskModal({
  open,
  onClose,
  onSubmit,
  task,
  defaultColumn = 'backlog',
}: TaskModalProps) {
  const columns = useColumnStore((s) => s.columns);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [column, setColumn] = useState<TaskColumn>(defaultColumn);
  const [errors, setErrors] = useState({ title: '', description: '' });

  // Populate form when editing existing task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setColumn(task.column);
    } else {
      setTitle('');
      setDescription('');
      setColumn(defaultColumn);
    }
    setErrors({ title: '', description: '' });
  }, [task, open, defaultColumn]);

  const validate = () => {
    const newErrors = { title: '', description: '' };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({ title: title.trim(), description: description.trim(), column });
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setColumn(defaultColumn);
    setErrors({ title: '', description: '' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {task ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            autoFocus
            placeholder="e.g., Design homepage"
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            multiline
            rows={4}
            placeholder="Provide details about this task..."
          />

          <TextField
            select
            label="Column"
            value={column}
            onChange={(e) => setColumn(e.target.value as TaskColumn)}
            fullWidth
          >
            {columns.map((col) => (
              <MenuItem key={col.id} value={col.id}>
                {col.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {task ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

