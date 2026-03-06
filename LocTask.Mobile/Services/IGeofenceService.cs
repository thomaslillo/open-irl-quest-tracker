namespace LocTask.Mobile.Services;

/// <summary>
/// Abstraction over the platform geofencing API.
/// A concrete implementation using Shiny.Geofencing will be added once the
/// MAUI workload is configured.
/// </summary>
public interface IGeofenceService
{
    /// <summary>Registers a circular geofence with the given parameters.</summary>
    Task RegisterGeofenceAsync(int locationId, string identifier, double latitude, double longitude, double radiusMeters);

    /// <summary>Removes an existing geofence by its identifier.</summary>
    Task UnregisterGeofenceAsync(string identifier);

    /// <summary>Returns the identifiers of all currently registered geofences.</summary>
    Task<IReadOnlyList<string>> GetRegisteredGeofencesAsync();
}
