using System.Security.Claims;
using API.Exceptions;
using API.Services.Abstracts;
using Microsoft.AspNetCore.Mvc.Filters;
using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;
using Domain.Common.Constants;
using Domain.Common.Enum;

namespace API.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthenticateAttribute(params UserTypeEnum[] userTypes) : Attribute, IAsyncAuthorizationFilter
    {
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var service = context.HttpContext.RequestServices.GetService<IAuthenticationFilterService>();

            if (service == null)
            {
                throw new ArgumentNullException(nameof(service));
            }

            try
            {
                await service.CheckAuthentication(context, userTypes);
            }
            catch (UnAuthorizedException)
            {
                throw;
            }
        }

        public interface IAuthenticationFilterService
        {
            Task CheckAuthentication(AuthorizationFilterContext context, UserTypeEnum[] userTypes);
        }

        internal class AuthenticationFilterService : IAuthenticationFilterService
        {
            private readonly ITokenService _tokenService;
            private readonly IDatabase _redis;

            public AuthenticationFilterService(
                ITokenService tokenService,
                IConnectionMultiplexer connectionMultiplexer)
            {
                _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
                _redis = connectionMultiplexer.GetDatabase();
            }

            public async Task CheckAuthentication(AuthorizationFilterContext context, UserTypeEnum[] userTypes)
            {
                context.HttpContext.Request.Headers.TryGetValue("Authorization", out var tokenValues);
                var token = tokenValues.FirstOrDefault();

                if (tokenValues.Count == 0 || string.IsNullOrWhiteSpace(token))
                {
                    throw new UnAuthorizedException("Missing Authenticate key");
                }

                var claim = _tokenService.ValidateToken(token);

                if (claim is null)
                {
                    throw new UnAuthorizedException("UnAuthorization");
                }

                var userId = claim.FindFirstValue("userId");

                var jti = claim.FindFirstValue(JwtRegisteredClaimNames.Jti);

                var userType = claim.FindFirstValue("userType");

                if (userTypes.Any() && Enum.TryParse(userType, out UserTypeEnum parsedUserType))
                {
                    if (!userTypes.Contains(parsedUserType))
                    {
                        throw new ForbiddenException("Permission denied");
                    }
                }

                // check token blacklist
                if (await _redis.KeyExistsAsync($"{AuthConstant.ACCESS_TOKEN_BLACK_LIST}_{jti}_{userId}"))
                {
                    throw new UnAuthorizedException("Token Revoked");
                }

                // Remove header
                RemoveHeader(context.HttpContext.Request);

                // Add header 
                AddHeader(context.HttpContext.Request, claim);
            }

            private void RemoveHeader(HttpRequest request)
            {
                if (request.Headers.Any(x => x.Key == "Authorization-UserId"))
                {
                    request.Headers.Remove("Authorization-UserId");
                }

                if (request.Headers.Any(x => x.Key == "Authorization-Jti"))
                {
                    request.Headers.Remove("Authorization-Jti");
                }

                if (request.Headers.Any(x => x.Key == "Authorization-UserType"))
                {
                    request.Headers.Remove("Authorization-UserType");
                }
            }

            private void AddHeader(HttpRequest request, ClaimsPrincipal claim)
            {
                var userId = claim.FindFirstValue("userId");

                var userType = claim.FindFirstValue("userType");

                var jti = claim.FindFirstValue(JwtRegisteredClaimNames.Jti);

                request.Headers.TryAdd("Authorization-UserId", userId);
                request.Headers.TryAdd("Authorization-UserType", userType);
                request.Headers.TryAdd("Authorization-Jti", jti); ;
            }
        }
    }
}