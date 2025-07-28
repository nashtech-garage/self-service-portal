using System.Diagnostics.CodeAnalysis;
using Domain.Mapping;
using Domain.Repositories;
using Infrastructure.Database;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Infrastructure.IOC
{
    [ExcludeFromCodeCoverage]
    public partial class Program { }
    [ExcludeFromCodeCoverage]
    public static partial class DependencyInjection
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            // ---------- Add Repositories here ----------
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IAssignmentRepository, AssignmentRepository>();
            services.AddScoped<IReturningRequestRepository, ReturningRequestRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IAssetRepository, AssetRepository>();
            services.AddScoped<IStateRepository, StateRepository>();

            return services;
        }

        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var logger = services.BuildServiceProvider().GetRequiredService<ILogger<Program>>();
            // ---------- Add Infrastructure here ----------
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<ApplicationDbContext>(options => options
                .UseNpgsql(connectionString)
                .UseSnakeCaseNamingConvention());

            var redisConnectionString = configuration.GetConnectionString("RedisConnection");
            logger.LogInformation("Redis connection string: {RedisConnectionString}", redisConnectionString);
            if (!string.IsNullOrEmpty(redisConnectionString))
            {
                services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnectionString));
            }

            return services;
        }

        public static IServiceCollection AddMappingConfig(this IServiceCollection services)
        {
            // ---------- Add Mapping config here ----------
            services.AddAutoMapper(typeof(UserProfile));
            services.AddAutoMapper(typeof(AssignmentProfile));
            services.AddAutoMapper(typeof(CategoryProfile));
            services.AddAutoMapper(typeof(AssetProfile));
            services.AddAutoMapper(typeof(ReturningRequestProfile));

            return services;
        }
    }
}

