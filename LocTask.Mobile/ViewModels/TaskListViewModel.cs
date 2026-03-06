using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LocTask.Mobile.Models;
using LocTask.Mobile.Repositories;

namespace LocTask.Mobile.ViewModels;

/// <summary>
/// ViewModel for the task list screen.  Manages an observable list of
/// <see cref="TaskItem"/> objects and exposes commands for loading, adding,
/// and toggling the completion state of tasks.
/// </summary>
public partial class TaskListViewModel : ObservableObject
{
    private readonly ITaskRepository _repository;

    [ObservableProperty]
    private ObservableCollection<TaskItem> _tasks = [];

    [ObservableProperty]
    private bool _isBusy;

    public TaskListViewModel(ITaskRepository repository)
    {
        _repository = repository;
    }

    /// <summary>
    /// Loads all incomplete tasks from the repository and populates
    /// <see cref="Tasks"/>.
    /// </summary>
    [RelayCommand]
    private async Task LoadTasksAsync()
    {
        IsBusy = true;
        try
        {
            var items = await _repository.GetTasksAsync();
            Tasks = new ObservableCollection<TaskItem>(items);
        }
        finally
        {
            IsBusy = false;
        }
    }

    /// <summary>
    /// Creates a new blank <see cref="TaskItem"/>, persists it, then refreshes
    /// the task list.
    /// </summary>
    [RelayCommand]
    private async Task AddTaskAsync()
    {
        var newTask = new TaskItem
        {
            Title = "New Task",
            CreatedAt = DateTime.UtcNow
        };

        await _repository.SaveTaskAsync(newTask);
        await LoadTasksAsync();
    }

    /// <summary>
    /// Toggles the <see cref="TaskItem.IsCompleted"/> flag on the supplied
    /// <paramref name="task"/> and persists the change.
    /// </summary>
    [RelayCommand]
    private async Task ToggleCompleteAsync(TaskItem task)
    {
        task.IsCompleted = !task.IsCompleted;
        task.CompletedAt = task.IsCompleted ? DateTime.UtcNow : null;
        await _repository.SaveTaskAsync(task);
    }
}
