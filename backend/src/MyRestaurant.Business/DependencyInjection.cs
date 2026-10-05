using Microsoft.Extensions.DependencyInjection;
using MyRestaurant.Business.Services;

namespace MyRestaurant.Business;

public static class DependencyInjection
{
    public static IServiceCollection AddBusiness(this IServiceCollection services)
    {
        services.AddScoped<AuthService>();
        services.AddScoped<MenuService>();
        services.AddScoped<OrderService>();
        services.AddScoped<ReservationService>();
        return services;
    }
}
