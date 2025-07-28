using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.Controllers;
using API.Exceptions;
using API.Services.Abstracts;
using Domain.Common.Enum;
using Domain.Dtos;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using System.Net;

namespace Test.Controllers
{
    public class UserControllerTest
    {
        private readonly Mock<IUserService> _userServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<UserController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly UserController _controller;

        public UserControllerTest()
        {
            _userServiceMock = new Mock<IUserService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<UserController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new UserController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object,
                _userServiceMock.Object
            );
        }

        [Fact]
        public async Task CheckUserHasValidAssignment_ReturnsTrue_WhenUserHasAssignment()
        {
            // Arrange
            int userId = 1;
            _userServiceMock
                .Setup(s => s.CheckUserHasValidAssignmentAsync(userId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.CheckUserHasValidAssignment(userId);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task CheckUserHasValidAssignment_ReturnsFalse_WhenUserHasNoAssignment()
        {
            // Arrange
            int userId = 2;
            _userServiceMock
                .Setup(s => s.CheckUserHasValidAssignmentAsync(userId))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.CheckUserHasValidAssignment(userId);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task DisableUser_ReturnsNoContent_WhenSuccess()
        {
            // Arrange
            int userId = 1;
            _userServiceMock
                .Setup(s => s.DisableUserAsync(userId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DisableUser(userId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DisableUser_ThrowsNotFoundException_WhenUserDoesNotExist()
        {
            // Arrange
            int userId = 99;
            _userServiceMock
                .Setup(s => s.DisableUserAsync(userId))
                .ThrowsAsync(new NotFoundException("Not found user"));

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _controller.DisableUser(userId));
        }

        [Fact]
        public async Task GetUserList_ReturnsCorrectPaginationData()
        {
            // Arrange
            var request = new GetListUserRequest
            {
                Page = 1,
                PageSize = 10,
                KeySearch = "test"
            };

            var expectedResponse = new PaginationData<ListBasicUserResponse>(
                new List<ListBasicUserResponse>
                {
                    new ListBasicUserResponse { Id = 1, FullName = "John Doe" },
                    new ListBasicUserResponse { Id = 2, FullName = "Jane Smith" }
                },
                pageSize: 10,
                currentPage: 1,
                total: 2);

            _userServiceMock
                .Setup(s => s.GetAllUserAsync(request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetUserList(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Total);
            Assert.Equal(1, result.CurrentPage);
            Assert.Equal(10, result.PageSize);
            Assert.Equal(2, result.Data.Count());
            Assert.Equal("John Doe", result.Data.First().FullName);
            Assert.Equal("Jane Smith", result.Data.Last().FullName);
        }

        [Fact]
        public async Task GetUserList_WithEmptyResult_ReturnsEmptyPaginationData()
        {
            // Arrange
            var request = new GetListUserRequest
            {
                Page = 1,
                PageSize = 10,
                KeySearch = "nonexistent"
            };

            var expectedResponse = new PaginationData<ListBasicUserResponse>(
                new List<ListBasicUserResponse>(),
                pageSize: 10,
                currentPage: 1,
                total: 0);

            _userServiceMock
                .Setup(s => s.GetAllUserAsync(request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetUserList(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0, result.Total);
            Assert.Equal(1, result.CurrentPage);
            Assert.Equal(10, result.PageSize);
            Assert.Empty(result.Data);
        }

        [Fact]
        public async Task GetUserById_UserExists_ReturnsOkResultWithUserData()
        {
            // Arrange
            int userId = 1;
            var expectedUser = new DetailUserResponse
            {
                Id = userId,
                FirstName = "John",
                LastName = "Doe",
                FullName = "John Doe",
                StaffCode = "SD0001",
                Username = "johnd",
                DateOfBirth = new DateTime(1990, 1, 1),
                Gender = 1,
                JoinedDate = new DateTime(2020, 1, 2),
                UserType = UserTypeEnum.Staff,
                LocationId = 1
            };

            _userServiceMock
                .Setup(s => s.GetUserByIdAsync(userId))
                .ReturnsAsync(expectedUser);

            // Act
            var result = await _controller.GetUserById(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            // Verify the response structure
            var responseObj = okResult.Value as object;
            Assert.NotNull(responseObj);

            // Use reflection to safely get properties
            var responseType = responseObj.GetType();
            var messageProperty = responseType.GetProperty("message");
            var dataProperty = responseType.GetProperty("data");
            var statusProperty = responseType.GetProperty("status");

            Assert.NotNull(messageProperty);
            Assert.NotNull(dataProperty);
            Assert.NotNull(statusProperty);

            Assert.Equal("Get data successfully", messageProperty.GetValue(responseObj));
            Assert.Equal(HttpStatusCode.OK.ToString(), statusProperty.GetValue(responseObj)!.ToString());

            var userData = dataProperty.GetValue(responseObj);
            Assert.NotNull(userData);
            Assert.IsType<DetailUserResponse>(userData);

            var userResponse = (DetailUserResponse)userData;
            Assert.Equal(expectedUser.Id, userResponse.Id);
            Assert.Equal(expectedUser.FullName, userResponse.FullName);
            Assert.Equal(expectedUser.Username, userResponse.Username);
        }

        [Fact]
        public async Task GetUserById_UserNotFound_ThrowsNotFoundException()
        {
            // Arrange
            int userId = 999;
            _userServiceMock
                .Setup(s => s.GetUserByIdAsync(userId))
                .ThrowsAsync(new NotFoundException("User not found"));

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _controller.GetUserById(userId));
        }

        [Fact]
        public async Task CreateUser_ValidRequest_ReturnsCreatedResponse()
        {
            // Arrange
            var request = new CreateUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = new DateTime(1990, 1, 1),
                JoinedDate = new DateTime(2020, 1, 2),
                Gender = 1,
                UserType = UserTypeEnum.Staff
            };

            var expectedResponse = new CreateUserResponse
            {
                Id = 1,
                StaffCode = "SD0001",
                FullName = "John Doe",
                Username = "johnd",
                JoinedDate = new DateTime(2020, 1, 2),
                UserType = UserTypeEnum.Staff,
                RawPassword = "johnd@01011990"
            };

            _userServiceMock
                .Setup(s => s.CreateUserAsync(request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.CreateUser(request);

            // Assert
            var createdResult = Assert.IsType<CreatedResult>(result);
            Assert.Equal(201, createdResult.StatusCode);

            // Verify the response structure
            var responseObj = createdResult.Value as object;
            Assert.NotNull(responseObj);

            // Use reflection to safely get properties
            var responseType = responseObj.GetType();
            var messageProperty = responseType.GetProperty("message");
            var dataProperty = responseType.GetProperty("data");
            var statusProperty = responseType.GetProperty("status");

            Assert.NotNull(messageProperty);
            Assert.NotNull(dataProperty);
            Assert.NotNull(statusProperty);

            Assert.Equal("User created successfully", messageProperty.GetValue(responseObj));
            Assert.Equal(HttpStatusCode.Created.ToString(), statusProperty.GetValue(responseObj)!.ToString());

            var userData = dataProperty.GetValue(responseObj);
            Assert.NotNull(userData);
            Assert.IsType<CreateUserResponse>(userData);

            var userResponse = (CreateUserResponse)userData;
            Assert.Equal(expectedResponse.Id, userResponse.Id);
            Assert.Equal(expectedResponse.FullName, userResponse.FullName);
            Assert.Equal(expectedResponse.Username, userResponse.Username);
            Assert.Equal(expectedResponse.StaffCode, userResponse.StaffCode);
            Assert.Equal(expectedResponse.RawPassword, userResponse.RawPassword);
        }

        [Fact]
        public async Task CreateUser_ServiceReturnsNull_ThrowsBadRequestException()
        {
            // Arrange
            var request = new CreateUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = new DateTime(1990, 1, 1),
                JoinedDate = new DateTime(2020, 1, 2),
                Gender = 1,
                UserType = UserTypeEnum.Staff
            };

            _userServiceMock
                .Setup(s => s.CreateUserAsync(request))
                .ReturnsAsync((CreateUserResponse?)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(
                () => _controller.CreateUser(request));

            Assert.Equal("User creation failed", exception.Message);
        }

        [Fact]
        public async Task UpdateUser_ValidRequest_ReturnsOkResultWithUpdatedUser()
        {
            // Arrange
            int userId = 1;
            var request = new UpdateUserRequest
            {
                DateOfBirth = new DateTime(1992, 5, 15),
                Gender = 0,
                JoinedDate = new DateTime(2021, 3, 10),
                UserType = UserTypeEnum.Staff
            };

            var expectedResponse = new DetailUserResponse
            {
                Id = userId,
                FirstName = "John",
                LastName = "Doe",
                FullName = "John Doe",
                StaffCode = "SD0001",
                Username = "johnd",
                DateOfBirth = new DateTime(1992, 5, 15),
                Gender = 0,
                JoinedDate = new DateTime(2021, 3, 10),
                UserType = UserTypeEnum.Staff,
                LocationId = 1
            };

            _userServiceMock
                .Setup(s => s.UpdateUserAsync(userId, request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.UpdateUser(userId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            // Verify the response structure
            var responseObj = okResult.Value;
            Assert.NotNull(responseObj);

            // Use reflection to safely get properties
            var responseType = responseObj.GetType();
            var messageProperty = responseType.GetProperty("message");
            var dataProperty = responseType.GetProperty("data");
            var statusProperty = responseType.GetProperty("status");

            Assert.NotNull(messageProperty);
            Assert.NotNull(dataProperty);
            Assert.NotNull(statusProperty);

            Assert.Equal("User updated successfully", messageProperty.GetValue(responseObj));
            Assert.Equal(HttpStatusCode.OK.ToString(), statusProperty.GetValue(responseObj)!.ToString());

            var userData = dataProperty.GetValue(responseObj);
            Assert.NotNull(userData);
            Assert.IsType<DetailUserResponse>(userData);

            var userResponse = (DetailUserResponse)userData;
            Assert.Equal(expectedResponse.Id, userResponse.Id);
            Assert.Equal(expectedResponse.DateOfBirth, userResponse.DateOfBirth);
            Assert.Equal(expectedResponse.Gender, userResponse.Gender);
            Assert.Equal(expectedResponse.JoinedDate, userResponse.JoinedDate);
            Assert.Equal(expectedResponse.UserType, userResponse.UserType);
        }

        [Fact]
        public async Task UpdateUser_UserNotFound_ThrowsNotFoundException()
        {
            // Arrange
            int userId = 999;
            var request = new UpdateUserRequest
            {
                DateOfBirth = new DateTime(1992, 5, 15),
                Gender = 0,
                JoinedDate = new DateTime(2021, 3, 10),
                UserType = UserTypeEnum.Staff
            };

            _userServiceMock
                .Setup(s => s.UpdateUserAsync(userId, request))
                .ThrowsAsync(new NotFoundException("User not found"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(
                () => _controller.UpdateUser(userId, request));

            Assert.Equal("User not found", exception.Message);
        }

        [Fact]
        public void Constructor_NullUserService_ThrowsArgumentNullException()
        {
            // Arrange
            var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            var loggerMock = new Mock<ILogger<UserController>>();
            var authServiceMock = new Mock<IAuthService>();

            // Act & Assert
            var exception = Assert.Throws<ArgumentNullException>(() => new UserController(
                httpContextAccessorMock.Object,
                loggerMock.Object,
                authServiceMock.Object,
                null));

            Assert.Equal("userService", exception.ParamName);
        }
    }
}