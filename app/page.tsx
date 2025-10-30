'use client';

import { Box, Container, Typography, Button, AppBar, Toolbar, Chip, Alert, IconButton } from '@mui/material';
import { Add as AddIcon, ViewKanban as KanbanIcon, Close as CloseIcon } from '@mui/icons-material';
import { useState } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import TaskModal from '@/components/TaskModal';
import SearchBar from '@/components/SearchBar';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { isFallbackApiBase } from '@/services/api';
import { Task } from '@/types/task';
import Link from 'next/link';
import AddColumnDialog from '@/components/AddColumnDialog';

/**
 * Main dashboard page
 * Features Kanban board with create/edit functionality
 */
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const isFallbackApi = isFallbackApiBase;
  const [showFallbackNote, setShowFallbackNote] = useState(true);

  const handleCreateTask = (data: { title: string; description: string; column: any }) => {
    createTask.mutate(data);
    setIsModalOpen(false);
  };

  const handleUpdateTask = (data: { title: string; description: string; column: any }) => {
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data });
      setEditingTask(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          backgroundColor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'saturate(180%) blur(12px)',
          WebkitBackdropFilter: 'saturate(180%) blur(12px)',
          color: 'text.primary',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
        <Toolbar sx={{ py: 1.5, px: { xs: 2, sm: 3 } }}>
          <KanbanIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component="h1"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: 0.2,
              background: 'linear-gradient(90deg, #111827, #2563EB 40%, #7C3AED)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Kanban Dashboard
          </Typography>

          <Box display="flex" gap={2} alignItems="center">
            <Link href="/bonus" passHref>
              <Chip label="jQuery Bonus" color="secondary" clickable />
            </Link>
            <SearchBar />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
              sx={{ ml: 2, boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}
            >
              New Task
            </Button>
            <Button
              variant="outlined"
              onClick={() => setAddColumnOpen(true)}
            >
              Add Column
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {isFallbackApi && showFallbackNote && (
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
          <Container maxWidth="lg" sx={{ px: 0 }}>
            <Alert
              severity="info"
              variant="filled"
              sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', pr: 6, py: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setShowFallbackNote(false)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
                Using Next.js fallback API
              </Typography>
              <Typography variant="body2">
                No external server detected. Data is stored in-memory and may reset after redeploys or cold starts.
              </Typography>
            </Alert>
          </Container>
        </Box>
      )}

      {/* Main Content */}
      <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
        <Box mb={8}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
            Project Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Drag and drop tasks between columns to update their status
          </Typography>
        </Box>

        <KanbanBoard onEditTask={handleEditTask} />
      </Container>

      {/* Task Creation/Edit Modal */}
      <TaskModal
        open={isModalOpen || !!editingTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />

      <AddColumnDialog open={addColumnOpen} onClose={() => setAddColumnOpen(false)} />
    </>
  );
}

