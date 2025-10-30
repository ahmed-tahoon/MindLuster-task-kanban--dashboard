import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { taskApi } from '@/services/api';
import { Task, TaskFormData, TaskColumn } from '@/types/task';

const TASKS_PER_PAGE = 5;

/**
 * React Query hook for fetching all tasks
 * Implements automatic refetching and caching
 */
export const useTasks = (searchQuery?: string) => {
  return useQuery({
    queryKey: ['tasks', searchQuery],
    queryFn: () => taskApi.getTasks({ q: searchQuery }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Infinite scroll hook for paginated task loading per column
 */
export const useInfiniteTasks = (column: TaskColumn, searchQuery?: string) => {
  return useInfiniteQuery({
    queryKey: ['tasks', 'infinite', column, searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      taskApi.getTasks({
        column,
        q: searchQuery,
        _page: pageParam,
        _limit: TASKS_PER_PAGE,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, page) => sum + page.data.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for creating a new task
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: TaskFormData) => {
      // derive next position within the selected column from cache if possible
      const cached = queryClient.getQueryData<any>(['tasks']);
      let position = Date.now();
      if (cached?.data) {
        const inColumn = (cached.data as Task[]).filter((t) => t.column === task.column);
        const maxPos = inColumn.reduce((max, t) => (t.position ?? 0) > max ? (t.position ?? 0) : max, 0);
        position = (maxPos || 0) + 1;
      }
      return taskApi.createTask({ ...task, position });
    },
    onSuccess: () => {
      // Invalidate all task queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

/**
 * Hook for updating an existing task
 * Includes optimistic updates for better UX
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      taskApi.updateTask(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous value for rollback
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Optimistically update cache
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((task: Task) =>
            task.id === id ? { ...task, ...data } : task
          ),
        };
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

/**
 * Hook for deleting a task
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

