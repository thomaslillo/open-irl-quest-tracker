using LocTask.Mobile.Models;
using SQLite;

namespace LocTask.Mobile.Repositories;

/// <summary>
/// SQLite-backed implementation of <see cref="ITaskRepository"/>.
/// Uses <see cref="SQLiteAsyncConnection"/> for all database operations.
/// </summary>
public class SqliteTaskRepository : ITaskRepository
{
    private readonly SQLiteAsyncConnection _database;

    /// <summary>
    /// Creates the repository and opens (or creates) the SQLite database at the
    /// given <paramref name="dbPath"/>.  Pass <c>":memory:"</c> for an in-memory
    /// database (useful for unit testing).
    /// </summary>
    public SqliteTaskRepository(string dbPath)
        : this(new SQLiteAsyncConnection(dbPath)) { }

    /// <summary>
    /// Creates the repository using an existing <see cref="SQLiteAsyncConnection"/>.
    /// Primarily used for unit testing.
    /// </summary>
    internal SqliteTaskRepository(SQLiteAsyncConnection database)
    {
        _database = database;
        InitializeAsync().GetAwaiter().GetResult();
    }

    private async Task InitializeAsync()
    {
        await _database.CreateTableAsync<ListGroup>();
        await _database.CreateTableAsync<Location>();
        await _database.CreateTableAsync<TaskItem>();
    }

    // ── Groups ──────────────────────────────────────────────────────────────

    public Task<List<ListGroup>> GetGroupsAsync() =>
        _database.Table<ListGroup>().ToListAsync();

    public Task<ListGroup?> GetGroupAsync(int id) =>
        _database.Table<ListGroup>()
                 .Where(g => g.Id == id)
                 .FirstOrDefaultAsync()!;

    public async Task<int> SaveGroupAsync(ListGroup group)
    {
        if (group.Id != 0)
            await _database.UpdateAsync(group);
        else
            await _database.InsertAsync(group);

        return group.Id;
    }

    /// <inheritdoc/>
    public async Task DeleteGroupAsync(int id)
    {
        // Cascade: delete tasks that belong to this group first.
        var tasks = await _database.Table<TaskItem>()
                                   .Where(t => t.GroupId == id)
                                   .ToListAsync();

        foreach (var task in tasks)
            await _database.DeleteAsync(task);

        await _database.DeleteAsync<ListGroup>(id);
    }

    // ── Tasks ────────────────────────────────────────────────────────────────

    public async Task<List<TaskItem>> GetTasksAsync(int? groupId = null, bool includeCompleted = false)
    {
        var query = _database.Table<TaskItem>();

        var results = await query.ToListAsync();

        if (groupId.HasValue)
            results = results.Where(t => t.GroupId == groupId.Value).ToList();

        if (!includeCompleted)
            results = results.Where(t => !t.IsCompleted).ToList();

        return results;
    }

    public Task<TaskItem?> GetTaskAsync(int id) =>
        _database.Table<TaskItem>()
                 .Where(t => t.Id == id)
                 .FirstOrDefaultAsync()!;

    public async Task<int> SaveTaskAsync(TaskItem task)
    {
        if (task.Id != 0)
            await _database.UpdateAsync(task);
        else
            await _database.InsertAsync(task);

        return task.Id;
    }

    public Task DeleteTaskAsync(int id) =>
        _database.DeleteAsync<TaskItem>(id);

    // ── Locations ────────────────────────────────────────────────────────────

    public Task<List<Location>> GetLocationsAsync() =>
        _database.Table<Location>().ToListAsync();

    public Task<Location?> GetLocationAsync(int id) =>
        _database.Table<Location>()
                 .Where(l => l.Id == id)
                 .FirstOrDefaultAsync()!;

    public async Task<int> SaveLocationAsync(Location location)
    {
        if (location.Id != 0)
            await _database.UpdateAsync(location);
        else
            await _database.InsertAsync(location);

        return location.Id;
    }

    public Task DeleteLocationAsync(int id) =>
        _database.DeleteAsync<Location>(id);
}
