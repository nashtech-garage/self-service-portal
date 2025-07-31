using System;
using System.Net;
using System.Threading.Tasks;
using API.Controllers;
using API.Exceptions;
using API.Services.Abstracts;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using Moq;
using Xunit;

namespace Test.Controllers
{
    public class TestController : APIController<TestController>
    {
        public TestController(IHttpContextAccessor accessor, ILogger<TestController> logger, IAuthService authService)
            : base(accessor, logger, authService) { }

        // Expose protected methods for testing
        public new async Task<User> GetAuth() => await base.GetAuth();
        public new string GetJti() => base.GetJti();
        public new ActionResult OkResponse<A>(A data, string message) where A : class => base.OkResponse(data, message);
        public new ActionResult CreatedResponse<A>(A data, string message) where A : class => base.CreatedResponse(data, message);
        public new ActionResult CreatedResponse(string? message = null) => base.CreatedResponse(message);
        public new ActionResult NoContentResponse() => base.NoContentResponse();
    }

    public class ApiControllerTest
    {

        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<TestController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly TestController _controller;

        public ApiControllerTest()
        {
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<TestController>>();
            _authServiceMock = new Mock<IAuthService>();
            _controller = new TestController(_httpContextAccessorMock.Object, _loggerMock.Object, _authServiceMock.Object);
        }

        [Fact]
        public async Task GetAuth_ThrowsUnAuthorizedException_WhenHttpContextIsNull()
        {
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns((HttpContext?)null);

            await Assert.ThrowsAsync<UnAuthorizedException>(() => _controller.GetAuth());
        }

        [Fact]
        public async Task GetAuth_ThrowsUnAuthorizedException_WhenUserIdHeaderMissing()
        {
            var context = new DefaultHttpContext();
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);

            await Assert.ThrowsAsync<UnAuthorizedException>(() => _controller.GetAuth());
        }

        [Fact]
        public async Task GetAuth_ThrowsUnAuthorizedException_WhenUserIdHeaderEmpty()
        {
            var context = new DefaultHttpContext();
            context.Request.Headers["Authorization-UserId"] = StringValues.Empty;
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);

            await Assert.ThrowsAsync<UnAuthorizedException>(() => _controller.GetAuth());
        }

        [Fact]
        public async Task GetAuth_ThrowsUnAuthorizedException_WhenUserIdHeaderWhitespace()
        {
            var context = new DefaultHttpContext();
            context.Request.Headers["Authorization-UserId"] = "   ";
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);

            await Assert.ThrowsAsync<UnAuthorizedException>(() => _controller.GetAuth());
        }

        [Fact]
        public async Task GetAuth_ThrowsUnAuthorizedException_WhenUserNotFound()
        {
            var context = new DefaultHttpContext();
            context.Request.Headers["Authorization-UserId"] = "123";
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);

            _authServiceMock.Setup(s => s.GetUserForAuth(123)).ReturnsAsync((User?)null);

            await Assert.ThrowsAsync<UnAuthorizedException>(() => _controller.GetAuth());
        }

        [Fact]
        public async Task GetAuth_ThrowsForbiddenException_WhenUserIsDisabled()
        {
            var context = new DefaultHttpContext();
            context.Request.Headers["Authorization-UserId"] = "123";
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);

            var user = new User { Id = 123, IsDisable = true };
            _authServiceMock.Setup(s => s.GetUserForAuth(123)).ReturnsAsync(user);

            await Assert.ThrowsAsync<ForbiddenException>(() => _controller.GetAuth());
        }

        [Fact]
        public async Task GetAuth_ReturnsUser_WhenValid()
        {
            var context = new DefaultHttpContext();
            context.Request.Headers["Authorization-UserId"] = "123";
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);

            var user = new User { Id = 123, IsDisable = false };
            _authServiceMock.Setup(s => s.GetUserForAuth(123)).ReturnsAsync(user);

            var result = await _controller.GetAuth();

            Assert.Equal(123, result.Id);
            Assert.False(result.IsDisable);
        }

        [Fact]
        public void GetJti_ThrowsUnAuthorizedException_WhenHttpContextIsNull()
        {
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns((HttpContext?)null);

            Assert.Throws<UnAuthorizedException>(() => _controller.GetJti());
        }

        [Fact]
        public void GetJti_ThrowsUnAuthorizedException_WhenJtiHeaderMissing()
        {
            var context = new DefaultHttpContext();
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);

            Assert.Throws<UnAuthorizedException>(() => _controller.GetJti());
        }

        [Fact]
        public void GetJti_ThrowsUnAuthorizedException_WhenJtiHeaderEmpty()
        {
            var context = new DefaultHttpContext();
            context.Request.Headers["Authorization-Jti"] = StringValues.Empty;
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);

            Assert.Throws<UnAuthorizedException>(() => _controller.GetJti());
        }

        [Fact]
        public void GetJti_ReturnsJti_WhenValid()
        {
            var context = new DefaultHttpContext();
            context.Request.Headers["Authorization-Jti"] = "jti-value";
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);

            var result = _controller.GetJti();

            Assert.Equal("jti-value", result);
        }

        [Fact]
        public void OkResponse_ReturnsOkObjectResult_WithExpectedData()
        {
            var data = new { Name = "Test" };
            var result = _controller.OkResponse(data, "ok-message");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            dynamic value = okResult.Value;
            Assert.Equal("ok-message", (string)value.message);
            Assert.Equal("Test", (string)value.data.Name);
            Assert.Equal(HttpStatusCode.OK, value.status);
        }

        [Fact]
        public void CreatedResponse_WithData_ReturnsCreatedResult()
        {
            var data = new { Id = 1 };
            var result = _controller.CreatedResponse(data, "created-message");

            var createdResult = Assert.IsType<CreatedResult>(result);
            Assert.NotNull(createdResult.Value);
            dynamic value = createdResult.Value;
            Assert.Equal("created-message", (string)value.message);
            Assert.Equal(1, (int)value.data.Id);
            Assert.Equal(HttpStatusCode.Created, value.status);
        }

        [Fact]
        public void CreatedResponse_WithoutData_ReturnsStatusCodeResult()
        {
            var result = _controller.CreatedResponse("created-no-data");

            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.NotNull(statusResult.Value);
            dynamic value = statusResult.Value;
            Assert.Equal("created-no-data", (string)value.message);
            Assert.Equal(HttpStatusCode.Created, value.status);
            Assert.Equal((int)HttpStatusCode.Created, statusResult.StatusCode);
        }

        [Fact]
        public void NoContentResponse_ReturnsNoContentResult()
        {
            var result = _controller.NoContentResponse();

            Assert.IsType<NoContentResult>(result);
        }
    }
}