using API.IOC;
using API.Middlewares;
using Domain.Common.Constants;
using Infrastructure.IOC;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
// Configure logging using ILoggingBuilder
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

//------------------------------ Service & Repo & Infra ----------------------------------//
services.AddRateLimiterConfig()
        .AddInfrastructure(builder.Configuration)
        .AddServices()
        .AddRepositories()
        .AddSwaggerConfig()
        .AddEndpointConfig()
        .AddHttpContextAccessor()
        .AddControllerConfig()
        .AddModelStateValidationConfig()
        .AddSettingConfig(builder.Configuration)
        .AddMappingConfig()
        .AddCorsConfig()
        .AddRequestTimeoutConfig();

var app = builder.Build();
app.UseRequestTimeouts();
app.UseCors(ConfigConstants.CORSAllowAll);
if (!app.Environment.IsDevelopment())
{
    app.UseRateLimiter();
}
// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseRegisterMiddleware();
app.MapControllers();

app.Run();