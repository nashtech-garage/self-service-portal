using API.Controllers;
using API.Exceptions;
using API.Services.Abstracts;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Test.Controllers
{
    public class SampleControllerTest
    {
        private readonly Mock<ISampleService> _sampleServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<SampleController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly SampleController _controller;

        public SampleControllerTest()
        {
            _sampleServiceMock = new Mock<ISampleService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<SampleController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new SampleController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _sampleServiceMock.Object,
                _authServiceMock.Object
            );
        }

        [Fact]
        public async Task SampleGet_ShouldReturnOkResponse_WithData()
        {
            // Arrange
            var expectedData = new SampleResponse { Id = 1, Username = "testuser" };

            _sampleServiceMock
                .Setup(s => s.SampleGetAsync())
                .ReturnsAsync(expectedData);

            // Act
            var result = await _controller.SampleGet();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            Assert.NotNull(okResult.Value);
            var valueObj = okResult.Value;

            var messageProperty = valueObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(valueObj)?.ToString();
            Assert.Equal("Get data successfully", message);

            var dataProperty = valueObj.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task SampleGet_ShouldReturnOkResponse_WhenDataIsNull()
        {
            // Arrange
            _sampleServiceMock
                .Setup(s => s.SampleGetAsync())
                .ReturnsAsync((SampleResponse?)null);

            // Act
            var result = await _controller.SampleGet();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            Assert.NotNull(okResult.Value);
            var valueObj = okResult.Value;

            var messageProperty = valueObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(valueObj)?.ToString();
            Assert.Equal("Get data successfully", message);

            var dataProperty = valueObj.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.Null(data);
        }

        [Fact]
        public async Task SampleGetWithAuth_ShouldThrowUnAuthorizedException_WhenAuthFails()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);

            // Act & Assert
            await Assert.ThrowsAsync<UnAuthorizedException>(() =>
                _controller.SampleGetWithAuth("testvalue"));
        }
        [Fact]
        public async Task SampleGet_ShouldPropagateExceptions()
        {
            // Arrange
            _sampleServiceMock
                .Setup(s => s.SampleGetAsync())
                .ThrowsAsync(new Exception("Service error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.SampleGet());
        }

        [Fact]
        public async Task SamplePost_ShouldReturnOkResponse()
        {
            // Arrange
            var request = new SampleRequest
            {
                YourFirstName = "John",
                YourLastName = "Doe"
            };

            // Act
            var result = await _controller.SamplePost(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            Assert.NotNull(okResult.Value);
            var valueObj = okResult.Value;

            var messageProperty = valueObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(valueObj)?.ToString();
            Assert.Equal("ssss", message);

            var dataProperty = valueObj.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var data = dataProperty.GetValue(valueObj);
            Assert.Equal(1, data);
        }

        [Fact]
        public async Task SyncRedis_ShouldCallServiceMethod()
        {
            // Arrange
            _sampleServiceMock
                .Setup(s => s.SyncRedisAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.SyncRedis();

            // Assert
            var actionResult = Assert.IsType<ActionResult<string>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(200, okResult.StatusCode);

            Assert.NotNull(okResult.Value);
            var valueObj = okResult.Value;

            var messageProperty = valueObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(valueObj)?.ToString();
            Assert.Equal("Sync data successfully", message);

            _sampleServiceMock.Verify(s => s.SyncRedisAsync(), Times.Once);
        }

        [Fact]
        public async Task SyncRedis_ShouldPropagateExceptions()
        {
            // Arrange
            _sampleServiceMock
                .Setup(s => s.SyncRedisAsync())
                .ThrowsAsync(new Exception("Redis sync error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.SyncRedis());
        }
    }
}