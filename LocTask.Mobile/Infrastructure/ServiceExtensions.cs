using LocTask.Mobile.Repositories;
using LocTask.Mobile.ViewModels;
using Microsoft.Extensions.DependencyInjection;

namespace LocTask.Mobile.Infrastructure;

/// <summary>
/// Extension methods for <see cref="IServiceCollection"/> that wire up all
/// LocTask services, repositories, and ViewModels.
/// </summary>
public static class ServiceExtensions
{
    /// <summary>
    /// Registers all LocTask services into the given <paramref name="services"/>
    /// collection.
    /// </summary>
    /// <param name="services">The DI service collection.</param>
    /// <param name="dbPath">
    /// Absolute path to the SQLite database file.
    /// Typically <c>Path.Combine(FileSystem.AppDataDirectory, "loctask.db3")</c>
    /// when called from MauiProgram.
    /// </param>
    public static IServiceCollection AddLocTaskServices(
        this IServiceCollection services,
        string dbPath)
    {
        // Repository – single instance for the lifetime of the app.
        services.AddSingleton<ITaskRepository>(_ => new SqliteTaskRepository(dbPath));

        // ViewModels – transient so each page gets a fresh instance.
        services.AddTransient<TaskListViewModel>();

        return services;
    }
}
