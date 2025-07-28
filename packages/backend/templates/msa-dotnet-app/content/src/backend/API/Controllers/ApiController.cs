using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using API.Exceptions;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Entities;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Primitives;

namespace API.Controllers
{
    [ApiController]
    [EnableRateLimiting(ConfigConstants.IpRateLimit)]
    public abstract class APIController<T> : ControllerBase where T : class
    {
        protected readonly ILogger _logger;
        protected readonly IHttpContextAccessor _httpContextAccessor;
        protected readonly IAuthService _authService;

        protected APIController(
            IHttpContextAccessor httpContextAccessor, 
            ILogger<T> logger,
            IAuthService authService)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
        }


        protected async Task<User> GetAuth()
        {
            var httpContext = _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                throw new UnAuthorizedException("HttpContext is null");
            }

            if (!httpContext.Request.Headers.TryGetValue("Authorization-UserId", out var userId) ||
                StringValues.IsNullOrEmpty(userId))
            {
                throw new UnAuthorizedException("Not found userId in Header");
            }

            var userIdStr = userId.FirstOrDefault();

            if (string.IsNullOrWhiteSpace(userIdStr))
            {
                throw new UnAuthorizedException("userId in Header is empty");
            }

            Int32.TryParse(userIdStr, out var userIdInt);

            var user = await _authService.GetUserForAuth(userIdInt);

            if (user == null)
            {
                throw new UnAuthorizedException("User not found");
            }

            if (user.IsDisable)
            {
                throw new ForbiddenException("You has been disabled");
            }

            return user;
        }

        protected string GetJti()
        {
            var httpContext = _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                throw new UnAuthorizedException("HttpContext is null");
            }

            if (!httpContext.Request.Headers.TryGetValue("Authorization-Jti", out var jti) ||
                StringValues.IsNullOrEmpty(jti))
            {
                throw new UnAuthorizedException("Not found userId in Header");
            }

            return jti.ToString();
        }

        protected ActionResult OkResponse<A>(A data, string message) where A : class
        {
            return Ok(new
            {
                status = HttpStatusCode.OK,
                message,
                data
            });
        }

        protected ActionResult CreatedResponse<A>(A data, string message) where A : class
        {
            return Created(nameof(GetAuth), new
            {
                status = HttpStatusCode.Created,
                message,
                data
            });
        }

        protected ActionResult CreatedResponse(string? message = null)
        {
            return StatusCode((int)HttpStatusCode.Created, new
            {
                status = HttpStatusCode.Created,
                message,
            });
        }

        protected ActionResult NoContentResponse()
        {
            return NoContent();
        }
    }
}