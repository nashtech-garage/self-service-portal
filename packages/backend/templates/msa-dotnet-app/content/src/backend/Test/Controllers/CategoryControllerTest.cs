using System.Collections.Generic;
using System.Threading.Tasks;
using API.Controllers;
using API.Exceptions;
using API.Services.Abstracts;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Test.Controllers
{
    public class CategoryControllerTest
    {
        private readonly Mock<ICategoryService> _categoryServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<CategoryController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly CategoryController _controller;

        public CategoryControllerTest()
        {
            _categoryServiceMock = new Mock<ICategoryService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<CategoryController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new CategoryController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object,
                _categoryServiceMock.Object
            );
        }

        [Fact]
        public async Task CreateCategory_ReturnsSuccessResult_WhenCategoryCreated()
        {
            // Arrange
            var request = new CreateCategoryRequest
            {
                Category = "Desktop",
                Prefix = "DT"
            };

            _categoryServiceMock
                .Setup(s => s.CreateCategoryAsync(request))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.CreateCategory(request);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(201, objectResult.StatusCode);

            Assert.NotNull(objectResult.Value);
            var valueObj = objectResult.Value;

            var message = valueObj.GetType().GetProperty("message")?.GetValue(valueObj)?.ToString();
            Assert.Equal("Create new category successfully", message);
        }

        [Fact]
        public async Task CreateCategory_ThrowsBadRequestException_WhenCategoryNameExists()
        {
            // Arrange
            var request = new CreateCategoryRequest
            {
                Category = "Laptop", // Already exists
                Prefix = "LT"
            };

            _categoryServiceMock
                .Setup(s => s.CreateCategoryAsync(request))
                .ThrowsAsync(new BadRequestException("Category name already exists"));

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() => _controller.CreateCategory(request));
        }

        [Fact]
        public async Task CreateCategory_ThrowsBadRequestException_WhenCategoryPrefixExists()
        {
            // Arrange
            var request = new CreateCategoryRequest
            {
                Category = "New Category",
                Prefix = "LA" // Prefix already exists
            };

            _categoryServiceMock
                .Setup(s => s.CreateCategoryAsync(request))
                .ThrowsAsync(new BadRequestException("Category prefix already exists"));

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() => _controller.CreateCategory(request));
        }

        [Fact]
        public async Task CreateCategory_CallsCategoryServiceWithCorrectRequest()
        {
            // Arrange
            var request = new CreateCategoryRequest
            {
                Category = "Headphone",
                Prefix = "HP"
            };

            _categoryServiceMock
                .Setup(s => s.CreateCategoryAsync(It.IsAny<CreateCategoryRequest>()))
                .Returns(Task.CompletedTask);

            // Act
            await _controller.CreateCategory(request);

            // Assert
            _categoryServiceMock.Verify(
                s => s.CreateCategoryAsync(
                    It.Is<CreateCategoryRequest>(r =>
                        r.Category == request.Category &&
                        r.Prefix == request.Prefix)),
                Times.Once);
        }

        [Fact]
        public async Task CreateCategory_HandlesUnexpectedErrors()
        {
            // Arrange
            var request = new CreateCategoryRequest
            {
                Category = "Keyboard",
                Prefix = "KB"
            };

            _categoryServiceMock
                .Setup(s => s.CreateCategoryAsync(request))
                .ThrowsAsync(new System.Exception("Unexpected error"));

            // Act & Assert
            await Assert.ThrowsAsync<System.Exception>(() => _controller.CreateCategory(request));
        }
    }
}