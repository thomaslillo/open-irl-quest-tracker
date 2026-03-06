import { openDatabase } from './database';
import { ListGroup, Location, TaskItem } from '../models';

type TaskFilters = {
  groupId?: number;
  includeCompleted?: boolean;
};

const toTaskModel = (row: Record<string, unknown>): TaskItem => ({
  id: row.id as number,
  title: row.title as string,
  description: (row.description as string | null) ?? undefined,
  groupId: (row.groupId as number | null) ?? null,
  locationId: (row.locationId as number | null) ?? null,
  dueDate: (row.dueDate as number | null) ?? null,
  isCompleted: Number(row.isCompleted) === 1,
  createdAt: row.createdAt as number,
  completedAt: (row.completedAt as number | null) ?? null,
});

export const getGroups = async (): Promise<ListGroup[]> => {
  const db = await openDatabase();
  const rows = (await db.getAllAsync(
    'SELECT id, name, color FROM list_groups ORDER BY name ASC'
  )) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    color: row.color as string,
  }));
};

export const saveGroup = async (group: ListGroup): Promise<number> => {
  const db = await openDatabase();

  if (group.id) {
    await db.runAsync('UPDATE list_groups SET name = ?, color = ? WHERE id = ?', [group.name, group.color, group.id]);
    return group.id;
  }

  const result = await db.runAsync('INSERT INTO list_groups (name, color) VALUES (?, ?)', [group.name, group.color]);
  return result.lastInsertRowId;
};

export const deleteGroup = async (id: number): Promise<void> => {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM list_groups WHERE id = ?', [id]);
};

export const getLocations = async (): Promise<Location[]> => {
  const db = await openDatabase();
  const rows = (await db.getAllAsync(
    'SELECT id, name, address, latitude, longitude, radius, geofenceData, createdAt FROM locations ORDER BY createdAt DESC'
  )) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    address: (row.address as string | null) ?? undefined,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    radius: row.radius as number,
    geofenceData: (row.geofenceData as string | null) ?? undefined,
    createdAt: row.createdAt as number,
  }));
};

export const getLocationById = async (id: number): Promise<Location | null> => {
  const db = await openDatabase();
  const row = (await db.getFirstAsync(
    'SELECT id, name, address, latitude, longitude, radius, geofenceData, createdAt FROM locations WHERE id = ?',
    [id]
  )) as Record<string, unknown> | null;

  if (!row) {
    return null;
  }

  return {
    id: row.id as number,
    name: row.name as string,
    address: (row.address as string | null) ?? undefined,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    radius: row.radius as number,
    geofenceData: (row.geofenceData as string | null) ?? undefined,
    createdAt: row.createdAt as number,
  };
};

export const saveLocation = async (location: Location): Promise<number> => {
  const db = await openDatabase();

  if (location.id) {
    await db.runAsync(
      `UPDATE locations
       SET name = ?, address = ?, latitude = ?, longitude = ?, radius = ?, geofenceData = ?, createdAt = ?
       WHERE id = ?`,
      [
        location.name,
        location.address ?? null,
        location.latitude,
        location.longitude,
        location.radius,
        location.geofenceData ?? null,
        location.createdAt,
        location.id,
      ]
    );

    return location.id;
  }

  const result = await db.runAsync(
    `INSERT INTO locations (name, address, latitude, longitude, radius, geofenceData, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      location.name,
      location.address ?? null,
      location.latitude,
      location.longitude,
      location.radius,
      location.geofenceData ?? null,
      location.createdAt,
    ]
  );

  return result.lastInsertRowId;
};

export const deleteLocation = async (id: number): Promise<void> => {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM locations WHERE id = ?', [id]);
};

export const getTasks = async (filters?: TaskFilters): Promise<TaskItem[]> => {
  const db = await openDatabase();
  const clauses: string[] = [];
  const params: Array<number> = [];

  if (filters?.groupId !== undefined) {
    clauses.push('groupId = ?');
    params.push(filters.groupId);
  }

  if (!filters?.includeCompleted) {
    clauses.push('isCompleted = 0');
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = (await db.getAllAsync(
    `SELECT id, title, description, groupId, locationId, dueDate, isCompleted, createdAt, completedAt
     FROM tasks ${where} ORDER BY createdAt DESC`,
    params
  )) as Array<Record<string, unknown>>;

  return rows.map((row) => toTaskModel(row));
};

export const getTaskById = async (id: number): Promise<TaskItem | null> => {
  const db = await openDatabase();
  const row = (await db.getFirstAsync(
    `SELECT id, title, description, groupId, locationId, dueDate, isCompleted, createdAt, completedAt
     FROM tasks WHERE id = ?`,
    [id]
  )) as Record<string, unknown> | null;

  if (!row) {
    return null;
  }

  return toTaskModel(row);
};

export const saveTask = async (task: TaskItem): Promise<number> => {
  const db = await openDatabase();

  if (task.id) {
    await db.runAsync(
      `UPDATE tasks
       SET title = ?, description = ?, groupId = ?, locationId = ?, dueDate = ?, isCompleted = ?, createdAt = ?, completedAt = ?
       WHERE id = ?`,
      [
        task.title,
        task.description ?? null,
        task.groupId ?? null,
        task.locationId ?? null,
        task.dueDate ?? null,
        task.isCompleted ? 1 : 0,
        task.createdAt,
        task.completedAt ?? null,
        task.id,
      ]
    );

    return task.id;
  }

  const result = await db.runAsync(
    `INSERT INTO tasks (title, description, groupId, locationId, dueDate, isCompleted, createdAt, completedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.title,
      task.description ?? null,
      task.groupId ?? null,
      task.locationId ?? null,
      task.dueDate ?? null,
      task.isCompleted ? 1 : 0,
      task.createdAt,
      task.completedAt ?? null,
    ]
  );

  return result.lastInsertRowId;
};

export const markTaskCompleted = async (id: number, completedAt: number = Date.now()): Promise<void> => {
  const db = await openDatabase();
  await db.runAsync('UPDATE tasks SET isCompleted = 1, completedAt = ? WHERE id = ?', [completedAt, id]);
};

export const deleteTask = async (id: number): Promise<void> => {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
};
