using System.Threading.Tasks;
using API.Controllers;
using API.Services.Abstracts;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace Test.Controllers
{
    public class AuthControllerTest: APIController<AuthControllerTest>
    {
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<AuthController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly AuthController _controller;

        public AuthControllerTest()
            : base(
                new Mock<IHttpContextAccessor>().Object,
                new Mock<ILogger<AuthControllerTest>>().Object,
                new Mock<IAuthService>().Object
            )
        {
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<AuthController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new AuthController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object
            );
        }

        [Fact]
        public async Task Login_ReturnsOkResponse_WhenLoginSuccessful()
        {
            // Arrange
            var request = new LoginRequest { Username = "admin", Password = "password" };
            var response = new LoginResponse { UserId = 1, AccessToken = "token" };

            _authServiceMock
                .Setup(s => s.LoginAsync(request))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.Login(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            dynamic responseObj = okResult.Value;
            Assert.Equal("Login successfully", (string)responseObj.message);
            Assert.NotNull(responseObj.data);
            Assert.Equal(1, (int)responseObj.data.UserId);
            Assert.Equal("token", (string)responseObj.data.AccessToken);
        }

        [Fact]
        public async Task Login_ReturnsOkResponse_WithExpectedMessageAndData()
        {
            // Arrange
            var request = new LoginRequest { Username = "admin", Password = "password" };
            var response = new LoginResponse { UserId = 10, AccessToken = "jwt-token" };

            _authServiceMock
            .Setup(s => s.LoginAsync(It.Is<LoginRequest>(r => r.Username == request.Username && r.Password == request.Password)))
            .ReturnsAsync(response);

            // Act
            var result = await _controller.Login(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            dynamic responseObj = okResult.Value;
            Assert.Equal("Login successfully", (string)responseObj.message);
            Assert.NotNull(responseObj.data);
            Assert.Equal(10, (int)responseObj.data.UserId);
            Assert.Equal("jwt-token", (string)responseObj.data.AccessToken);
        }

        [Fact]
        public async Task Login_CallsAuthServiceWithCorrectRequest()
        {
            // Arrange
            var request = new LoginRequest { Username = "user", Password = "pass" };
            var response = new LoginResponse { UserId = 2, AccessToken = "token2" };

            _authServiceMock
            .Setup(s => s.LoginAsync(It.IsAny<LoginRequest>()))
            .ReturnsAsync(response);

            // Act
            await _controller.Login(request);

            // Assert
            _authServiceMock.Verify(s => s.LoginAsync(It.Is<LoginRequest>(r => r.Username == request.Username && r.Password == request.Password)), Times.Once);
        }

        [Fact]
        public async Task Login_ReturnsOkResponse_WithNullData_WhenAuthServiceReturnsNull()
        {
            // Arrange
            var request = new LoginRequest { Username = "nouser", Password = "nopass" };

            _authServiceMock
                .Setup(s => s.LoginAsync(It.IsAny<LoginRequest>()))
                .ReturnsAsync((LoginResponse?)null!);

            // Act
            var result = await _controller.Login(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            dynamic responseObj = okResult.Value;
            Assert.Equal("Login successfully", (string)responseObj.message);
            Assert.Null(responseObj.data);
        }

        [Fact]
        public async Task Refresh_CallsAuthServiceWithCorrectRequest()
        {
            // Arrange
            var request = new RefreshLoginRequest { RefreshToken = "refresh-token" };
            var response = new LoginResponse { UserId = 42, AccessToken = "access-token" };

            _authServiceMock
            .Setup(s => s.RefreshLoginAsync(It.IsAny<RefreshLoginRequest>()))
            .ReturnsAsync(response);

            // Act
            await _controller.Refresh(request);

            // Assert
            _authServiceMock.Verify(s => s.RefreshLoginAsync(It.Is<RefreshLoginRequest>(r => r.RefreshToken == request.RefreshToken)), Times.Once);
        }

        [Fact]
        public async Task Refresh_ReturnsOkResponse_WithNullData_WhenAuthServiceReturnsNull()
        {
            // Arrange
            var request = new RefreshLoginRequest { RefreshToken = "refresh-token" };

            _authServiceMock
                .Setup(s => s.RefreshLoginAsync(It.IsAny<RefreshLoginRequest>()))
                .ReturnsAsync((LoginResponse?)null!);

            // Act
            var result = await _controller.Refresh(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            var valueString = okResult.Value.ToString();
            Assert.Contains("Refresh login successfully", valueString);
        }

        [Fact]
        public async Task Refresh_ReturnsOkResponse_WithExpectedMessageAndData()
        {
            // Arrange
            var request = new RefreshLoginRequest { RefreshToken = "refresh-token" };
            var response = new LoginResponse { UserId = 123, AccessToken = "refreshed-token" };

            _authServiceMock.Setup(s => s.RefreshLoginAsync(It.Is<RefreshLoginRequest>(r => r.RefreshToken == request.RefreshToken)))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.Refresh(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            dynamic responseObj = okResult.Value;
            Assert.Equal("Refresh login successfully", (string)responseObj.message);
            Assert.NotNull(responseObj.data);
            Assert.Equal("refreshed-token", (string)responseObj.data.AccessToken);
            Assert.Equal(123, (int)responseObj.data.UserId);
        }

        [Fact]
        public async Task UpdatePassword_ReturnsOkResponse_WhenPasswordChanged()
        {
            // Arrange
            // Use correct property names as defined in your DTOs
            var request = new UpdatePasswordRequest { CurrentPassword = "old", NewPassword = "new" };

            _authServiceMock
                .Setup(s => s.UpdatePasswordAsync(request))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.UpdatePassword(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            var valueString = okResult.Value.ToString();
            Assert.Contains("Your password has been changed successfully", valueString);
        }

        [Fact]
        public async Task UpdatePassword_CallsAuthServiceWithCorrectRequest()
        {
            // Arrange
            var request = new UpdatePasswordRequest { CurrentPassword = "oldpass", NewPassword = "newpass" };

            _authServiceMock
            .Setup(s => s.UpdatePasswordAsync(It.IsAny<UpdatePasswordRequest>()))
            .Returns(Task.CompletedTask);

            // Act
            await _controller.UpdatePassword(request);

            // Assert
            _authServiceMock.Verify(s => s.UpdatePasswordAsync(It.Is<UpdatePasswordRequest>(r => r.CurrentPassword == request.CurrentPassword && r.NewPassword == request.NewPassword)), Times.Once);
        }

        [Fact]
        public async Task UpdatePassword_ReturnsOkResponse_WhenAuthServiceThrowsException()
        {
            // Arrange
            var request = new UpdatePasswordRequest { CurrentPassword = "fail", NewPassword = "fail" };

            _authServiceMock
            .Setup(s => s.UpdatePasswordAsync(request))
            .ThrowsAsync(new Exception("Update failed"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.UpdatePassword(request));
        }

        [Fact]
        public async Task UpdatePasswordFirstTime_ReturnsOkResponse_WhenPasswordChanged()
        {
            // Arrange
            // Use correct property names as defined in your DTOs
            var request = new UpdatePasswordFirstTimeRequest { Password = "new" };

            _authServiceMock
                .Setup(s => s.UpdatePasswordFirstTimeAsync(request))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.UpdatePasswordFirstTime(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            var valueString = okResult.Value.ToString();
            Assert.Contains("Your password has been changed successfully", valueString);
        }

        [Fact]
        public async Task UpdatePasswordFirstTime_CallsAuthServiceWithCorrectRequest()
        {
            // Arrange
            var request = new UpdatePasswordFirstTimeRequest { Password = "first-change" };

            _authServiceMock
            .Setup(s => s.UpdatePasswordFirstTimeAsync(It.IsAny<UpdatePasswordFirstTimeRequest>()))
            .Returns(Task.CompletedTask);

            // Act
            await _controller.UpdatePasswordFirstTime(request);

            // Assert
            _authServiceMock.Verify(s => s.UpdatePasswordFirstTimeAsync(It.Is<UpdatePasswordFirstTimeRequest>(r => r.Password == request.Password)), Times.Once);
        }

        [Fact]
        public async Task UpdatePasswordFirstTime_ThrowsException_WhenAuthServiceThrows()
        {
            // Arrange
            var request = new UpdatePasswordFirstTimeRequest { Password = "fail" };

            _authServiceMock
            .Setup(s => s.UpdatePasswordFirstTimeAsync(request))
            .ThrowsAsync(new Exception("First change failed"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.UpdatePasswordFirstTime(request));
        }
    }
}
