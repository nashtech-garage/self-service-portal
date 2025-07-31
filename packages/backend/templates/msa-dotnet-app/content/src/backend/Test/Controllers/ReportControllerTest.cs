using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers;
using API.Services.Abstracts;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace Test.Controllers
{
    public class ReportControllerTest
    {
        private readonly Mock<IReportService> _reportServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Mock<ILogger<ReportController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly ReportController _controller;

        public ReportControllerTest()
        {
            _reportServiceMock = new Mock<IReportService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _loggerMock = new Mock<ILogger<ReportController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new ReportController(
                _httpContextAccessorMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object,
                _reportServiceMock.Object
            );
        }

        [Fact]
        public async Task GetReport_ReturnsPaginationData()
        {
            // Arrange
            var request = new GetListCategoryReportRequest { Page = 1, PageSize = 10, SortBy = "name", Direction = "asc" };
            var paginationData = new PaginationData<BasicReportResponse>(
                new[] { new BasicReportResponse() }, 10, 1, 1
            );
            _reportServiceMock
                .Setup(s => s.GetReportAsync(request))
                .ReturnsAsync(paginationData);

            // Act
            var result = await _controller.GetReport(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(paginationData, result);
            _reportServiceMock.Verify(s => s.GetReportAsync(request), Times.Once);
        }

        [Fact]
        public async Task GetExport_ReturnsFileResult_WithCorrectContentTypeAndFileName()
        {
            // Arrange
            var fileBytes = new byte[] { 1, 2, 3, 4 };
            _reportServiceMock
                .Setup(s => s.GetExportAsync())
                .ReturnsAsync(fileBytes);

            // Act
            var result = await _controller.GetExport();

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileResult.ContentType);
            Assert.Equal("Report Document.xlsx", fileResult.FileDownloadName);
            Assert.Equal(fileBytes, fileResult.FileContents);
            _reportServiceMock.Verify(s => s.GetExportAsync(), Times.Once);
        }
        
        [Fact]
        public async Task GetReport_CallsServiceWithCorrectRequest()
        {
            // Arrange
            var request = new GetListCategoryReportRequest { Page = 2, PageSize = 5, SortBy = "total", Direction = "desc" };
            var expectedResult = new PaginationData<BasicReportResponse>(
            new[] { new BasicReportResponse() }, 5, 2, 10
            );
            _reportServiceMock
            .Setup(s => s.GetReportAsync(request))
            .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetReport(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(expectedResult, result);
            _reportServiceMock.Verify(s => s.GetReportAsync(request), Times.Once);
        }

        [Fact]
        public async Task GetExport_ReturnsFileResult_WithNonEmptyContent()
        {
            // Arrange
            var fileBytes = new byte[] { 10, 20, 30 };
            _reportServiceMock
            .Setup(s => s.GetExportAsync())
            .ReturnsAsync(fileBytes);

            // Act
            var result = await _controller.GetExport();

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.NotNull(fileResult.FileContents);
            Assert.Equal(fileBytes, fileResult.FileContents);
            Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileResult.ContentType);
            Assert.Equal("Report Document.xlsx", fileResult.FileDownloadName);
        }

        [Fact]
        public async Task GetExport_ReturnsEmptyFile_WhenServiceReturnsEmptyArray()
        {
            // Arrange
            var fileBytes = Array.Empty<byte>();
            _reportServiceMock
            .Setup(s => s.GetExportAsync())
            .ReturnsAsync(fileBytes);

            // Act
            var result = await _controller.GetExport();

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.Empty(fileResult.FileContents);
            Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileResult.ContentType);
            Assert.Equal("Report Document.xlsx", fileResult.FileDownloadName);
        }
    }
}