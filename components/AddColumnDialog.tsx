'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { useColumnStore } from '@/store/useColumnStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddColumnDialog({ open, onClose }: Props) {
  const addColumn = useColumnStore((s) => s.addColumn);
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setLabel('');
      setError('');
    }
  }, [open]);

  const onSubmit = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      setError('Column name is required');
      return;
    }
    addColumn(trimmed);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add New Column</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Column name"
          fullWidth
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}


