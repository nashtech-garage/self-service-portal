using System;
using System.Net;
using System.Threading.Tasks;
using API.Controllers;
using API.Exceptions;
using API.Services.Abstracts;
using AutoMapper;
using Domain.Common.Enum;
using Domain.Dtos.Responses;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Test.Controllers
{
    public class UserProfileControllerTest
    {
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<UserProfileController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly UserProfileController _controller;

        public UserProfileControllerTest()
        {
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<UserProfileController>>();
            _authServiceMock = new Mock<IAuthService>();
            _mapperMock = new Mock<IMapper>();

            _controller = new UserProfileController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object,
                _mapperMock.Object
            );
        }

        [Fact]
        public async Task GetMe_ReturnsUserProfileData_WhenCalled()
        {
            // Arrange
            var location = new Location { Id = 1, Name = "HCM" };
            var user = new User
            {
                Id = 1,
                StaffCode = "SD0001",
                FirstName = "John",
                LastName = "Doe",
                Username = "johndoe",
                LocationId = 1,
                Location = location,
                UserType = UserTypeEnum.Staff,
                IsChangedPassword = true
            };

            var expectedResponse = new GetMeResponse
            {
                Id = 1,
                Username = "johndoe",
                FirstName = "John",
                LastName = "Doe",
                LocationId = 1,
                UserType = UserTypeEnum.Staff,
                IsChangedPassword = true
            };

            _authServiceMock
                .Setup(s => s.GetUserForAuth(It.IsAny<int>()))
                .ReturnsAsync(user);

            _mapperMock
                .Setup(m => m.Map<GetMeResponse>(It.IsAny<User>()))
                .Returns(expectedResponse);

            // Setup HttpContext for the controller
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization-UserId"] = "1";

            _httpContextAccessorMock
                .Setup(x => x.HttpContext)
                .Returns(httpContext);

            // Act
            var actionResult = await _controller.GetMe();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult);
            var responseObj = okResult.Value;

            // Access properties dynamically since we don't have the exact anonymous type
            var statusProp = responseObj?.GetType().GetProperty("status");
            var messageProp = responseObj?.GetType().GetProperty("message");
            var dataProp = responseObj?.GetType().GetProperty("data");

            Assert.NotNull(statusProp);
            Assert.NotNull(messageProp);
            Assert.NotNull(dataProp);

            Assert.Equal(HttpStatusCode.OK, statusProp!.GetValue(responseObj));
            Assert.Equal("Get data successfully", messageProp!.GetValue(responseObj));
            Assert.Equal(expectedResponse, dataProp!.GetValue(responseObj));
        }

        [Fact]
        public async Task GetMe_ReturnsAdminProfile_WhenUserIsAdmin()
        {
            // Arrange
            var location = new Location { Id = 1, Name = "HCM" };
            var adminUser = new User
            {
                Id = 1,
                StaffCode = "AD0001",
                FirstName = "Admin",
                LastName = "User",
                Username = "adminuser",
                LocationId = 1,
                Location = location,
                UserType = UserTypeEnum.Admin,
                IsChangedPassword = true
            };

            var expectedResponse = new GetMeResponse
            {
                Id = 1,
                Username = "adminuser",
                FirstName = "Admin",
                LastName = "User",
                LocationId = 1,
                UserType = UserTypeEnum.Admin,
                IsChangedPassword = true
            };

            _authServiceMock
                .Setup(s => s.GetUserForAuth(It.IsAny<int>()))
                .ReturnsAsync(adminUser);

            _mapperMock
                .Setup(m => m.Map<GetMeResponse>(It.IsAny<User>()))
                .Returns(expectedResponse);

            // Setup HttpContext for the controller
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization-UserId"] = "1";

            _httpContextAccessorMock
                .Setup(x => x.HttpContext)
                .Returns(httpContext);

            // Act
            var actionResult = await _controller.GetMe();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult);
            var responseObj = okResult.Value;
            var dataProp = responseObj?.GetType().GetProperty("data");

            Assert.NotNull(dataProp);
            var responseData = dataProp!.GetValue(responseObj) as GetMeResponse;
            Assert.NotNull(responseData);
            Assert.Equal(UserTypeEnum.Admin, responseData!.UserType);
        }

        [Fact]
        public async Task GetMe_HandlesUserWithUnchangedPassword()
        {
            // Arrange
            var location = new Location { Id = 1, Name = "HCM" };
            var user = new User
            {
                Id = 1,
                StaffCode = "SD0001",
                FirstName = "John",
                LastName = "Doe",
                Username = "johndoe",
                LocationId = 1,
                Location = location,
                UserType = UserTypeEnum.Staff,
                IsChangedPassword = false // User hasn't changed default password
            };

            var expectedResponse = new GetMeResponse
            {
                Id = 1,
                Username = "johndoe",
                FirstName = "John",
                LastName = "Doe",
                LocationId = 1,
                UserType = UserTypeEnum.Staff,
                IsChangedPassword = false
            };

            _authServiceMock
                .Setup(s => s.GetUserForAuth(It.IsAny<int>()))
                .ReturnsAsync(user);

            _mapperMock
                .Setup(m => m.Map<GetMeResponse>(It.IsAny<User>()))
                .Returns(expectedResponse);

            // Setup HttpContext for the controller
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization-UserId"] = "1";

            _httpContextAccessorMock
                .Setup(x => x.HttpContext)
                .Returns(httpContext);

            // Act
            var actionResult = await _controller.GetMe();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult);
            var responseObj = okResult.Value;
            var dataProp = responseObj?.GetType().GetProperty("data");

            Assert.NotNull(dataProp);
            var responseData = dataProp!.GetValue(responseObj) as GetMeResponse;
            Assert.NotNull(responseData);
            Assert.False(responseData!.IsChangedPassword);
        }

        [Fact]
        public async Task GetMe_ThrowsException_WhenUserNotFound()
        {
            // Arrange
            _authServiceMock
                .Setup(s => s.GetUserForAuth(It.IsAny<int>()))
                .ThrowsAsync(new UnAuthorizedException("User not found"));

            // Setup HttpContext for the controller
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization-UserId"] = "1";

            _httpContextAccessorMock
                .Setup(x => x.HttpContext)
                .Returns(httpContext);

            // Act & Assert
            await Assert.ThrowsAsync<UnAuthorizedException>(() => _controller.GetMe());
        }

        [Fact]
        public async Task GetMe_ThrowsException_WhenUserIsDisabled()
        {
            // Arrange
            _authServiceMock
                .Setup(s => s.GetUserForAuth(It.IsAny<int>()))
                .ThrowsAsync(new ForbiddenException("You has been disabled"));

            // Setup HttpContext for the controller
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization-UserId"] = "1";

            _httpContextAccessorMock
                .Setup(x => x.HttpContext)
                .Returns(httpContext);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ForbiddenException>(() => _controller.GetMe());
            Assert.Equal("You has been disabled", exception.Message);
        }

        [Fact]
        public async Task GetMe_ThrowsException_WhenHttpContextIsNull()
        {
            // Arrange
            _httpContextAccessorMock
                .Setup(x => x.HttpContext)
                .Returns((HttpContext)null!);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnAuthorizedException>(() => _controller.GetMe());
            Assert.Equal("HttpContext is null", exception.Message);
        }

        [Fact]
        public async Task GetMe_ThrowsException_WhenAuthorizationHeaderMissing()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            // Not setting the Authorization-UserId header

            _httpContextAccessorMock
                .Setup(x => x.HttpContext)
                .Returns(httpContext);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnAuthorizedException>(() => _controller.GetMe());
            Assert.Equal("Not found userId in Header", exception.Message);
        }

        [Fact]
        public async Task GetMe_ThrowsException_WhenAuthorizationHeaderEmpty()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization-UserId"] = string.Empty;

            _httpContextAccessorMock
                .Setup(x => x.HttpContext)
                .Returns(httpContext);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnAuthorizedException>(() => _controller.GetMe());
            Assert.Equal("Not found userId in Header", exception.Message);
        }
    }
}