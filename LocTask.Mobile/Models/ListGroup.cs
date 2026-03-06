using SQLite;

namespace LocTask.Mobile.Models;

/// <summary>
/// Represents a named group of tasks (e.g., "Errands", "Work").
/// </summary>
public class ListGroup
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [NotNull]
    public string Name { get; set; } = string.Empty;

    /// <summary>Hex colour code or CSS colour name (e.g., "#FF5733").</summary>
    public string Color { get; set; } = "#000000";
}
