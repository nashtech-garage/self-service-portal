using API.Services;
using Domain.Common.Constants;
using Domain.Dtos.Responses;
using Domain.Entities;
using Domain.Extensions;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using StackExchange.Redis;
using MockQueryable;
using MockQueryable.Moq;

namespace Test.Services
{
    public class SampleServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IDatabase> _redisMock;
        private readonly Mock<ILogger<SampleService>> _loggerMock;
        private readonly Mock<IConnectionMultiplexer> _connectionMultiplexerMock;
        private readonly SampleService _sampleService;

        public SampleServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _connectionMultiplexerMock = new Mock<IConnectionMultiplexer>();
            _redisMock = new Mock<IDatabase>();
            _loggerMock = new Mock<ILogger<SampleService>>();

            _connectionMultiplexerMock
                .Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
                .Returns(_redisMock.Object);

            _sampleService = new SampleService(_userRepositoryMock.Object, _connectionMultiplexerMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task SampleGetAsync_ShouldReturnNull_WhenNoDataExists()
        {
            // Arrange
            var emptyUserList = new List<User>().AsQueryable().BuildMock();

            _userRepositoryMock
                .Setup(repo => repo.Queryable)
                .Returns(emptyUserList);

            // Act
            var result = await _sampleService.SampleGetAsync();

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task SampleGetAsync_ShouldReturnData_WhenUserExists()
        {
            // Arrange
            var user = new User
            {
                Id = 1,
                Username = "testuser",
                FirstName = "Test",
                LastName = "User"
            };

            var userList = new List<User> { user }.AsQueryable().BuildMock();

            _userRepositoryMock
                .Setup(repo => repo.Queryable)
                .Returns(userList);

            // Act
            var result = await _sampleService.SampleGetAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("testuser", result.Username);
        }

        [Fact]
        public async Task SyncRedisAsync_ShouldSyncAllUsernames()
        {
            // Arrange
            var users = new List<User>
            {
                new User { Id = 1, Username = "user1" },
                new User { Id = 2, Username = "user2" },
                new User { Id = 3, Username = "user3" }
            };

            var queryable = users.AsQueryable().BuildMock();

            _userRepositoryMock
                .Setup(repo => repo.Queryable)
                .Returns(queryable);

            _redisMock
                .Setup(r => r.KeyDeleteAsync(AuthConstant.UsernameList, CommandFlags.None))
                .ReturnsAsync(true);

            _redisMock
                .Setup(r => r.StringSetBitAsync(
                    AuthConstant.UsernameList,
                    It.IsAny<long>(),
                    true,
                    CommandFlags.None))
                .ReturnsAsync(true);

            // Act
            await _sampleService.SyncRedisAsync();

            // Assert - Verify the key was deleted
            _redisMock.Verify(r =>
                r.KeyDeleteAsync(AuthConstant.UsernameList, CommandFlags.None),
                Times.Once);

            // Verify StringSetBit was called for each user
            _redisMock.Verify(r =>
                r.StringSetBitAsync(
                    AuthConstant.UsernameList,
                    It.IsAny<long>(),
                    true,
                    CommandFlags.None),
                Times.Exactly(3));

            // Verify logger was called for each username
            _loggerMock.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Hashed")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Exactly(3));
        }

        [Fact]
        public async Task SyncRedisAsync_ShouldHandleEmptyUserList()
        {
            // Arrange
            var emptyList = new List<User>().AsQueryable().BuildMock();

            _userRepositoryMock
                .Setup(repo => repo.Queryable)
                .Returns(emptyList);

            _redisMock
                .Setup(r => r.KeyDeleteAsync(AuthConstant.UsernameList, CommandFlags.None))
                .ReturnsAsync(true);

            // Act
            await _sampleService.SyncRedisAsync();

            // Assert - Verify the key was deleted
            _redisMock.Verify(r =>
                r.KeyDeleteAsync(AuthConstant.UsernameList, CommandFlags.None),
                Times.Once);

            // Verify StringSetBit was not called (no users)
            _redisMock.Verify(r =>
                r.StringSetBitAsync(
                    AuthConstant.UsernameList,
                    It.IsAny<long>(),
                    true,
                    CommandFlags.None),
                Times.Never);
        }
    }
}