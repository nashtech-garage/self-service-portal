using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Net;
using System.Reflection.Metadata;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using System.Threading.Tasks;
using API.Services;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Dtos;
using Domain.Dtos.Common;
using Domain.Mapping;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using static API.Attributes.AuthenticateAttribute;

namespace API.IOC
{
    [ExcludeFromCodeCoverage]
    public static partial class DependencyInjection
    {
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            // ---------- Add Services here ----------
            services.AddScoped<IAuthenticationFilterService, AuthenticationFilterService>();
            services.AddScoped<ISampleService, SampleService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IHomeService, HomeService>();
            services.AddScoped<ICurrentUserContext, CurrentUserContext>();
            services.AddScoped<IAssignmentService, AssignmentService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IAssetService, AssetService>();
            services.AddScoped<IReturningRequestService, ReturningRequestService>();
            services.AddScoped<IReportService, ReportService>();

            return services;
        }

        public static IServiceCollection AddSwaggerConfig(this IServiceCollection services)
        {
            // ---------- Add Swagger config here ----------
            services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Token", new OpenApiSecurityScheme
                {
                    Description = "Token Authorization header using the Jwt scheme. Example: \"{your_token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Token"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Token"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            return services;
        }

        public static IServiceCollection AddSettingConfig(this IServiceCollection services, IConfiguration configuration)
        {
            // ---------- Add token config here ----------
            services.Configure<TokenSettings>(configuration.GetSection("TokenSettings"));

            return services;
        }

        public static IServiceCollection AddEndpointConfig(this IServiceCollection services)
        {
            // ---------- Add Endpoint config here ----------
            services.AddEndpointsApiExplorer();

            return services;
        }

        public static IServiceCollection AddCorsConfig(this IServiceCollection services)
        {
            // ---------- Add CORS config here ----------
            services.AddCors(options =>
            {
                options.AddPolicy(ConfigConstants.CORSAllowAll, policy =>
                {
                    policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            return services;
        }

        public static IServiceCollection AddControllerConfig(this IServiceCollection services)
        {
            // ---------- Add Controller config here ----------
            services.AddControllers().AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.IgnoreReadOnlyFields = true;
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                }
            );

            return services;
        }

        public static IServiceCollection AddModelStateValidationConfig(this IServiceCollection services)
        {
            // ---------- Add Controller config here ----------
            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .SelectMany(x => x.Value.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    var response = new BaseResponse
                    {
                        StatusCode = (HttpStatusCode)StatusCodes.Status400BadRequest,
                        Errors = errors
                    };

                    return new BadRequestObjectResult(response);
                };
            });

            return services;
        }

        public static IServiceCollection AddRateLimiterConfig(this IServiceCollection services)
        {
            // ---------- Add RateLimiter config here ----------
            services.AddRateLimiter( options => {
                options.AddPolicy(ConfigConstants.IpRateLimit, httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: httpContext.Request.Headers["X-Forwarded-For"].ToString(),
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = ConfigConstants.RateLimit, // Số request tối đa
                            Window = TimeSpan.FromSeconds(ConfigConstants.RateLimitTime), // Khoảng thời gian tính limit
                            AutoReplenishment = true,
                            QueueLimit = 0
                        }
                    )
                );
                options.RejectionStatusCode = (int)HttpStatusCode.TooManyRequests;
                }
            );

            return services;
        }

        public static IServiceCollection AddRequestTimeoutConfig(this IServiceCollection services)
        {
            // ---------- Add RateLimiter config here ----------
            services.AddRequestTimeouts(options =>
                {
                    options.AddPolicy(ConfigConstants.ShortTimeout, new RequestTimeoutPolicy
                    {
                        Timeout = TimeSpan.FromSeconds(ConfigConstants.RequestTime),
                        TimeoutStatusCode = (int)HttpStatusCode.GatewayTimeout,
                        WriteTimeoutResponse = async (context) =>
                        {
                            context.Response.ContentType = "text/plain";
                            await context.Response.WriteAsync("{\"message\":\"Request timeout\"}");
                        }
                    });
                });

            return services;
        }
    }
}