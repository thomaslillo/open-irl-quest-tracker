# LocTask

LocTask is an offline-first React Native app (Expo + TypeScript) for managing tasks tied to locations and time.

## App Design

The app is designed around two core workflows:

- `Map` view: manage location-linked tasks and geofence-related context.
- `List` view: manage and review task items in a traditional list workflow.

Current UI is intentionally minimal, with placeholder screens, to establish architecture and behavior before building full visuals.

## How the App Works

At a high level:

1. The app starts and initializes a local SQLite database (`loctask.db`).
2. Database tables are created if they do not exist:
- `list_groups`
- `locations`
- `tasks`
3. Screens and data hooks use a repository layer to read and write local data.
4. All data stays on-device. No backend calls are required.

Key implementation concepts:

- Offline-first storage via `expo-sqlite`.
- Repository abstraction in `src/database/taskRepository.ts`.
- Hook-based data access (`useGroups`, `useLocations`, `useTasks`) with loading and error state.
- Bottom-tab navigation via React Navigation (`Map`, `List`).
- Optional Redux store scaffolded for future app-state scaling.

## High-Level Project Structure

```txt
LocTask/
  App.tsx
  src/
    models/
      ListGroup.ts
      Location.ts
      TaskItem.ts
    database/
      database.ts
      taskRepository.ts
    hooks/
      useGroups.ts
      useLocations.ts
      useTasks.ts
    navigation/
      AppNavigator.tsx
    screens/
      MapScreen.tsx
      ListScreen.tsx
    store/
      index.ts
    utils/
  __tests__/
    database/
      taskRepository.test.ts
    hooks/
      useGroups.test.tsx
    screens/
      MapScreen.test.tsx
  __mocks__/
    expo-sqlite.ts
```

## Running the App

From the `LocTask` directory:

```bash
npm install --legacy-peer-deps
npm run start
```

Then choose one target:

- `a` for Android emulator/device
- `i` for iOS simulator (macOS only)
- `w` for web

You can also run directly:

```bash
npm run android
npm run ios
npm run web
```

## Running Tests

```bash
npm test -- --runInBand
```

`--runInBand` is useful for deterministic local runs and CI-like consistency.

## How Tests Were Created

Tests were written as behavior specifications for core features, then implemented to satisfy those behaviors:

- Repository tests define expected CRUD and relationship behavior.
- Hook tests define expected data-loading and refresh behavior.
- Screen tests define minimal render expectations.

The repository tests use a mocked `expo-sqlite` implementation (`__mocks__/expo-sqlite.ts`) so tests are fast, deterministic, and independent of device SQLite runtime.

## Testing Strategy

The strategy focuses on validating core logic boundaries first:

1. Data layer correctness
- Verify inserts, reads, updates, deletes for groups, locations, tasks.
- Verify filtering and completion behavior for tasks.
- Verify referential behavior such as `ON DELETE SET NULL` semantics.

2. Hook behavior correctness
- Verify initial load behavior.
- Verify action methods (`addGroup`, `removeGroup`) call repositories and refresh state.
- Verify loading flow in async scenarios.

3. UI sanity checks
- Verify placeholder screens render expected text.

Why this strategy:

- Most app risk is in data integrity and state transitions, not placeholder UI.
- Repository and hooks are the core contract used by future screen components.
- Mocked persistence keeps unit tests isolated and stable while still testing realistic data flows.

## Notes

- `react-native-maps` is installed for future map integration, but map interaction UI is intentionally deferred.
- Redux store is scaffolded and ready for incremental slice adoption as the app grows.
