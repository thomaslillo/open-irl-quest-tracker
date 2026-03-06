using LocTask.Mobile.Models;
using LocTask.Mobile.Repositories;
using SQLite;
using Xunit;

namespace LocTask.Tests;

/// <summary>
/// Integration-style tests for <see cref="SqliteTaskRepository"/> using a
/// temporary on-disk SQLite database.  Each test gets a fresh database through
/// xUnit's per-test class construction and the <see cref="IDisposable"/> cleanup.
/// </summary>
public sealed class SqliteTaskRepositoryTests : IDisposable
{
    private readonly string _dbPath =
        Path.Combine(Path.GetTempPath(), $"loctask_test_{Guid.NewGuid():N}.db3");

    private readonly SqliteTaskRepository _repo;

    public SqliteTaskRepositoryTests()
    {
        SQLitePCL.Batteries_V2.Init();
        _repo = new SqliteTaskRepository(_dbPath);
    }

    public void Dispose()
    {
        if (File.Exists(_dbPath))
            File.Delete(_dbPath);
    }

    // ── Group tests ──────────────────────────────────────────────────────────

    [Fact]
    public async Task SaveGroup_AndRetrieveById_ReturnsCorrectGroup()
    {
        var group = new ListGroup { Name = "Errands", Color = "#FF5733" };

        int id = await _repo.SaveGroupAsync(group);

        Assert.True(id > 0);

        var retrieved = await _repo.GetGroupAsync(id);

        Assert.NotNull(retrieved);
        Assert.Equal("Errands", retrieved.Name);
        Assert.Equal("#FF5733", retrieved.Color);
    }

    [Fact]
    public async Task SaveGroup_AutoIncrementsId()
    {
        var g1 = new ListGroup { Name = "A", Color = "#000000" };
        var g2 = new ListGroup { Name = "B", Color = "#FFFFFF" };

        int id1 = await _repo.SaveGroupAsync(g1);
        int id2 = await _repo.SaveGroupAsync(g2);

        Assert.NotEqual(id1, id2);
    }

    // ── Location tests ───────────────────────────────────────────────────────

    [Fact]
    public async Task SaveLocation_AndRetrieve_PreservesCoordinates()
    {
        var location = new Location
        {
            Name = "Home",
            Address = "123 Main St",
            Latitude = 43.6532,
            Longitude = -79.3832,
            Radius = 150.0,
            CreatedAt = DateTime.UtcNow
        };

        int id = await _repo.SaveLocationAsync(location);

        Assert.True(id > 0);

        var retrieved = await _repo.GetLocationAsync(id);

        Assert.NotNull(retrieved);
        Assert.Equal("Home", retrieved.Name);
        Assert.Equal(43.6532, retrieved.Latitude);
        Assert.Equal(-79.3832, retrieved.Longitude);
        Assert.Equal(150.0, retrieved.Radius);
    }

    // ── TaskItem tests ───────────────────────────────────────────────────────

    [Fact]
    public async Task SaveTask_WithGroupAndLocation_StoresForeignKeys()
    {
        var group = new ListGroup { Name = "Work", Color = "#0000FF" };
        await _repo.SaveGroupAsync(group);

        var location = new Location
        {
            Name = "Office",
            Latitude = 51.5074,
            Longitude = -0.1278,
            Radius = 100.0,
            CreatedAt = DateTime.UtcNow
        };
        await _repo.SaveLocationAsync(location);

        var task = new TaskItem
        {
            Title = "Submit report",
            GroupId = group.Id,
            LocationId = location.Id,
            CreatedAt = DateTime.UtcNow
        };

        int taskId = await _repo.SaveTaskAsync(task);

        Assert.True(taskId > 0);

        var retrieved = await _repo.GetTaskAsync(taskId);

        Assert.NotNull(retrieved);
        Assert.Equal(group.Id, retrieved.GroupId);
        Assert.Equal(location.Id, retrieved.LocationId);
    }

    [Fact]
    public async Task GetTasks_FiltersByGroupId()
    {
        var groupA = new ListGroup { Name = "Home", Color = "#FF0000" };
        var groupB = new ListGroup { Name = "Work", Color = "#00FF00" };
        await _repo.SaveGroupAsync(groupA);
        await _repo.SaveGroupAsync(groupB);

        await _repo.SaveTaskAsync(new TaskItem { Title = "Home task", GroupId = groupA.Id, CreatedAt = DateTime.UtcNow });
        await _repo.SaveTaskAsync(new TaskItem { Title = "Work task", GroupId = groupB.Id, CreatedAt = DateTime.UtcNow });

        var homeTasks = await _repo.GetTasksAsync(groupId: groupA.Id);
        var workTasks = await _repo.GetTasksAsync(groupId: groupB.Id);

        Assert.Single(homeTasks);
        Assert.Equal("Home task", homeTasks[0].Title);

        Assert.Single(workTasks);
        Assert.Equal("Work task", workTasks[0].Title);
    }

    [Fact]
    public async Task DeleteGroup_CascadesDeleteToTasks()
    {
        var group = new ListGroup { Name = "Temp Group", Color = "#AABBCC" };
        int groupId = await _repo.SaveGroupAsync(group);

        await _repo.SaveTaskAsync(new TaskItem { Title = "Task in group", GroupId = groupId, CreatedAt = DateTime.UtcNow });
        await _repo.SaveTaskAsync(new TaskItem { Title = "Another task", GroupId = groupId, CreatedAt = DateTime.UtcNow });

        // Confirm tasks exist before deletion.
        var before = await _repo.GetTasksAsync(groupId: groupId);
        Assert.Equal(2, before.Count);

        await _repo.DeleteGroupAsync(groupId);

        var afterGroups = await _repo.GetGroupsAsync();
        Assert.Empty(afterGroups);

        var afterTasks = await _repo.GetTasksAsync(groupId: groupId);
        Assert.Empty(afterTasks);
    }

    [Fact]
    public async Task UpdateTask_PersistsChanges()
    {
        var task = new TaskItem { Title = "Original Title", CreatedAt = DateTime.UtcNow };
        int id = await _repo.SaveTaskAsync(task);

        task.Title = "Updated Title";
        task.IsCompleted = true;
        task.CompletedAt = DateTime.UtcNow;

        await _repo.SaveTaskAsync(task);

        var updated = await _repo.GetTaskAsync(id);

        Assert.NotNull(updated);
        Assert.Equal("Updated Title", updated.Title);
        Assert.True(updated.IsCompleted);
        Assert.NotNull(updated.CompletedAt);
    }

    [Fact]
    public async Task GetTasks_ExcludesCompletedByDefault()
    {
        await _repo.SaveTaskAsync(new TaskItem { Title = "Incomplete", IsCompleted = false, CreatedAt = DateTime.UtcNow });
        await _repo.SaveTaskAsync(new TaskItem { Title = "Done", IsCompleted = true, CreatedAt = DateTime.UtcNow });

        var incomplete = await _repo.GetTasksAsync();

        Assert.Single(incomplete);
        Assert.Equal("Incomplete", incomplete[0].Title);
    }

    [Fact]
    public async Task GetTasks_IncludesCompletedWhenRequested()
    {
        await _repo.SaveTaskAsync(new TaskItem { Title = "Incomplete", IsCompleted = false, CreatedAt = DateTime.UtcNow });
        await _repo.SaveTaskAsync(new TaskItem { Title = "Done", IsCompleted = true, CreatedAt = DateTime.UtcNow });

        var all = await _repo.GetTasksAsync(includeCompleted: true);

        Assert.Equal(2, all.Count);
    }
}
