import * as SQLite from 'expo-sqlite';
import {
  deleteGroup,
  deleteLocation,
  getGroups,
  getLocationById,
  getTaskById,
  getTasks,
  markTaskCompleted,
  saveGroup,
  saveLocation,
  saveTask,
} from '../../src/database/taskRepository';
import { resetDatabaseForTests } from '../../src/database/database';

jest.mock('expo-sqlite');

describe('taskRepository', () => {
  beforeEach(async () => {
    (SQLite as unknown as { __resetMockDatabases: () => void }).__resetMockDatabases();
    await resetDatabaseForTests();
  });

  it('handles group insert, retrieve, update, and delete', async () => {
    const groupId = await saveGroup({ name: 'Errands', color: '#f97316' });

    let groups = await getGroups();
    expect(groups).toHaveLength(1);
    expect(groups[0]).toEqual({ id: groupId, name: 'Errands', color: '#f97316' });

    await saveGroup({ id: groupId, name: 'Home', color: '#22c55e' });
    groups = await getGroups();
    expect(groups[0].name).toBe('Home');

    await deleteGroup(groupId);
    groups = await getGroups();
    expect(groups).toHaveLength(0);
  });

  it('handles location insert, retrieve by id, and delete', async () => {
    const createdAt = Date.now();
    const locationId = await saveLocation({
      name: 'Office',
      address: '123 Main St',
      latitude: 40.7128,
      longitude: -74.006,
      radius: 100,
      geofenceData: '{"type":"circle"}',
      createdAt,
    });

    const location = await getLocationById(locationId);
    expect(location).toMatchObject({
      id: locationId,
      name: 'Office',
      address: '123 Main St',
      latitude: 40.7128,
      longitude: -74.006,
      radius: 100,
      createdAt,
    });

    await deleteLocation(locationId);
    const deleted = await getLocationById(locationId);
    expect(deleted).toBeNull();
  });

  it('handles task insert, filtering by group, and mark complete', async () => {
    const groupA = await saveGroup({ name: 'Work', color: '#0ea5e9' });
    const groupB = await saveGroup({ name: 'Personal', color: '#a855f7' });
    const locationId = await saveLocation({
      name: 'Gym',
      latitude: 34.0522,
      longitude: -118.2437,
      radius: 75,
      createdAt: Date.now(),
    });

    const taskAId = await saveTask({
      title: 'Pick up package',
      groupId: groupA,
      locationId,
      isCompleted: false,
      createdAt: Date.now(),
    });

    await saveTask({
      title: 'Buy groceries',
      groupId: groupB,
      isCompleted: false,
      createdAt: Date.now() + 10,
    });

    const groupATasks = await getTasks({ groupId: groupA });
    expect(groupATasks).toHaveLength(1);
    expect(groupATasks[0].id).toBe(taskAId);

    const completedAt = Date.now();
    await markTaskCompleted(taskAId, completedAt);

    const updated = await getTaskById(taskAId);
    expect(updated?.isCompleted).toBe(true);
    expect(updated?.completedAt).toBe(completedAt);
  });

  it('sets task groupId to null when a group is deleted', async () => {
    const groupId = await saveGroup({ name: 'Temp Group', color: '#111111' });
    const taskId = await saveTask({
      title: 'Task linked to group',
      groupId,
      isCompleted: false,
      createdAt: Date.now(),
    });

    await deleteGroup(groupId);

    const task = await getTaskById(taskId);
    expect(task?.groupId).toBeNull();
  });
});
