// NOTE: This file requires the .NET MAUI workload.
// It is excluded from the net10.0 (class-library) build target in the .csproj
// so the project can be compiled and tested without the workload installed.
//
// To use this file:
//   1. Install the MAUI workload:  dotnet workload install maui
//   2. Update LocTask.Mobile.csproj to target MAUI frameworks and set <UseMaui>true</UseMaui>.
//   3. Remove the <Compile Remove="MauiProgram.cs" /> item group entry.

using LocTask.Mobile.Infrastructure;
using Microsoft.Extensions.Logging;
using Microsoft.Maui.Controls.Hosting;
using Microsoft.Maui.Hosting;

namespace LocTask.Mobile;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();

        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemiBold");
            });

        // Register all LocTask services, repositories, and ViewModels.
        var dbPath = Path.Combine(
            Microsoft.Maui.Storage.FileSystem.AppDataDirectory,
            "loctask.db3");

        builder.Services.AddLocTaskServices(dbPath);

#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
