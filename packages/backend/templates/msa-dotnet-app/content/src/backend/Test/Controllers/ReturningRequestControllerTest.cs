using API.Controllers;
using API.Services.Abstracts;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace Test.Controllers
{
    public class ReturningRequestControllerTest
    {
        private readonly Mock<IReturningRequestService> _returningRequestServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<ReturningRequest>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly ReturningRequestController _controller;

        public ReturningRequestControllerTest()
        {
            _returningRequestServiceMock = new Mock<IReturningRequestService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<ReturningRequest>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new ReturningRequestController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object,
                _returningRequestServiceMock.Object);
        }

        [Fact]
        public async Task GetReturningRequestsAsync_ShouldReturnData_WhenServiceReturnsData()
        {
            // Arrange
            var request = new GetListReturningRequest();
            var expectedData = new PaginationData<ListBasicReturningResponse>(
                new List<ListBasicReturningResponse>
                {
                new ListBasicReturningResponse { Id = 1, AssetName = "Laptop" },
                new ListBasicReturningResponse { Id = 2, AssetName = "Monitor" }
                },
                10, 1, 2);

            _returningRequestServiceMock
                .Setup(s => s.GetReturningRequestsAsync(request))
                .ReturnsAsync(expectedData);

            // Act
            var result = await _controller.GetReturningRequestsAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Total);
            Assert.Equal(2, result.Data.Count());
        }

        [Fact]
        public async Task CancelReturningRequestAsync_ShouldReturnOkResult_WhenSuccessful()
        {
            // Arrange
            int returningRequestId = 1;

            _returningRequestServiceMock
                .Setup(s => s.CancelReturningRequestStateAsync(returningRequestId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.CancelReturningRequestAsync(returningRequestId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result); // Changed from ObjectResult to OkObjectResult
            Assert.Equal(200, okResult.StatusCode);

            Assert.NotNull(okResult.Value);
            var valueObj = okResult.Value;

            var messageProperty = valueObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(valueObj)?.ToString();
            Assert.Equal("Returning request cancelled successfully", message);
        }

        [Fact]
        public async Task CancelReturningRequestAsync_ShouldCallService_WithCorrectId()
        {
            // Arrange
            int returningRequestId = 1;

            _returningRequestServiceMock
                .Setup(s => s.CancelReturningRequestStateAsync(It.IsAny<int>()))
                .Returns(Task.CompletedTask);

            // Act
            await _controller.CancelReturningRequestAsync(returningRequestId);

            // Assert
            _returningRequestServiceMock.Verify(
                s => s.CancelReturningRequestStateAsync(returningRequestId),
                Times.Once);
        }

        [Fact]
        public async Task CompleteReturningRequestAsync_ShouldReturnOkResult_WhenSuccessful()
        {
            // Arrange
            int returningRequestId = 1;

            _returningRequestServiceMock
                .Setup(s => s.CompleteReturningRequestAsync(returningRequestId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.CompleteReturningRequestAsync(returningRequestId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result); // Changed from ObjectResult to OkObjectResult
            Assert.Equal(200, okResult.StatusCode);

            Assert.NotNull(okResult.Value);
            var valueObj = okResult.Value;

            var messageProperty = valueObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(valueObj)?.ToString();
            Assert.Equal("Returning request completed successfully", message);
        }


        [Fact]
        public async Task CompleteReturningRequestAsync_ShouldCallService_WithCorrectId()
        {
            // Arrange
            int returningRequestId = 1;

            _returningRequestServiceMock
                .Setup(s => s.CompleteReturningRequestAsync(It.IsAny<int>()))
                .Returns(Task.CompletedTask);

            // Act
            await _controller.CompleteReturningRequestAsync(returningRequestId);

            // Assert
            _returningRequestServiceMock.Verify(
                s => s.CompleteReturningRequestAsync(returningRequestId),
                Times.Once);
        }

        [Fact]
        public async Task GetReturningRequestsAsync_ShouldPassParameters_ToService()
        {
            // Arrange
            var request = new GetListReturningRequest
            {
                KeySearch = "laptop",
                State = new List<ReturningRequestStateEnum> { ReturningRequestStateEnum.Completed },
                ReturnedDate = DateTime.Today
            };

            _returningRequestServiceMock
                .Setup(s => s.GetReturningRequestsAsync(It.IsAny<GetListReturningRequest>()))
                .ReturnsAsync(new PaginationData<ListBasicReturningResponse>(
                    new List<ListBasicReturningResponse>(), 10, 1, 0));

            // Act
            await _controller.GetReturningRequestsAsync(request);

            // Assert
            _returningRequestServiceMock.Verify(
                s => s.GetReturningRequestsAsync(It.Is<GetListReturningRequest>(r =>
                    r.KeySearch == "laptop" &&
                    r.State != null && // Add null check here
                    r.State.Contains(ReturningRequestStateEnum.Completed) &&
                    r.ReturnedDate == DateTime.Today)),
                Times.Once);
        }

        [Fact]
        public async Task CancelReturningRequestAsync_ShouldPropagateExceptions()
        {
            // Arrange
            int returningRequestId = 1;

            _returningRequestServiceMock
                .Setup(s => s.CancelReturningRequestStateAsync(returningRequestId))
                .ThrowsAsync(new KeyNotFoundException("Returning request not found"));

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _controller.CancelReturningRequestAsync(returningRequestId));
        }

        [Fact]
        public async Task CompleteReturningRequestAsync_ShouldPropagateExceptions()
        {
            // Arrange
            int returningRequestId = 1;

            _returningRequestServiceMock
                .Setup(s => s.CompleteReturningRequestAsync(returningRequestId))
                .ThrowsAsync(new KeyNotFoundException("Returning request not found"));

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _controller.CompleteReturningRequestAsync(returningRequestId));
        }

        [Fact]
        public async Task GetReturningRequestsAsync_ShouldReturnEmptyData_WhenNoItemsExist()
        {
            // Arrange
            var request = new GetListReturningRequest();
            var emptyData = new PaginationData<ListBasicReturningResponse>(
                new List<ListBasicReturningResponse>(),
                10, 1, 0);

            _returningRequestServiceMock
                .Setup(s => s.GetReturningRequestsAsync(request))
                .ReturnsAsync(emptyData);

            // Act
            var result = await _controller.GetReturningRequestsAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0, result.Total);
            Assert.Empty(result.Data);
        }

        [Fact]
        public async Task GetReturningRequestsAsync_ShouldPropagateExceptions()
        {
            // Arrange
            var request = new GetListReturningRequest();

            _returningRequestServiceMock
                .Setup(s => s.GetReturningRequestsAsync(request))
                .ThrowsAsync(new Exception("Database error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.GetReturningRequestsAsync(request));
        }

        [Fact]
        public async Task GetReturningRequestsAsync_ShouldAcceptNullParameters()
        {
            // Arrange
            var request = new GetListReturningRequest
            {
                KeySearch = null,
                State = null,
                ReturnedDate = null
            };

            var expectedData = new PaginationData<ListBasicReturningResponse>(
                new List<ListBasicReturningResponse>(), 10, 1, 0);

            _returningRequestServiceMock
                .Setup(s => s.GetReturningRequestsAsync(It.IsAny<GetListReturningRequest>()))
                .ReturnsAsync(expectedData);

            // Act
            var result = await _controller.GetReturningRequestsAsync(request);

            // Assert
            Assert.NotNull(result);
            _returningRequestServiceMock.Verify(
                s => s.GetReturningRequestsAsync(It.Is<GetListReturningRequest>(r =>
                    r.KeySearch == null &&
                    r.State == null &&
                    r.ReturnedDate == null)),
                Times.Once);
        }

        [Fact]
        public async Task CancelReturningRequestAsync_ShouldHandleInvalidId()
        {
            // Arrange
            int returningRequestId = -1; // Invalid ID

            _returningRequestServiceMock
                .Setup(s => s.CancelReturningRequestStateAsync(returningRequestId))
                .ThrowsAsync(new ArgumentException("Invalid returning request ID"));

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                _controller.CancelReturningRequestAsync(returningRequestId));
        }

        [Fact]
        public async Task CompleteReturningRequestAsync_ShouldHandleInvalidId()
        {
            // Arrange
            int returningRequestId = -1; // Invalid ID

            _returningRequestServiceMock
                .Setup(s => s.CompleteReturningRequestAsync(returningRequestId))
                .ThrowsAsync(new ArgumentException("Invalid returning request ID"));

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                _controller.CompleteReturningRequestAsync(returningRequestId));
        }
    }
}