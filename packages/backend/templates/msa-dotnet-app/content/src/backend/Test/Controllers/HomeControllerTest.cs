using System.Collections.Generic;
using System.Threading.Tasks;
using API.Controllers;
using API.Exceptions;
using API.Services.Abstracts;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Test.Controllers
{
    public class HomeControllerTest
    {
        private readonly Mock<IHomeService> _homeServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<HomeController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly HomeController _controller;

        public HomeControllerTest()
        {
            _homeServiceMock = new Mock<IHomeService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<HomeController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new HomeController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object,
                _homeServiceMock.Object
            );
        }

        // Endpoint /api/home/my-assignment
        [Fact]
        public async Task GetMyAssignment_ReturnsAssignments_WhenDataExists()
        {
            // Arrange
            var request = new GetListHomeAssignmentRequest { Page = 1, PageSize = 10 };
            var assignments = new List<ListBasicHomeAssignmentResponse>
            {
                new ListBasicHomeAssignmentResponse { Id = 1, AssetCode = "A1" },
                new ListBasicHomeAssignmentResponse { Id = 2, AssetCode = "A2" }
            };
            var pagination = new PaginationData<ListBasicHomeAssignmentResponse>(assignments, 10, 1, 2);

            _homeServiceMock
                .Setup(s => s.GetMyAssignmentsAsync(request))
                .ReturnsAsync(pagination);

            // Act
            var result = await _controller.GetMyAssignment(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Data.Count());
            Assert.Equal(1, result.CurrentPage);
            Assert.Equal(10, result.PageSize);
        }

        [Fact]
        public async Task GetMyAssignment_ReturnsEmpty_WhenNoAssignments()
        {
            // Arrange
            var request = new GetListHomeAssignmentRequest { Page = 1, PageSize = 10 };
            var pagination = new PaginationData<ListBasicHomeAssignmentResponse>(new List<ListBasicHomeAssignmentResponse>(), 10, 1, 0);

            _homeServiceMock
                .Setup(s => s.GetMyAssignmentsAsync(request))
                .ReturnsAsync(pagination);

            // Act
            var result = await _controller.GetMyAssignment(request);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result.Data);
            Assert.Equal(0, result.Total);
        }

        [Fact]
        public async Task GetMyAssignment_HandlesNullResult()
        {
            // Arrange
            var request = new GetListHomeAssignmentRequest { Page = 1, PageSize = 10 };

            _homeServiceMock
                .Setup(s => s.GetMyAssignmentsAsync(request))
                .ReturnsAsync((PaginationData<ListBasicHomeAssignmentResponse>?)null);

            // Act
            var result = await _controller.GetMyAssignment(request);

            // Assert
            Assert.Null(result);
        }

        // Endpoint /api/home/my-assignment/{assignmentId}
        [Fact]
        public async Task GetAssignmentAsync_ReturnsOkResult_WhenAssignmentExists()
        {
            // Arrange
            int assignmentId = 1;
            var assignment = new DetailHomeAssignmentResponse { Id = assignmentId, AssetCode = "A1" };

            _homeServiceMock
                .Setup(s => s.GetMyAssignmentDetailAsync(assignmentId))
                .ReturnsAsync(assignment);

            // Act
            var result = await _controller.GetAssignmentAsync(assignmentId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("Get data successfully", okResult.Value.ToString());
            Assert.Contains(assignment.ToString(), okResult.Value.ToString());
        }

        [Fact]
        public async Task GetAssignmentAsync_ThrowsNotFoundException_WhenAssignmentDoesNotExist()
        {
            // Arrange
            int assignmentId = 1;

            _homeServiceMock
                .Setup(s => s.GetMyAssignmentDetailAsync(assignmentId))
                .ThrowsAsync(new KeyNotFoundException("Assignment not found"));

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _controller.GetAssignmentAsync(assignmentId));
        }

        [Fact]
        public async Task AcceptAssignmentAsync_ReturnsOkResult_WhenAccepted()
        {
            // Arrange
            int assignmentId = 1;

            _homeServiceMock
                .Setup(s => s.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Accepted))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.AcceptAssignmentAsync(assignmentId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("Assignment accepted successfully", okResult.Value.ToString());
        }

        [Fact]
        public async Task AcceptAssignmentAsync_ThrowsBadRequestException_WhenAssignmentNotInWaitingState()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Cannot update assignment in 'Accepted' state. Only assignments in 'Waiting for Acceptance' state can be updated.";

            _homeServiceMock
                .Setup(s => s.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Accepted))
                .ThrowsAsync(new BadRequestException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
                _controller.AcceptAssignmentAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task DeclineAssignmentAsync_ThrowsBadRequestException_WhenAssignmentNotInWaitingState()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Cannot update assignment in 'Accepted' state. Only assignments in 'Waiting for Acceptance' state can be updated.";

            _homeServiceMock
                .Setup(s => s.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Declined))
                .ThrowsAsync(new BadRequestException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
                _controller.DeclineAssignmentAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task AcceptAssignmentAsync_ThrowsNotFoundException_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 999;
            string errorMessage = "Assignment not found";

            _homeServiceMock
                .Setup(s => s.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Accepted))
                .ThrowsAsync(new NotFoundException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() =>
                _controller.AcceptAssignmentAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task DeclineAssignmentAsync_ThrowsNotFoundException_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 999;
            string errorMessage = "Assignment not found";

            _homeServiceMock
                .Setup(s => s.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Declined))
                .ThrowsAsync(new NotFoundException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() =>
                _controller.DeclineAssignmentAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task AcceptAssignmentAsync_ThrowsUnauthorizedAccessException_WhenUserNotAssignee()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "You are not the assignee of this assignment";

            _homeServiceMock
                .Setup(s => s.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Accepted))
                .ThrowsAsync(new UnauthorizedAccessException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _controller.AcceptAssignmentAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task DeclineAssignmentAsync_ThrowsUnauthorizedAccessException_WhenUserNotAssignee()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "You are not the assignee of this assignment";

            _homeServiceMock
                .Setup(s => s.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Declined))
                .ThrowsAsync(new UnauthorizedAccessException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _controller.DeclineAssignmentAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task DeclineAssignmentAsync_ReturnsOkResult_WhenDeclined()
        {
            // Arrange
            int assignmentId = 1;

            _homeServiceMock
                .Setup(s => s.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Declined))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DeclineAssignmentAsync(assignmentId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("Assignment declined successfully", okResult.Value.ToString());
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ReturnsCreatedResult_WhenRequestCreated()
        {
            // Arrange
            int assignmentId = 1;

            _homeServiceMock
                .Setup(s => s.CreateReturningRequestAsync(assignmentId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.CreateReturningRequestAsync(assignmentId);

            // Assert
            var createdResult = Assert.IsType<CreatedResult>(result);
            Assert.Equal(201, createdResult.StatusCode);
            Assert.Contains("Returning request created successfully", createdResult.Value.ToString());
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsNotFoundException_WhenAssignmentDoesNotExist()
        {
            // Arrange
            int assignmentId = 1;

            _homeServiceMock
                .Setup(s => s.CreateReturningRequestAsync(assignmentId))
                .ThrowsAsync(new KeyNotFoundException("Assignment not found"));

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _controller.CreateReturningRequestAsync(assignmentId));
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsBadRequestException_WhenInvalidState()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Cannot create returning request for assignment in this state";

            _homeServiceMock
                .Setup(s => s.CreateReturningRequestAsync(assignmentId))
                .ThrowsAsync(new InvalidOperationException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _controller.CreateReturningRequestAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsBadRequestException_WhenAssignmentNotInAcceptedState()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Cannot create returning request for assignment in 'WaitingForAcceptance' state. Only assignments in 'Accepted' state can have returning requests.";

            _homeServiceMock
                .Setup(s => s.CreateReturningRequestAsync(assignmentId))
                .ThrowsAsync(new BadRequestException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
                _controller.CreateReturningRequestAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsBadRequestException_WhenUserNotAssignee()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "You are not the assignee of this assignment.";

            _homeServiceMock
                .Setup(s => s.CreateReturningRequestAsync(assignmentId))
                .ThrowsAsync(new BadRequestException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
                _controller.CreateReturningRequestAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsBadRequestException_WhenReturningRequestAlreadyExists()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Returning request already exists for this assignment.";

            _homeServiceMock
                .Setup(s => s.CreateReturningRequestAsync(assignmentId))
                .ThrowsAsync(new BadRequestException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
                _controller.CreateReturningRequestAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsNotFoundException_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 999;
            string errorMessage = "Assignment not found.";

            _homeServiceMock
                .Setup(s => s.CreateReturningRequestAsync(assignmentId))
                .ThrowsAsync(new NotFoundException(errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() =>
                _controller.CreateReturningRequestAsync(assignmentId));
            Assert.Equal(errorMessage, exception.Message);
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsDatabaseException_WhenDatabaseErrorOccurs()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Database error occurred while creating returning request.";

            _homeServiceMock
                .Setup(s => s.CreateReturningRequestAsync(assignmentId))
                .ThrowsAsync(new DbUpdateException(errorMessage, new Exception("Inner exception")));

            // Act & Assert
            await Assert.ThrowsAsync<DbUpdateException>(() =>
                _controller.CreateReturningRequestAsync(assignmentId));
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsArgumentNullException_WhenRepositoryFails()
        {
            // Arrange
            int assignmentId = 1;
            string errorMessage = "Value cannot be null.";

            _homeServiceMock
                .Setup(s => s.CreateReturningRequestAsync(assignmentId))
                .ThrowsAsync(new ArgumentNullException("returningRequest", errorMessage));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentNullException>(() =>
                _controller.CreateReturningRequestAsync(assignmentId));
            Assert.Equal("returningRequest", exception.ParamName);
        }

    }
}
