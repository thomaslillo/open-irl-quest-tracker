using SQLite;

namespace LocTask.Mobile.Models;

/// <summary>
/// Represents a geofenced location that can trigger tasks.
/// </summary>
public class Location
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [NotNull]
    public string Name { get; set; } = string.Empty;

    /// <summary>Optional human-readable address.</summary>
    public string? Address { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    /// <summary>Radius in meters for circular geofences.</summary>
    public double Radius { get; set; }

    /// <summary>
    /// Polygon coordinates stored as JSON or WKT for custom-shaped geofences.
    /// Null when using the simple circular fence defined by <see cref="Latitude"/>,
    /// <see cref="Longitude"/> and <see cref="Radius"/>.
    /// </summary>
    public string? GeofenceData { get; set; }

    public DateTime CreatedAt { get; set; }
}
