using API.Controllers;
using API.Services.Abstracts;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace Test.Controllers
{
    public class MetaDataControllerTest
    {
        private readonly Mock<ICategoryService> _categoryServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<MetaDataController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly MetaDataController _controller;

        public MetaDataControllerTest()
        {
            _categoryServiceMock = new Mock<ICategoryService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<MetaDataController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new MetaDataController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object,
                _categoryServiceMock.Object
            );
        }

        [Fact]
        public async Task GetCategories_ShouldReturnOkResult_WithCategoryOptions()
        {
            // Arrange
            var expectedOptions = new List<OptionResponse>
            {
                new OptionResponse { Value = 1, Name = "Laptop" },
                new OptionResponse { Value = 2, Name = "Monitor" }
            };

            _categoryServiceMock
                .Setup(s => s.GetCategoriesAsync())
                .ReturnsAsync(expectedOptions);

            // Act
            var result = await _controller.GetCategories();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            Assert.NotNull(okResult.Value);
            var valueObj = okResult.Value;

            var messageProperty = valueObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(valueObj)?.ToString();
            Assert.Equal("Get categories successfully", message);

            var dataProperty = valueObj.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task GetCategories_ShouldReturnEmptyList_WhenNoCategoriesExist()
        {
            // Arrange
            var emptyList = new List<OptionResponse>();

            _categoryServiceMock
                .Setup(s => s.GetCategoriesAsync())
                .ReturnsAsync(emptyList);

            // Act
            var result = await _controller.GetCategories();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            Assert.NotNull(okResult.Value);
            var valueObj = okResult.Value;

            var dataProperty = valueObj.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task GetCategories_ShouldCallCategoryService()
        {
            // Arrange
            _categoryServiceMock
                .Setup(s => s.GetCategoriesAsync())
                .ReturnsAsync(new List<OptionResponse>());

            // Act
            await _controller.GetCategories();

            // Assert
            _categoryServiceMock.Verify(s => s.GetCategoriesAsync(), Times.Once);
        }

        [Fact]
        public async Task GetCategories_ShouldPropagateExceptions()
        {
            // Arrange
            _categoryServiceMock
                .Setup(s => s.GetCategoriesAsync())
                .ThrowsAsync(new Exception("Service error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.GetCategories());
        }
    }
}