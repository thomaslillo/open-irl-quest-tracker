import { useCallback, useEffect, useState } from 'react';
import {
  deleteTask,
  getTasks,
  markTaskCompleted,
  saveTask,
} from '../database/taskRepository';
import { TaskItem } from '../models';

type UseTasksFilters = {
  groupId?: number;
  includeCompleted?: boolean;
};

export const useTasks = (filters?: UseTasksFilters) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTasks(filters);
      setTasks(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const addTask = useCallback(
    async (task: TaskItem) => {
      const id = await saveTask(task);
      await loadTasks();
      return id;
    },
    [loadTasks]
  );

  const completeTask = useCallback(
    async (id: number, completedAt?: number) => {
      await markTaskCompleted(id, completedAt);
      await loadTasks();
    },
    [loadTasks]
  );

  const removeTask = useCallback(
    async (id: number) => {
      await deleteTask(id);
      await loadTasks();
    },
    [loadTasks]
  );

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    completeTask,
    removeTask,
    refresh: loadTasks,
  };
};
