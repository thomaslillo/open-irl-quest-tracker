import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const schema = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS list_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius REAL NOT NULL,
    geofenceData TEXT,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    groupId INTEGER,
    locationId INTEGER,
    dueDate INTEGER,
    isCompleted INTEGER DEFAULT 0,
    createdAt INTEGER NOT NULL,
    completedAt INTEGER,
    FOREIGN KEY (groupId) REFERENCES list_groups (id) ON DELETE SET NULL,
    FOREIGN KEY (locationId) REFERENCES locations (id) ON DELETE SET NULL
  );
`;

export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('loctask.db');
      await db.execAsync(schema);
      return db;
    })();
  }

  return dbPromise;
};

export const resetDatabaseForTests = async (): Promise<void> => {
  if (dbPromise) {
    const db = await dbPromise;
    await db.closeAsync();
  }

  dbPromise = null;
};
