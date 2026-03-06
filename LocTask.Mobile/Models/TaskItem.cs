using SQLite;

namespace LocTask.Mobile.Models;

/// <summary>
/// Represents a task item. Named <see cref="TaskItem"/> to avoid conflict with
/// <see cref="System.Threading.Tasks.Task"/>.
/// </summary>
public class TaskItem
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [NotNull]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    /// <summary>Foreign key to <see cref="ListGroup"/>. Null when ungrouped.</summary>
    [Indexed]
    public int? GroupId { get; set; }

    /// <summary>Foreign key to <see cref="Location"/>. Null for time-based tasks.</summary>
    [Indexed]
    public int? LocationId { get; set; }

    public DateTime? DueDate { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? CompletedAt { get; set; }
}
