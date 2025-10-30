import axios from 'axios';
import { Task, TaskFormData } from '@/types/task';

// Prefer external API if provided; otherwise, use Next.js route handlers
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const isFallbackApiBase = API_BASE_URL.startsWith('/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Task API service layer
 * Handles all HTTP requests to the json-server backend
 */
export const taskApi = {
  /**
   * Fetch all tasks with optional search and pagination
   */
  getTasks: async (params?: { 
    q?: string; 
    _page?: number; 
    _limit?: number;
    column?: string;
  }): Promise<{ data: Task[]; total: number }> => {
    const response = await apiClient.get<Task[]>('/tasks', { params });
    const total = parseInt(response.headers['x-total-count'] || '0', 10);
    return { data: response.data, total };
  },

  /**
   * Fetch a single task by ID
   */
  getTask: async (id: string): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Create a new task
   */
  createTask: async (task: TaskFormData): Promise<Task> => {
    const newTask = {
      ...task,
      id: Date.now().toString(), // Generate temporary ID
    };
    const response = await apiClient.post<Task>('/tasks', newTask);
    return response.data;
  },

  /**
   * Update an existing task
   */
  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

