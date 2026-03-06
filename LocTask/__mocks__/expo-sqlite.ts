type GroupRow = { id: number; name: string; color: string };
type LocationRow = {
  id: number;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radius: number;
  geofenceData: string | null;
  createdAt: number;
};
type TaskRow = {
  id: number;
  title: string;
  description: string | null;
  groupId: number | null;
  locationId: number | null;
  dueDate: number | null;
  isCompleted: number;
  createdAt: number;
  completedAt: number | null;
};

type InMemoryState = {
  groups: GroupRow[];
  locations: LocationRow[];
  tasks: TaskRow[];
  groupId: number;
  locationId: number;
  taskId: number;
};

const databases = new Map<string, InMemoryState>();

const getState = (name: string): InMemoryState => {
  const existing = databases.get(name);
  if (existing) {
    return existing;
  }

  const state: InMemoryState = {
    groups: [],
    locations: [],
    tasks: [],
    groupId: 1,
    locationId: 1,
    taskId: 1,
  };

  databases.set(name, state);
  return state;
};

const cloneTask = (task: TaskRow) => ({ ...task });
const cloneLocation = (location: LocationRow) => ({ ...location });
const cloneGroup = (group: GroupRow) => ({ ...group });

const normalizeSql = (sql: string) => sql.replace(/\s+/g, ' ').trim().toUpperCase();

export const openDatabaseAsync = async (name: string) => {
  const state = getState(name);

  return {
    execAsync: async (_sql: string) => {
      return;
    },
    closeAsync: async () => {
      return;
    },
    runAsync: async (sql: string, params: Array<unknown> = []) => {
      const normalized = normalizeSql(sql);

      if (normalized.startsWith('INSERT INTO LIST_GROUPS')) {
        const row: GroupRow = {
          id: state.groupId++,
          name: params[0] as string,
          color: params[1] as string,
        };
        state.groups.push(row);
        return { changes: 1, lastInsertRowId: row.id };
      }

      if (normalized.startsWith('UPDATE LIST_GROUPS')) {
        const id = params[2] as number;
        const target = state.groups.find((row) => row.id === id);
        if (target) {
          target.name = params[0] as string;
          target.color = params[1] as string;
          return { changes: 1, lastInsertRowId: id };
        }
        return { changes: 0, lastInsertRowId: 0 };
      }

      if (normalized.startsWith('DELETE FROM LIST_GROUPS')) {
        const id = params[0] as number;
        state.groups = state.groups.filter((row) => row.id !== id);
        state.tasks = state.tasks.map((task) =>
          task.groupId === id
            ? {
                ...task,
                groupId: null,
              }
            : task
        );
        return { changes: 1, lastInsertRowId: 0 };
      }

      if (normalized.startsWith('INSERT INTO LOCATIONS')) {
        const row: LocationRow = {
          id: state.locationId++,
          name: params[0] as string,
          address: (params[1] as string | null) ?? null,
          latitude: params[2] as number,
          longitude: params[3] as number,
          radius: params[4] as number,
          geofenceData: (params[5] as string | null) ?? null,
          createdAt: params[6] as number,
        };
        state.locations.push(row);
        return { changes: 1, lastInsertRowId: row.id };
      }

      if (normalized.startsWith('UPDATE LOCATIONS')) {
        const id = params[7] as number;
        const target = state.locations.find((row) => row.id === id);
        if (target) {
          target.name = params[0] as string;
          target.address = (params[1] as string | null) ?? null;
          target.latitude = params[2] as number;
          target.longitude = params[3] as number;
          target.radius = params[4] as number;
          target.geofenceData = (params[5] as string | null) ?? null;
          target.createdAt = params[6] as number;
          return { changes: 1, lastInsertRowId: id };
        }

        return { changes: 0, lastInsertRowId: 0 };
      }

      if (normalized.startsWith('DELETE FROM LOCATIONS')) {
        const id = params[0] as number;
        state.locations = state.locations.filter((row) => row.id !== id);
        state.tasks = state.tasks.map((task) =>
          task.locationId === id
            ? {
                ...task,
                locationId: null,
              }
            : task
        );
        return { changes: 1, lastInsertRowId: 0 };
      }

      if (normalized.startsWith('INSERT INTO TASKS')) {
        const row: TaskRow = {
          id: state.taskId++,
          title: params[0] as string,
          description: (params[1] as string | null) ?? null,
          groupId: (params[2] as number | null) ?? null,
          locationId: (params[3] as number | null) ?? null,
          dueDate: (params[4] as number | null) ?? null,
          isCompleted: params[5] as number,
          createdAt: params[6] as number,
          completedAt: (params[7] as number | null) ?? null,
        };
        state.tasks.push(row);
        return { changes: 1, lastInsertRowId: row.id };
      }

      if (normalized.startsWith('UPDATE TASKS SET ISCOMPLETED = 1')) {
        const completedAt = params[0] as number;
        const id = params[1] as number;
        const target = state.tasks.find((row) => row.id === id);
        if (target) {
          target.isCompleted = 1;
          target.completedAt = completedAt;
          return { changes: 1, lastInsertRowId: id };
        }

        return { changes: 0, lastInsertRowId: 0 };
      }

      if (normalized.startsWith('UPDATE TASKS')) {
        const id = params[8] as number;
        const target = state.tasks.find((row) => row.id === id);
        if (target) {
          target.title = params[0] as string;
          target.description = (params[1] as string | null) ?? null;
          target.groupId = (params[2] as number | null) ?? null;
          target.locationId = (params[3] as number | null) ?? null;
          target.dueDate = (params[4] as number | null) ?? null;
          target.isCompleted = params[5] as number;
          target.createdAt = params[6] as number;
          target.completedAt = (params[7] as number | null) ?? null;
          return { changes: 1, lastInsertRowId: id };
        }

        return { changes: 0, lastInsertRowId: 0 };
      }

      if (normalized.startsWith('DELETE FROM TASKS')) {
        const id = params[0] as number;
        state.tasks = state.tasks.filter((row) => row.id !== id);
        return { changes: 1, lastInsertRowId: 0 };
      }

      throw new Error(`Unsupported runAsync SQL in mock: ${sql}`);
    },
    getAllAsync: async (sql: string, params: Array<unknown> = []) => {
      const normalized = normalizeSql(sql);

      if (normalized.includes('FROM LIST_GROUPS')) {
        return [...state.groups]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((row) => cloneGroup(row));
      }

      if (normalized.includes('FROM LOCATIONS')) {
        return [...state.locations]
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((row) => cloneLocation(row));
      }

      if (normalized.includes('FROM TASKS')) {
        let rows = [...state.tasks];

        if (normalized.includes('GROUPID = ?')) {
          rows = rows.filter((row) => row.groupId === (params[0] as number));
        }

        if (normalized.includes('ISCOMPLETED = 0')) {
          rows = rows.filter((row) => row.isCompleted === 0);
        }

        return rows.sort((a, b) => b.createdAt - a.createdAt).map((row) => cloneTask(row));
      }

      throw new Error(`Unsupported getAllAsync SQL in mock: ${sql}`);
    },
    getFirstAsync: async (sql: string, params: Array<unknown> = []) => {
      const normalized = normalizeSql(sql);

      if (normalized.includes('FROM LOCATIONS WHERE ID = ?')) {
        const id = params[0] as number;
        const row = state.locations.find((location) => location.id === id);
        return row ? cloneLocation(row) : null;
      }

      if (normalized.includes('FROM TASKS WHERE ID = ?')) {
        const id = params[0] as number;
        const row = state.tasks.find((task) => task.id === id);
        return row ? cloneTask(row) : null;
      }

      return null;
    },
  };
};

export const __resetMockDatabases = () => {
  databases.clear();
};
