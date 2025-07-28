using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace API.Middlewares;

public static class RegisterMiddlewareContainer
{
    [ExcludeFromCodeCoverage]
    public static IApplicationBuilder UseRegisterMiddleware(this IApplicationBuilder builder)
    {
        return builder
            .UseMiddleware<ErrorHandlerMiddleware>();
    }
}