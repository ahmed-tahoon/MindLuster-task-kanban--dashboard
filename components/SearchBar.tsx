'use client';

import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTaskStore } from '@/store/useTaskStore';
import { useState, useEffect } from 'react';

/**
 * Search bar component with debounced input
 * Updates global search state in Zustand store
 */
export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useTaskStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  return (
    <TextField
      placeholder="Search tasks by title or description..."
      value={localQuery}
      onChange={(e) => setLocalQuery(e.target.value)}
      size="small"
      sx={{
        minWidth: 300,
        backgroundColor: 'background.paper',
        borderRadius: 1,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
}

