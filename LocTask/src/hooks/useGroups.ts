import { useCallback, useEffect, useState } from 'react';
import { deleteGroup, getGroups, saveGroup } from '../database/taskRepository';
import { ListGroup } from '../models';

export const useGroups = () => {
  const [groups, setGroups] = useState<ListGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addGroup = useCallback(
    async (group: ListGroup) => {
      const id = await saveGroup(group);
      await loadGroups();
      return id;
    },
    [loadGroups]
  );

  const removeGroup = useCallback(
    async (id: number) => {
      await deleteGroup(id);
      await loadGroups();
    },
    [loadGroups]
  );

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  return {
    groups,
    loading,
    error,
    addGroup,
    removeGroup,
    refresh: loadGroups,
  };
};
