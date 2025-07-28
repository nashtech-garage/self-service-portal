using API.Controllers;
using API.Exceptions;
using API.Services.Abstracts;
using Domain.Common.Enum;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Microsoft.EntityFrameworkCore;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;

namespace Test.Controllers
{
    public class AssignmentControllerTest
    {
        private readonly Mock<IAssignmentService> _assignmentServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<AssignmentController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly AssignmentController _controller;

        public AssignmentControllerTest()
        {
            _assignmentServiceMock = new Mock<IAssignmentService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<AssignmentController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new AssignmentController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object,
                _assignmentServiceMock.Object
            );
        }

        [Fact]
        public async Task GetAssignmentsAdminAsync_ReturnsExpectedData_WhenCalled()
        {
            // Arrange
            var request = new GetListAssignmentAdminRequest
            {
                Page = 1,
                PageSize = 10
            };

            var data = new List<ListBasicAssignmentAdminResponse>
            {
                new ListBasicAssignmentAdminResponse
                {
                    Id = 1,
                    AssetCode = "LA000001",
                    AssetName = "Laptop",
                    AssignedTo = "Staff 1",
                    AssignedBy = "Admin 1",
                    AssignedDate = DateTime.Today,
                    State = AssignmentStateEnum.Accepted
                },
                new ListBasicAssignmentAdminResponse
                {
                    Id = 2,
                    AssetCode = "MO000001",
                    AssetName = "Monitor",
                    AssignedTo = "Staff 2",
                    AssignedBy = "Admin 1",
                    AssignedDate = DateTime.Today,
                    State = AssignmentStateEnum.WaitingForAcceptance
                }
            };

            var expectedData = new PaginationData<ListBasicAssignmentAdminResponse>(data, 10, 1, 2);

            _assignmentServiceMock
                .Setup(s => s.GetAssignmentsAdminAsync(request))
                .ReturnsAsync(expectedData);

            // Act
            var result = await _controller.GetAssignmentsAdminAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Total);
            Assert.Equal(2, result.Data.Count());
            Assert.Equal(1, result.CurrentPage);
            Assert.Equal(10, result.PageSize);
        }

        [Fact]
        public async Task GetAssignmentsAdminAsync_PassesFiltersToService_WhenCalled()
        {
            // Arrange
            var request = new GetListAssignmentAdminRequest
            {
                KeySearch = "laptop",
                State = new List<AssignmentStateEnum> { AssignmentStateEnum.Accepted },
                AssignedDate = DateTime.Today,
                SortBy = "assetName",
                Direction = "asc",
                Page = 1,
                PageSize = 10
            };

            _assignmentServiceMock
                .Setup(s => s.GetAssignmentsAdminAsync(It.IsAny<GetListAssignmentAdminRequest>()))
                .ReturnsAsync(new PaginationData<ListBasicAssignmentAdminResponse>(
                    new List<ListBasicAssignmentAdminResponse>(), 10, 1, 0));

            // Act
            await _controller.GetAssignmentsAdminAsync(request);

            // Assert
            _assignmentServiceMock.Verify(
                s => s.GetAssignmentsAdminAsync(It.Is<GetListAssignmentAdminRequest>(r =>
                    r.KeySearch == "laptop" &&
                    r.State != null &&
                    r.State.Contains(AssignmentStateEnum.Accepted) &&
                    r.AssignedDate == DateTime.Today &&
                    r.SortBy == "assetName" &&
                    r.Direction == "asc" &&
                    r.Page == 1 &&
                    r.PageSize == 10)),
                Times.Once);
        }

        [Fact]
        public async Task GetAssignmentDetailAsync_ReturnsOkResult_WithExpectedData()
        {
            // Arrange
            int assignmentId = 1;
            var expectedDetail = new DetailAssignmentAdminResponse
            {
                Id = assignmentId,
                AssignedTo = "Staff 1",
                AssignedBy = "Admin 1",
                State = AssignmentStateEnum.Accepted,
                Note = "Please handle with care"
            };

            _assignmentServiceMock
                .Setup(s => s.GetAssignmentDetailAsync(assignmentId))
                .ReturnsAsync(expectedDetail);

            // Act
            var result = await _controller.GetAssignmentDetailAsync(assignmentId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            var valueObj = okResult.Value;
            var messageProperty = valueObj?.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty?.GetValue(valueObj)?.ToString();
            Assert.Equal("Get assignment detail successfully", message);

            var dataProperty = valueObj?.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task GetAssignmentDetailAsync_ThrowsNotFoundException_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 999;
            string errorMessage = "Assignment with ID 999 not found.";

            _assignmentServiceMock
                .Setup(s => s.GetAssignmentDetailAsync(assignmentId))
                .ThrowsAsync(new NotFoundException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() =>
                _controller.GetAssignmentDetailAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task GetAssignmentDetailEditAsync_ReturnsOkResult_WithExpectedData()
        {
            // Arrange
            int assignmentId = 1;
            var expectedDetail = new DetailAssignmentAdminEditResponse
            {
                Id = assignmentId,
                UserId = 2,
                AssetId = 3,
                Note = "Please handle with care",
                State = AssignmentStateEnum.Accepted
            };

            _assignmentServiceMock
                .Setup(s => s.GetAssignmentDetailEditAsync(assignmentId))
                .ReturnsAsync(expectedDetail);

            // Act
            var result = await _controller.GetAssignmentDetailEditAsync(assignmentId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            var valueObj = okResult.Value;
            var messageProperty = valueObj?.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty?.GetValue(valueObj)?.ToString();
            Assert.Equal("Get assignment detail successfully", message);

            var dataProperty = valueObj?.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task GetAssignmentDetailEditAsync_ThrowsNotFoundException_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 999;
            string errorMessage = "Assignment with ID 999 not found.";

            _assignmentServiceMock
                .Setup(s => s.GetAssignmentDetailEditAsync(assignmentId))
                .ThrowsAsync(new NotFoundException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() =>
                _controller.GetAssignmentDetailEditAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task UpdateAssignmentAsync_ReturnsOkResult_WhenUpdateSuccessful()
        {
            // Arrange
            int assignmentId = 1;
            var request = new UpdateAssignmentRequest
            {
                AssignedDate = DateTime.Today
            };

            var expectedResponse = new EditAssignmentResponse
            {
                Id = assignmentId,
                AssetId = 2,
                AssignedTo = "Staff 1",
                AssignedBy = "Admin 1",
                Note = "Updated note",
                State = AssignmentStateEnum.Accepted
            };

            _assignmentServiceMock
                .Setup(s => s.UpdateAssignmentAsync(assignmentId, request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.UpdateAssignmentAsync(assignmentId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            var valueObj = okResult.Value;
            var messageProperty = valueObj?.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty?.GetValue(valueObj)?.ToString();
            Assert.Equal("Update assignment successfully", message);

            var dataProperty = valueObj?.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty?.GetValue(valueObj);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task UpdateAssignmentAsync_ThrowsNotFoundException_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 999;
            var request = new UpdateAssignmentRequest { AssignedDate = DateTime.Today };
            string errorMessage = "Assignment with ID 999 not found.";

            _assignmentServiceMock
                .Setup(s => s.UpdateAssignmentAsync(assignmentId, request))
                .ThrowsAsync(new NotFoundException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() =>
                _controller.UpdateAssignmentAsync(assignmentId, request));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task UpdateAssignmentAsync_ThrowsBadRequestException_WhenValidationFails()
        {
            // Arrange
            int assignmentId = 1;
            var request = new UpdateAssignmentRequest { AssignedDate = DateTime.Today };
            string errorMessage = "Cannot update assignment in current state.";

            _assignmentServiceMock
                .Setup(s => s.UpdateAssignmentAsync(assignmentId, request))
                .ThrowsAsync(new BadRequestException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
                _controller.UpdateAssignmentAsync(assignmentId, request));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task CreateAssignmentAsync_ReturnsCreatedResult_WhenCreationSucceeds()
        {
            // Arrange
            var request = new CreateAssignmentRequest();
            var expectedResponse = new CreateAssignmentResponse
            {
                Id = 1,
                AssetId = 2,
                AssetCode = "LA000001",
                AssetName = "Laptop",
                AssignedTo = "Staff 1",
                AssignedBy = "Admin 1",
                Note = "Please handle with care",
                State = AssignmentStateEnum.WaitingForAcceptance
            };

            _assignmentServiceMock
                .Setup(s => s.CreateAssignmentAsync(request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.CreateAssignmentAsync(request);

            // Assert
            var createdResult = Assert.IsType<CreatedResult>(result);
            Assert.Equal(201, createdResult.StatusCode);

            var valueObj = createdResult.Value;
            var messageProperty = valueObj?.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty?.GetValue(valueObj)?.ToString();
            Assert.Equal("Assignment created successfully", message);

            var dataProperty = valueObj?.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task CreateAssignmentAsync_ThrowsBadRequestException_WhenAssetIsAlreadyAssigned()
        {
            // Arrange
            var request = new CreateAssignmentRequest();
            string errorMessage = "Asset is already assigned to another user.";

            _assignmentServiceMock
                .Setup(s => s.CreateAssignmentAsync(request))
                .ThrowsAsync(new BadRequestException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
                _controller.CreateAssignmentAsync(request));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task CreateAssignmentAsync_ThrowsNotFoundException_WhenUserOrAssetNotFound()
        {
            // Arrange
            var request = new CreateAssignmentRequest();
            string errorMessage = "User or Asset not found.";

            _assignmentServiceMock
                .Setup(s => s.CreateAssignmentAsync(request))
                .ThrowsAsync(new NotFoundException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() =>
                _controller.CreateAssignmentAsync(request));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task GetAssignableAssetsAsync_ReturnsExpectedData_WhenCalled()
        {
            // Arrange
            var request = new GetAssignableAssetsRequest
            {
                KeySearch = "laptop",
                Page = 1,
                PageSize = 10
            };

            var data = new List<AssignableAssetResponse>
            {
                new AssignableAssetResponse
                {
                    Id = 1,
                    Code = "LA000001",
                    Name = "Laptop",
                    CategoryName = "Laptop",
                    CategoryId = 1
                },
                new AssignableAssetResponse
                {
                    Id = 2,
                    Code = "LA000002",
                    Name = "Laptop 2",
                    CategoryName = "Laptop",
                    CategoryId = 1
                }
            };

            var expectedData = new PaginationData<AssignableAssetResponse>(data, 10, 1, 2);

            _assignmentServiceMock
                .Setup(s => s.GetAssignableAssetsAsync(request))
                .ReturnsAsync(expectedData);

            // Act
            var result = await _controller.GetAssignableAssetsAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Total);
            Assert.Equal(2, result.Data.Count());
            Assert.Equal(1, result.CurrentPage);
            Assert.Equal(10, result.PageSize);
        }

        [Fact]
        public async Task GetAssignableUsersAsync_ReturnsExpectedData_WhenCalled()
        {
            // Arrange
            var request = new GetAssignableUsersRequest
            {
                KeySearch = "john",
                Page = 1,
                PageSize = 10
            };

            var data = new List<AssignableUserResponse>
            {
                new AssignableUserResponse
                {
                    Id = 1,
                    StaffCode = "SD0001",
                    FullName = "John Doe",
                    Type = UserTypeEnum.Staff
                },
                new AssignableUserResponse
                {
                    Id = 2,
                    StaffCode = "SD0002",
                    FullName = "John Smith",
                    Type = UserTypeEnum.Staff
                }
            };

            var expectedData = new PaginationData<AssignableUserResponse>(data, 10, 1, 2);

            _assignmentServiceMock
                .Setup(s => s.GetAssignableUsersAsync(request))
                .ReturnsAsync(expectedData);

            // Act
            var result = await _controller.GetAssignableUsersAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Total);
            Assert.Equal(2, result.Data.Count());
            Assert.Equal(1, result.CurrentPage);
            Assert.Equal(10, result.PageSize);
        }

        [Fact]
        public async Task GetAssignableAssetsAsync_PassesSearchParametersToService_WhenCalled()
        {
            // Arrange
            var request = new GetAssignableAssetsRequest
            {
                KeySearch = "laptop",
                Page = 2,
                PageSize = 5,
                SortBy = "name",
                Direction = "asc"
            };

            _assignmentServiceMock
                .Setup(s => s.GetAssignableAssetsAsync(It.IsAny<GetAssignableAssetsRequest>()))
                .ReturnsAsync(new PaginationData<AssignableAssetResponse>(new List<AssignableAssetResponse>(), 10, 1, 0));

            // Act
            await _controller.GetAssignableAssetsAsync(request);

            // Assert
            _assignmentServiceMock.Verify(
                s => s.GetAssignableAssetsAsync(It.Is<GetAssignableAssetsRequest>(r =>
                    r.KeySearch == "laptop" &&
                    r.Page == 2 &&
                    r.PageSize == 5 &&
                    r.SortBy == "name" &&
                    r.Direction == "asc")),
                Times.Once);
        }

        [Fact]
        public async Task GetAssignableUsersAsync_PassesSearchParametersToService_WhenCalled()
        {
            // Arrange
            var request = new GetAssignableUsersRequest
            {
                KeySearch = "john",
                Page = 2,
                PageSize = 5,
                SortBy = "fullName",
                Direction = "asc"
            };

            _assignmentServiceMock
                .Setup(s => s.GetAssignableUsersAsync(It.IsAny<GetAssignableUsersRequest>()))
                .ReturnsAsync(new PaginationData<AssignableUserResponse>(
                    new List<AssignableUserResponse>(), 5, 2, 0));

            // Act
            await _controller.GetAssignableUsersAsync(request);

            // Assert
            _assignmentServiceMock.Verify(
                s => s.GetAssignableUsersAsync(It.Is<GetAssignableUsersRequest>(r =>
                    r.KeySearch == "john" &&
                    r.Page == 2 &&
                    r.PageSize == 5 &&
                    r.SortBy == "fullName" &&
                    r.Direction == "asc")),
                Times.Once);
        }

        [Fact]
        public async Task DeleteAssignmentAsync_ReturnsNoContentResult_WhenDeletionSucceeds()
        {
            // Arrange
            int assignmentId = 1;

            _assignmentServiceMock
                .Setup(s => s.DeleteAssignmentAsync(assignmentId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DeleteAssignmentAsync(assignmentId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteAssignmentAsync_ThrowsNotFoundException_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 999;
            string errorMessage = "Assignment with ID 999 not found.";

            _assignmentServiceMock
                .Setup(s => s.DeleteAssignmentAsync(assignmentId))
                .ThrowsAsync(new NotFoundException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() =>
                _controller.DeleteAssignmentAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task DeleteAssignmentAsync_ThrowsBadRequestException_WhenAssignmentCannotBeDeleted()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Cannot delete assignment that has been accepted.";

            _assignmentServiceMock
                .Setup(s => s.DeleteAssignmentAsync(assignmentId))
                .ThrowsAsync(new BadRequestException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
                _controller.DeleteAssignmentAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task AssignmentReturningRequestAsync_ReturnsCreatedResult_WhenRequestCreated()
        {
            // Arrange
            int assignmentId = 1;
            _assignmentServiceMock
                .Setup(s => s.CreateAssignmentReturningRequestAsync(assignmentId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.AssignmentReturningRequestAsync(assignmentId);

            // Assert
            var createdResult = Assert.IsType<CreatedResult>(result);
            Assert.Equal(201, createdResult.StatusCode);
            Assert.NotNull(createdResult.Value);
            Assert.Contains("Returning request created successfully", createdResult.Value?.ToString() ?? string.Empty);
        }

        [Fact]
        public async Task AssignmentReturningRequestAsync_ThrowsNotFoundException_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 999;
            string errorMessage = "Assignment not found.";

            _assignmentServiceMock
                .Setup(s => s.CreateAssignmentReturningRequestAsync(assignmentId))
                .ThrowsAsync(new NotFoundException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() =>
                _controller.AssignmentReturningRequestAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task AssignmentReturningRequestAsync_ThrowsBadRequestException_WhenAssignmentNotInAcceptedState()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Cannot create returning request for assignment in 'WaitingForAcceptance' state. Only assignments in 'Accepted' state can have returning requests.";

            _assignmentServiceMock
                .Setup(s => s.CreateAssignmentReturningRequestAsync(assignmentId))
                .ThrowsAsync(new BadRequestException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
                _controller.AssignmentReturningRequestAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task AssignmentReturningRequestAsync_ThrowsBadRequestException_WhenReturningRequestAlreadyExists()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Returning request already exists for this assignment.";

            _assignmentServiceMock
                .Setup(s => s.CreateAssignmentReturningRequestAsync(assignmentId))
                .ThrowsAsync(new BadRequestException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
                _controller.AssignmentReturningRequestAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task AssignmentReturningRequestAsync_ThrowsDatabaseException_WhenDatabaseErrorOccurs()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Database error occurred.";

            _assignmentServiceMock
                .Setup(s => s.CreateAssignmentReturningRequestAsync(assignmentId))
                .ThrowsAsync(new DbUpdateException(errorMessage, new Exception("Inner exception")));

            // Act & Assert
            await Assert.ThrowsAsync<DbUpdateException>(() =>
                _controller.AssignmentReturningRequestAsync(assignmentId));
        }

        [Fact]
        public async Task AssignmentReturningRequestAsync_ThrowsArgumentNullException_WhenRepositoryFails()
        {
            // Arrange
            int assignmentId = 1;
            string paramName = "returningRequest";

            _assignmentServiceMock
                .Setup(s => s.CreateAssignmentReturningRequestAsync(assignmentId))
                .ThrowsAsync(new ArgumentNullException(paramName));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentNullException>(() =>
                _controller.AssignmentReturningRequestAsync(assignmentId));
            Assert.Equal(paramName, exception.ParamName);
        }
    }
}
