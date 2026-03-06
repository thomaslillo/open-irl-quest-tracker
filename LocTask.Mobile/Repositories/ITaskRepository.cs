using LocTask.Mobile.Models;

namespace LocTask.Mobile.Repositories;

/// <summary>
/// Abstraction over the local SQLite data store.
/// All methods are asynchronous to support both direct SQLite access and future remote sources.
/// </summary>
public interface ITaskRepository
{
    // ── Groups ──────────────────────────────────────────────────────────────

    Task<List<ListGroup>> GetGroupsAsync();
    Task<ListGroup?> GetGroupAsync(int id);

    /// <returns>The <see cref="ListGroup.Id"/> of the saved record.</returns>
    Task<int> SaveGroupAsync(ListGroup group);

    /// <summary>
    /// Deletes the group identified by <paramref name="id"/> and cascades the
    /// deletion to all tasks that belong to it.
    /// </summary>
    Task DeleteGroupAsync(int id);

    // ── Tasks ────────────────────────────────────────────────────────────────

    Task<List<TaskItem>> GetTasksAsync(int? groupId = null, bool includeCompleted = false);
    Task<TaskItem?> GetTaskAsync(int id);

    /// <returns>The <see cref="TaskItem.Id"/> of the saved record.</returns>
    Task<int> SaveTaskAsync(TaskItem task);
    Task DeleteTaskAsync(int id);

    // ── Locations ────────────────────────────────────────────────────────────

    Task<List<Location>> GetLocationsAsync();
    Task<Location?> GetLocationAsync(int id);

    /// <returns>The <see cref="Location.Id"/> of the saved record.</returns>
    Task<int> SaveLocationAsync(Location location);
    Task DeleteLocationAsync(int id);
}
