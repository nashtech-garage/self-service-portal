using API.Controllers;
using API.Services.Abstracts;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace Test.Controllers
{
    public class AssetControllerTest
    {
        private readonly Mock<IAssetService> _assetServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<AssetController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly AssetController _controller;

        public AssetControllerTest()
        {
            _assetServiceMock = new Mock<IAssetService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<AssetController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new AssetController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object,
                _assetServiceMock.Object
            );
        }

        [Fact]
        public async Task GetAssetsAsync_ShouldReturnPaginatedData_WhenServiceReturnsData()
        {
            // Arrange
            var request = new GetListAssetRequest();
            var expectedData = new PaginationData<ListBasicAssetResponse>(
                new List<ListBasicAssetResponse>
                {
                    new ListBasicAssetResponse { Id = 1, Name = "Laptop", Code = "LA000001" },
                    new ListBasicAssetResponse { Id = 2, Name = "Monitor", Code = "MO000001" }
                },
                10, 1, 2);

            _assetServiceMock
                .Setup(s => s.GetAssetsAsync(request))
                .ReturnsAsync(expectedData);

            // Act
            var result = await _controller.GetAssetsAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Total);
            Assert.Equal(2, result.Data.Count());
            Assert.Equal(1, result.CurrentPage);
            Assert.Equal(10, result.PageSize);
        }

        [Fact]
        public async Task GetAssetDetailsAsync_ShouldReturnOkResponse_WithAssetDetails()
        {
            // Arrange
            int assetId = 1;
            var expectedDetails = new GetAssetDetailsResponse
            {
                Id = assetId,
                Code = "LA000001",
                Name = "Laptop",
                CategoryId = 1,
                CategoryName = "Laptop",
                Specification = "Core i5, 8GB RAM",
                State = (int)AssetStateEnum.Available
            };

            _assetServiceMock
                .Setup(s => s.GetAssetDetailsAsync(assetId))
                .ReturnsAsync(expectedDetails);

            // Act
            var result = await _controller.GetAssetDetailsAsync(assetId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<GetAssetDetailsResponse>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(200, okResult.StatusCode);

            Assert.NotNull(okResult.Value);
            var valueObj = okResult.Value;

            var messageProperty = valueObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(valueObj)?.ToString();
            Assert.Equal("Get asset details successfully", message);

            var dataProperty = valueObj.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task CreateAsset_ShouldReturnCreatedResponse_WhenAssetCreated()
        {
            // Arrange
            var request = new CreateAssetRequest
            {
                Name = "New Laptop",
                CategoryId = 1,
                Specification = "Core i7, 16GB RAM",
                InstalledDate = DateTime.Now,
                State = AssetStateEnum.Available
            };

            var expectedResponse = new CreateEditAssetResponse
            {
                Id = 1,
                Code = "LA000001",
                Name = "New Laptop",
                CategoryName = "Laptop",
                State = AssetStateEnum.Available
            };

            _assetServiceMock
                .Setup(s => s.CreateAssetAsync(request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.CreateAsset(request);

            // Assert
            var createdResult = Assert.IsType<CreatedResult>(result);
            Assert.Equal(201, createdResult.StatusCode);

            Assert.NotNull(createdResult.Value);
            var valueObj = createdResult.Value;

            var messageProperty = valueObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(valueObj)?.ToString();
            Assert.Equal("Create new asset successfully", message);

            var dataProperty = valueObj.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task UpdateAsset_ShouldReturnOkResponse_WhenAssetUpdated()
        {
            // Arrange
            int assetId = 1;
            var request = new UpdateAssetRequest
            {
                Name = "Updated Laptop",
                Specification = "Core i7, 32GB RAM",
                InstalledDate = DateTime.Now,
                State = AssetStateEnum.Available
            };

            var expectedResponse = new CreateEditAssetResponse
            {
                Id = assetId,
                Code = "LA000001",
                Name = "New Laptop",
                CategoryName = "Laptop",
                State = AssetStateEnum.Available
            };

            _assetServiceMock
                .Setup(s => s.UpdateAssetAsync(assetId, request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.UpdateAsset(assetId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            Assert.NotNull(okResult.Value);
            var valueObj = okResult.Value;

            var messageProperty = valueObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(valueObj)?.ToString();
            Assert.Equal("Update asset successfully", message);

            var dataProperty = valueObj.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task DeleteAsset_ShouldReturnNoContentResponse_WhenAssetDeleted()
        {
            // Arrange
            int assetId = 1;

            _assetServiceMock
                .Setup(s => s.DeleteAssetAsync(assetId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DeleteAsset(assetId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task GetAssetsAsync_ShouldPassRequestParameters_ToService()
        {
            // Arrange
            var request = new GetListAssetRequest
            {
                KeySearch = "laptop",
                CategoryIds = new List<int> { 1, 2 },
                States = new List<int> { (int)AssetStateEnum.Available },
                Page = 2,
                PageSize = 20,
                SortBy = "name",
                Direction = "desc"
            };

            _assetServiceMock
                .Setup(s => s.GetAssetsAsync(It.IsAny<GetListAssetRequest>()))
                .ReturnsAsync(new PaginationData<ListBasicAssetResponse>(
                    new List<ListBasicAssetResponse>(), 20, 2, 0));

            // Act
            await _controller.GetAssetsAsync(request);

            // Assert
            _assetServiceMock.Verify(
                s => s.GetAssetsAsync(It.Is<GetListAssetRequest>(r =>
                    r.KeySearch == "laptop" &&
                    r.CategoryIds != null &&
                    r.CategoryIds.Contains(1) &&
                    r.CategoryIds.Contains(2) &&
                    r.States != null &&
                    r.States.Contains((int)AssetStateEnum.Available) &&
                    r.Page == 2 &&
                    r.PageSize == 20 &&
                    r.SortBy == "name" &&
                    r.Direction == "desc")),
                Times.Once);
        }

        [Fact]
        public async Task GetAssetDetailsAsync_ShouldPropagateExceptions()
        {
            // Arrange
            int assetId = 999; // Non-existent asset ID

            _assetServiceMock
                .Setup(s => s.GetAssetDetailsAsync(assetId))
                .ThrowsAsync(new Exception("Asset not found"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.GetAssetDetailsAsync(assetId));
        }

        [Fact]
        public async Task CreateAsset_ShouldCallServiceWithCorrectRequest()
        {
            // Arrange
            var request = new CreateAssetRequest
            {
                Name = "Test Asset",
                CategoryId = 3,
                Specification = "Test Specification",
                InstalledDate = new DateTime(2023, 1, 1),
                State = AssetStateEnum.NotAvailable
            };

            _assetServiceMock
                .Setup(s => s.CreateAssetAsync(It.IsAny<CreateAssetRequest>()))
                .ReturnsAsync(new CreateEditAssetResponse());

            // Act
            await _controller.CreateAsset(request);

            // Assert
            _assetServiceMock.Verify(
                s => s.CreateAssetAsync(It.Is<CreateAssetRequest>(r =>
                    r.Name == "Test Asset" &&
                    r.CategoryId == 3 &&
                    r.Specification == "Test Specification" &&
                    r.InstalledDate == new DateTime(2023, 1, 1) &&
                    r.State == AssetStateEnum.NotAvailable)),
                Times.Once);
        }

        [Fact]
        public async Task UpdateAsset_ShouldCallServiceWithCorrectIdAndRequest()
        {
            // Arrange
            int assetId = 5;
            var request = new UpdateAssetRequest
            {
                Name = "Updated Asset",
                Specification = "Updated Specification",
                InstalledDate = new DateTime(2023, 2, 2),
                State = AssetStateEnum.Available
            };

            _assetServiceMock
                .Setup(s => s.UpdateAssetAsync(It.IsAny<int>(), It.IsAny<UpdateAssetRequest>()))
                .ReturnsAsync(new CreateEditAssetResponse());

            // Act
            await _controller.UpdateAsset(assetId, request);

            // Assert
            _assetServiceMock.Verify(
                s => s.UpdateAssetAsync(
                    assetId,
                    It.Is<UpdateAssetRequest>(r =>
                        r.Name == "Updated Asset" &&
                        r.Specification == "Updated Specification" &&
                        r.InstalledDate == new DateTime(2023, 2, 2) &&
                        r.State == AssetStateEnum.Available)),
                Times.Once);
        }

        [Fact]
        public async Task DeleteAsset_ShouldCallServiceWithCorrectId()
        {
            // Arrange
            int assetId = 10;

            _assetServiceMock
                .Setup(s => s.DeleteAssetAsync(It.IsAny<int>()))
                .Returns(Task.CompletedTask);

            // Act
            await _controller.DeleteAsset(assetId);

            // Assert
            _assetServiceMock.Verify(s => s.DeleteAssetAsync(assetId), Times.Once);
        }
    }
}