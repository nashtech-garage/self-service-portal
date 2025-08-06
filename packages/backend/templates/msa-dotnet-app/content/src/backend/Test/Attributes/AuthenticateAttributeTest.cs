using System;
using System.Linq;
using System.Threading.Tasks;
using API.Attributes;
using API.Exceptions;
using Domain.Common.Enum;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Moq;
using Xunit;

namespace Test.Attributes;

public class AuthenticateAttributeTest
{
    private readonly Mock<AuthenticateAttribute.IAuthenticationFilterService> _serviceMock;
    private readonly AuthorizationFilterContext _context;
    private readonly AuthenticateAttribute _attribute;

    public AuthenticateAttributeTest()
    {
        _serviceMock = new Mock<AuthenticateAttribute.IAuthenticationFilterService>();
        var httpContext = new DefaultHttpContext();
        var actionContext = new Microsoft.AspNetCore.Mvc.ActionContext
        {
            HttpContext = httpContext,
            RouteData = new Microsoft.AspNetCore.Routing.RouteData(),
            ActionDescriptor = new ControllerActionDescriptor()
        };
        _context = new AuthorizationFilterContext(actionContext, Enumerable.Empty<IFilterMetadata>().ToList());
        _attribute = new AuthenticateAttribute(UserTypeEnum.Admin, UserTypeEnum.Staff);
    }

    private class TestServiceProvider : IServiceProvider
    {
        private readonly object _service;
        public TestServiceProvider(object service) => _service = service;
        public object? GetService(Type serviceType) => _service;
    }

    [Fact]
    public async Task OnAuthorizationAsync_CallsCheckAuthentication_WithCorrectParameters()
    {
        // Arrange
        _context.HttpContext.RequestServices = new TestServiceProvider(_serviceMock.Object);

        // Act
        await _attribute.OnAuthorizationAsync(_context);

        // Assert
        _serviceMock.Verify(s => s.CheckAuthentication(_context, new[] { UserTypeEnum.Admin, UserTypeEnum.Staff }), Times.Once);
    }

    [Fact]
    public async Task OnAuthorizationAsync_ThrowsArgumentNullException_WhenServiceIsNull()
    {
        // Arrange
        _context.HttpContext.RequestServices = new TestServiceProvider(null);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _attribute.OnAuthorizationAsync(_context));
    }

    [Fact]
    public async Task OnAuthorizationAsync_ThrowsUnAuthorizedException_WhenServiceThrowsUnAuthorized()
    {
        // Arrange
        _context.HttpContext.RequestServices = new TestServiceProvider(_serviceMock.Object);
        _serviceMock
            .Setup(s => s.CheckAuthentication(It.IsAny<AuthorizationFilterContext>(), It.IsAny<UserTypeEnum[]>()))
            .ThrowsAsync(new UnAuthorizedException("unauthorized"));

        // Act & Assert
        await Assert.ThrowsAsync<UnAuthorizedException>(() => _attribute.OnAuthorizationAsync(_context));
    }
}