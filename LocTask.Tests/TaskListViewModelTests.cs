using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.Input;
using LocTask.Mobile.Models;
using LocTask.Mobile.Repositories;
using LocTask.Mobile.ViewModels;
using Moq;
using Xunit;

namespace LocTask.Tests;

/// <summary>
/// Unit tests for <see cref="TaskListViewModel"/> using a mocked
/// <see cref="ITaskRepository"/>.
/// </summary>
public sealed class TaskListViewModelTests
{
    private static Mock<ITaskRepository> CreateRepositoryMock(
        List<TaskItem>? tasks = null)
    {
        var mock = new Mock<ITaskRepository>();

        mock.Setup(r => r.GetTasksAsync(
                It.IsAny<int?>(),
                It.IsAny<bool>()))
            .ReturnsAsync(tasks ?? []);

        mock.Setup(r => r.SaveTaskAsync(It.IsAny<TaskItem>()))
            .ReturnsAsync(1);

        return mock;
    }

    // ── LoadTasksCommand ─────────────────────────────────────────────────────

    [Fact]
    public async Task LoadTasksCommand_PopulatesObservableCollection()
    {
        var expectedTasks = new List<TaskItem>
        {
            new() { Id = 1, Title = "Buy milk", CreatedAt = DateTime.UtcNow },
            new() { Id = 2, Title = "Call dentist", CreatedAt = DateTime.UtcNow }
        };

        var mock = CreateRepositoryMock(expectedTasks);
        var vm = new TaskListViewModel(mock.Object);

        await vm.LoadTasksCommand.ExecuteAsync(null);

        Assert.Equal(2, vm.Tasks.Count);
        Assert.Contains(vm.Tasks, t => t.Title == "Buy milk");
        Assert.Contains(vm.Tasks, t => t.Title == "Call dentist");
    }

    [Fact]
    public async Task LoadTasksCommand_ReplacesExistingTasks()
    {
        var firstBatch = new List<TaskItem>
        {
            new() { Id = 1, Title = "Old task", CreatedAt = DateTime.UtcNow }
        };

        var mock = new Mock<ITaskRepository>();
        mock.SetupSequence(r => r.GetTasksAsync(
                It.IsAny<int?>(),
                It.IsAny<bool>()))
            .ReturnsAsync(firstBatch)
            .ReturnsAsync([new TaskItem { Id = 2, Title = "New task", CreatedAt = DateTime.UtcNow }]);

        mock.Setup(r => r.SaveTaskAsync(It.IsAny<TaskItem>())).ReturnsAsync(1);

        var vm = new TaskListViewModel(mock.Object);

        await vm.LoadTasksCommand.ExecuteAsync(null);
        Assert.Single(vm.Tasks);
        Assert.Equal("Old task", vm.Tasks[0].Title);

        await vm.LoadTasksCommand.ExecuteAsync(null);
        Assert.Single(vm.Tasks);
        Assert.Equal("New task", vm.Tasks[0].Title);
    }

    // ── AddTaskCommand ───────────────────────────────────────────────────────

    [Fact]
    public async Task AddTaskCommand_CallsSaveTaskAsync()
    {
        var mock = CreateRepositoryMock();
        var vm = new TaskListViewModel(mock.Object);

        await vm.AddTaskCommand.ExecuteAsync(null);

        mock.Verify(
            r => r.SaveTaskAsync(It.IsAny<TaskItem>()),
            Times.Once,
            "SaveTaskAsync should be called exactly once when adding a task.");
    }

    [Fact]
    public async Task AddTaskCommand_ThenReloadsTaskList()
    {
        var savedTask = new TaskItem { Id = 1, Title = "New Task", CreatedAt = DateTime.UtcNow };

        var mock = new Mock<ITaskRepository>();

        // First call (during AddTask's internal LoadTasks) returns the newly saved task.
        mock.Setup(r => r.GetTasksAsync(It.IsAny<int?>(), It.IsAny<bool>()))
            .ReturnsAsync([savedTask]);

        mock.Setup(r => r.SaveTaskAsync(It.IsAny<TaskItem>()))
            .ReturnsAsync(1);

        var vm = new TaskListViewModel(mock.Object);

        await vm.AddTaskCommand.ExecuteAsync(null);

        // After AddTask, the list should have been refreshed.
        Assert.Single(vm.Tasks);
    }

    // ── ToggleCompleteCommand ────────────────────────────────────────────────

    [Fact]
    public async Task ToggleCompleteCommand_TogglesIsCompletedToTrue()
    {
        var task = new TaskItem { Id = 1, Title = "Water plants", IsCompleted = false, CreatedAt = DateTime.UtcNow };
        var mock = CreateRepositoryMock();
        var vm = new TaskListViewModel(mock.Object);

        await vm.ToggleCompleteCommand.ExecuteAsync(task);

        Assert.True(task.IsCompleted);
        Assert.NotNull(task.CompletedAt);
    }

    [Fact]
    public async Task ToggleCompleteCommand_TogglesIsCompletedToFalse()
    {
        var task = new TaskItem
        {
            Id = 1,
            Title = "Water plants",
            IsCompleted = true,
            CompletedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        var mock = CreateRepositoryMock();
        var vm = new TaskListViewModel(mock.Object);

        await vm.ToggleCompleteCommand.ExecuteAsync(task);

        Assert.False(task.IsCompleted);
        Assert.Null(task.CompletedAt);
    }

    [Fact]
    public async Task ToggleCompleteCommand_CallsSaveTaskAsync()
    {
        var task = new TaskItem { Id = 1, Title = "Test task", IsCompleted = false, CreatedAt = DateTime.UtcNow };
        var mock = CreateRepositoryMock();
        var vm = new TaskListViewModel(mock.Object);

        await vm.ToggleCompleteCommand.ExecuteAsync(task);

        mock.Verify(
            r => r.SaveTaskAsync(task),
            Times.Once,
            "SaveTaskAsync should be called with the toggled task.");
    }
}
