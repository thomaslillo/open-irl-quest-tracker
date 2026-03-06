import { useCallback, useEffect, useState } from 'react';
import { deleteLocation, getLocations, saveLocation } from '../database/taskRepository';
import { Location } from '../models';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLocation = useCallback(
    async (location: Location) => {
      const id = await saveLocation(location);
      await loadLocations();
      return id;
    },
    [loadLocations]
  );

  const removeLocation = useCallback(
    async (id: number) => {
      await deleteLocation(id);
      await loadLocations();
    },
    [loadLocations]
  );

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  return {
    locations,
    loading,
    error,
    addLocation,
    removeLocation,
    refresh: loadLocations,
  };
};
