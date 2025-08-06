using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using API.Exceptions;
using API.Services;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Dtos.Common;
using Domain.Dtos.Requests;
using Domain.Entities;
using Domain.Repositories;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MockQueryable;
using Moq;
using StackExchange.Redis;

namespace Test.Services
{
    public class AuthServiceTest
    {
        private readonly Mock<ILogger<AuthService>> _loggerMock;
        private readonly Mock<IDatabase> _redisMock;
        private readonly Mock<ITokenService> _tokenServiceMock;
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IOptions<TokenSettings>> _tokenSettingsMock;
        private readonly Mock<ICurrentUserContext> _currentUserContextMock;
        private readonly AuthService _authService;

        public AuthServiceTest()
        {
            _loggerMock = new Mock<ILogger<AuthService>>();
            _redisMock = new Mock<IDatabase>();
            _tokenServiceMock = new Mock<ITokenService>();
            _userRepositoryMock = new Mock<IUserRepository>();
            _tokenSettingsMock = new Mock<IOptions<TokenSettings>>();
            _currentUserContextMock = new Mock<ICurrentUserContext>();

            var connectionMultiplexerMock = new Mock<IConnectionMultiplexer>();
            connectionMultiplexerMock.Setup(c => c.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(_redisMock.Object);

            _tokenSettingsMock.Setup(t => t.Value).Returns(new TokenSettings
            {
                AccessTokenExpirationHours = 1
            });

            _authService = new AuthService(
                _loggerMock.Object,
                connectionMultiplexerMock.Object,
                _tokenServiceMock.Object,
                _tokenSettingsMock.Object,
                _userRepositoryMock.Object,
                _currentUserContextMock.Object
            );
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnLoginResponse_WhenCredentialsAreValid()
        {
            // Arrange
            var request = new LoginRequest { Username = "testuser", Password = "ValidPassword123!" };
            var user = new User { Id = 1, Username = "testuser", PasswordHash = BCrypt.Net.BCrypt.HashPassword("ValidPassword123!") };

            _redisMock.Setup(r => r.StringGetBitAsync(AuthConstant.UsernameList, It.IsAny<long>(), CommandFlags.None))
                .ReturnsAsync(true);
            var userQueryable = new[] { user }.AsQueryable().BuildMock();
            _userRepositoryMock.Setup(r => r.Queryable).Returns(userQueryable);
            _tokenServiceMock.Setup(t => t.GenerateToken(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync("access_token");
            _tokenServiceMock.Setup(t => t.GenerateRefreshToken(It.IsAny<User>(), It.IsAny<string>()))
                .Returns("refresh_token");

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("access_token", result.AccessToken);
            Assert.Equal("refresh_token", result.RefreshToken);
        }

        [Fact]
        public async Task LoginAsync_ShouldThrowNotFoundException_WhenUserNotFoundInRedis()
        {
            // Arrange
            var request = new LoginRequest { Username = "testuser", Password = "ValidPassword123!" };

            _redisMock.Setup(r => r.StringGetBitAsync(AuthConstant.UsernameList, It.IsAny<long>(), CommandFlags.None))
                .ReturnsAsync(false);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _authService.LoginAsync(request));
        }

        [Fact]
        public async Task LogoutAsync_ShouldRevokeToken_WhenCalledWithValidInputs()
        {
            // Arrange
            var userId = "1";
            var jti = "jti";
            var expectedKey = $"{AuthConstant.ACCESS_TOKEN_BLACK_LIST}_{jti}_{userId}";
            var expectedValue = (RedisValue)1;

            _redisMock.Setup(r => r.StringSetAsync(expectedKey, expectedValue, null, When.Always, CommandFlags.None))
                .ReturnsAsync(true);

            // Act
            await _authService.LogoutAsync(userId, jti);

            // Assert
            _redisMock.Verify(r => r.StringSetAsync(expectedKey, expectedValue, null, When.Always, CommandFlags.None), Times.Once);
        }

        [Fact]
        public async Task LogoutAsync_ShouldHandleRedisFailure_WhenStringSetAsyncFails()
        {
            // Arrange
            var userId = "1";
            var jti = "jti";
            var expectedKey = $"{AuthConstant.ACCESS_TOKEN_BLACK_LIST}_{jti}_{userId}";

            _redisMock.Setup(r => r.StringSetAsync(expectedKey, It.IsAny<RedisValue>(), null, When.Always, CommandFlags.None))
                .ThrowsAsync(new RedisException("Redis operation failed"));

            // Act & Assert
            await Assert.ThrowsAsync<RedisException>(() => _authService.LogoutAsync(userId, jti));
        }

        [Fact]
        public async Task RefreshLoginAsync_ShouldReturnNewTokens_WhenRefreshTokenIsValid()
        {
            // Arrange
            var request = new RefreshLoginRequest { RefreshToken = "valid_refresh_token" };

            var user = new User { Id = 1, Username = "testuser" };

            _tokenServiceMock.Setup(t => t.ValidateToken(It.IsAny<string>()))
                .Returns(new ClaimsPrincipal(new ClaimsIdentity(new[]
                {
                    new Claim("userId", "1"),
                    new Claim(JwtRegisteredClaimNames.Jti, "jti")
                })));
            var userQueryable = new[] { user }.AsQueryable().BuildMock();

            _userRepositoryMock.Setup(r => r.Queryable).Returns(userQueryable);
            _redisMock.Setup(r => r.KeyExistsAsync(It.IsAny<RedisKey>(), CommandFlags.None))
                .ReturnsAsync(false);
            _tokenServiceMock.Setup(t => t.GenerateToken(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync("new_access_token");
            _tokenServiceMock.Setup(t => t.GenerateRefreshToken(It.IsAny<User>(), It.IsAny<string>()))
                .Returns("new_refresh_token");

            // Act
            var result = await _authService.RefreshLoginAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("new_access_token", result.AccessToken);
            Assert.Equal("new_refresh_token", result.RefreshToken);
        }

        [Fact]
        public async Task UpdatePasswordAsync_ShouldUpdatePassword_WhenCurrentPasswordIsValid()
        {
            // Arrange
            var request = new UpdatePasswordRequest { CurrentPassword = "OldPassword123!", NewPassword = "NewPassword123!" };

            var user = new User { Id = 1, PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPassword123!") };

            _currentUserContextMock.Setup(c => c.UserId).Returns(1);
            var userQueryable = new[] { user }.AsQueryable().BuildMock();

            _userRepositoryMock.Setup(r => r.Queryable).Returns(userQueryable);
            _userRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
            _userRepositoryMock.Setup(r => r.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            // Act
            await _authService.UpdatePasswordAsync(request);

            // Assert
            _userRepositoryMock.Verify(r => r.UpdateAsync(It.Is<User>(u => VerifyPasswordHash("NewPassword123!", u.PasswordHash))), Times.Once);
        }

        [Fact]
        public async Task UpdatePasswordAsync_ShouldThrowBadRequestException_WhenNewPasswordIsSameAsCurrentPassword()
        {
            // Arrange
            var request = new UpdatePasswordRequest
            {
                CurrentPassword = "OldPassword123!",
                NewPassword = "OldPassword123!"
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() => _authService.UpdatePasswordAsync(request));

            Assert.Equal("New password must be different from current password", exception.Message);
        }

        [Fact]
        public async Task UpdatePasswordAsync_ShouldThrowBadRequestException_WhenCurrentPasswordIsInvalid()
        {
            // Arrange
            var request = new UpdatePasswordRequest
            {
                CurrentPassword = "WrongPassword123!",
                NewPassword = "NewPassword123!"
            };
            var user = new User
            {
                Id = 1,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPassword123!")
            };

            _currentUserContextMock.Setup(c => c.UserId).Returns(1);
            var userQueryable = new[] { user }.AsQueryable().BuildMock();

            _userRepositoryMock.Setup(r => r.Queryable).Returns(userQueryable);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() => _authService.UpdatePasswordAsync(request));
            Assert.Equal("Wrong password", exception.Message);
        }

        private bool VerifyPasswordHash(string password, string passwordHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
    }
}