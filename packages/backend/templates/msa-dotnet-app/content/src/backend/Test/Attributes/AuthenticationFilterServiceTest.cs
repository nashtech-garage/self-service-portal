using Moq;
using Xunit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using API.Exceptions;
using API.Attributes;
using Domain.Common.Enum;
using Domain.Common.Constants;
using System.Security.Claims;
using API.Services.Abstracts;
using StackExchange.Redis;
using static API.Attributes.AuthenticateAttribute;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace Test.Attributes;

public class AuthenticationFilterServiceTests
{
    private readonly Mock<ITokenService> _tokenServiceMock = new();
    private readonly Mock<IConnectionMultiplexer> _redisMock = new();
    private readonly AuthenticationFilterService _service;

    public AuthenticationFilterServiceTests()
    {
        var redisDbMock = new Mock<IDatabase>();
        _redisMock.Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(redisDbMock.Object);
        _service = new AuthenticationFilterService(_tokenServiceMock.Object, _redisMock.Object);
    }

    [Fact]
    public async Task CheckAuthentication_MissingToken_ThrowsUnAuthorizedException()
    {
        // Arrange
        var context = CreateAuthorizationContext(null!);
        var userTypes = new UserTypeEnum[] { };

        // Act & Assert
        await Assert.ThrowsAsync<UnAuthorizedException>(() =>
            _service.CheckAuthentication(context, userTypes));
    }

    [Fact]
    public async Task CheckAuthentication_InvalidToken_ThrowsUnAuthorized()
    {
        // Arrange
        var context = CreateAuthorizationContext("invalid_token");
        _tokenServiceMock.Setup(x => x.ValidateToken(It.IsAny<string>())).Returns((ClaimsPrincipal)null!);

        // Act & Assert
        await Assert.ThrowsAsync<UnAuthorizedException>(() =>
            _service.CheckAuthentication(context, Array.Empty<UserTypeEnum>()));
    }

    [Fact]
    public async Task CheckAuthentication_ValidTokenButWrongUserType_ThrowsForbidden()
    {
        // Arrange
        var claim = CreateClaimsPrincipal(UserTypeEnum.Staff); // userType trong claim là Staff
        var context = CreateAuthorizationContext("valid_token");
        _tokenServiceMock.Setup(x => x.ValidateToken(It.IsAny<string>())).Returns(claim);

        // Act & Assert
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            _service.CheckAuthentication(context, new[] { UserTypeEnum.Admin })); // Chỉ cho phép Admin
    }

    private static AuthorizationFilterContext CreateAuthorizationContext(string token)
    {
        var httpContext = new DefaultHttpContext();
        if (!string.IsNullOrEmpty(token))
        {
            httpContext.Request.Headers["Authorization"] = token;
        }

        return new AuthorizationFilterContext(
            new ActionContext(httpContext, new Microsoft.AspNetCore.Routing.RouteData(), new ActionDescriptor()),
            new List<IFilterMetadata>());
    }

    private static ClaimsPrincipal CreateClaimsPrincipal(UserTypeEnum userType)
    {
        var claims = new[]
        {
            new Claim("userId", Guid.NewGuid().ToString()),
            new Claim("userType", userType.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        return new ClaimsPrincipal(new ClaimsIdentity(claims));
    }
}
