using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Exceptions;
using API.Services;
using API.Services.Abstracts;
using Domain.Dtos.Requests;
using Domain.Entities;
using Domain.Repositories;
using MockQueryable;
using Moq;

namespace Test.Services
{
    public class ReportServiceTest
    {
        private readonly Mock<ICategoryRepository> _categoryRepoMock = new();
        private readonly Mock<IAssetRepository> _assetRepoMock = new();
        private readonly Mock<ICurrentUserContext> _currentUserContextMock = new();
        private readonly Mock<IUserRepository> _userRepoMock = new();
        private readonly Mock<IStateRepository> _stateRepoMock = new();

        private ReportService CreateService()
        {
            return new ReportService(
                _categoryRepoMock.Object,
                _assetRepoMock.Object,
                _currentUserContextMock.Object,
                _stateRepoMock.Object,
                _userRepoMock.Object
            );
        }

        private static User GetAdminUser(int id = 1, int locationId = 1) =>
            new User { Id = id, LocationId = locationId };

        [Fact]
        public async Task GetAllReport_ThrowsNotFoundException_WhenUserNotFound()
        {
            // Arrange
            var users = new List<User>().AsQueryable().BuildMock();
            _userRepoMock.Setup(r => r.Queryable).Returns(users);

            var service = CreateService();

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => service.GetAllReport());
        }

        [Fact]
        public async Task GetAllReport_ReturnsStatesAndCategories()
        {
            // Arrange
            var admin = GetAdminUser();
            _currentUserContextMock.Setup(c => c.UserId).Returns(admin.Id);

            var users = new List<User> { admin }.AsQueryable().BuildMock();
            _userRepoMock.Setup(r => r.Queryable).Returns(users);

            var states = new List<State>
            {
                new() { Id = 1, Name = "Available", TypeEntity = "Asset", Action = "View" },
                new() { Id = 2, Name = "Assigned", TypeEntity = "Asset", Action = "View" }
            }.AsQueryable().BuildMock();
            _stateRepoMock.Setup(r => r.Queryable).Returns(states.AsQueryable());

            var assets = new List<Asset>
            {
                new() { Id = 1, CategoryId = 10, State = Domain.Common.Enum.AssetStateEnum.Available, LocationId = admin.LocationId },
                new() { Id = 2, CategoryId = 10, State = Domain.Common.Enum.AssetStateEnum.NotAvailable, LocationId = admin.LocationId },
                new() { Id = 3, CategoryId = 20, State = Domain.Common.Enum.AssetStateEnum.Available, LocationId = admin.LocationId }
            }.AsQueryable().BuildMock();
            _assetRepoMock.Setup(r => r.Queryable).Returns(assets.AsQueryable());

            var categories = new List<Category>
            {
                new() { Id = 10, Name = "Laptop" },
                new() { Id = 20, Name = "Monitor" }
            }.AsQueryable().BuildMock();
            _categoryRepoMock.Setup(r => r.Queryable).Returns(categories.AsQueryable());

            var service = CreateService();

            // Act
            var (resultStates, resultCategories) = await service.GetAllReport();

            // Assert
            Assert.Equal(2, resultStates.Count);
            Assert.Equal(2, resultCategories.Count);
            Assert.Equal("Laptop", resultCategories[0].Name);
            Assert.Equal("Monitor", resultCategories[1].Name);
            Assert.Equal(2, resultCategories[0].Total);
            Assert.Equal(1, resultCategories[1].Total);
        }

        [Fact]
        public async Task GetExportAsync_ReturnsNonEmptyByteArray()
        {
            // Arrange
            var admin = GetAdminUser();
            _currentUserContextMock.Setup(c => c.UserId).Returns(admin.Id);

            var users = new List<User> { admin }.AsQueryable().BuildMock();
            _userRepoMock.Setup(r => r.Queryable).Returns(users);

            var states = new List<State>
                {
                    new() { Id = 1, Name = "Available", TypeEntity = "Asset", Action = "View" }
                }.AsQueryable().BuildMock();
                        _stateRepoMock.Setup(r => r.Queryable).Returns(states);

                        var assets = new List<Asset>
                {
                    new() { Id = 1, CategoryId = 10, State = Domain.Common.Enum.AssetStateEnum.Available, LocationId = admin.LocationId }
                }.AsQueryable().BuildMock();
                        _assetRepoMock.Setup(r => r.Queryable).Returns(assets);

                        var categories = new List<Category>
                {
                    new() { Id = 10, Name = "Laptop" }
                }.AsQueryable().BuildMock();
            _categoryRepoMock.Setup(r => r.Queryable).Returns(categories);

            var service = CreateService();

            // Act
            var bytes = await service.GetExportAsync();

            // Assert
            Assert.NotNull(bytes);
            Assert.True(bytes.Length > 0);
        }

        [Fact]
        public async Task GetReportAsync_ThrowsNotFoundException_WhenUserNotFound()
        {
            // Arrange
            _currentUserContextMock.Setup(c => c.UserId).Returns(1);
            _userRepoMock.Setup(r => r.Queryable).Returns(new List<User>().AsQueryable().BuildMock());

            var service = CreateService();
            var request = new GetListCategoryReportRequest { Page = 1, PageSize = 10, SortBy = "name", Direction = "asc" };

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => service.GetReportAsync(request));
        }

        [Fact]
        public async Task GetReportAsync_ThrowsBadRequestException_WhenSortFieldInvalid()
        {
            // Arrange
            var admin = GetAdminUser();
            _currentUserContextMock.Setup(c => c.UserId).Returns(admin.Id);
            _userRepoMock.Setup(r => r.Queryable).Returns(new List<User> { admin }.AsQueryable().BuildMock());

            var states = new List<State>
            {
                new State { Id = 1, Name = "Available", TypeEntity = "Asset", Action = "View" }
            }.AsQueryable().BuildMock();
            _stateRepoMock.Setup(r => r.Queryable).Returns(states.AsQueryable());

            var categories = new List<Category>
            {
                new Category { Id = 10, Name = "Laptop" }
            }.AsQueryable().BuildMock();
            _categoryRepoMock.Setup(r => r.Queryable).Returns(categories.AsQueryable());

            var service = CreateService();
            var request = new GetListCategoryReportRequest { Page = 1, PageSize = 10, SortBy = "invalidField", Direction = "asc" };

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() => service.GetReportAsync(request));
        }

        [Fact]
        public async Task GetReportAsync_ReturnsPaginationData()
        {
            // Arrange
            var admin = GetAdminUser();
            _currentUserContextMock.Setup(c => c.UserId).Returns(admin.Id);
            _userRepoMock.Setup(r => r.Queryable).Returns(new List<User> { admin }.AsQueryable().BuildMock());

            var states = new List<State>
            {
                new() { Id = 1, Name = "Available", TypeEntity = "Asset", Action = "View" }
            }.AsQueryable().BuildMock();
            _stateRepoMock.Setup(r => r.Queryable).Returns(states);

            var categories = new List<Category>
            {
                new() { Id = 10, Name = "Laptop" }
            }.AsQueryable().BuildMock();
            _categoryRepoMock.Setup(r => r.Queryable).Returns(categories);

            var category = new Category { Id = 10, Name = "Laptop" };
            var assets = new List<Asset>
            {
                new() { Id = 1, CategoryId = 10, Category = category, State = Domain.Common.Enum.AssetStateEnum.Available, LocationId = admin.LocationId }
            }.AsQueryable().BuildMock();
_assetRepoMock.Setup(r => r.Queryable).Returns(assets);
            _assetRepoMock.Setup(r => r.Queryable).Returns(assets);

            var service = CreateService();
            var request = new GetListCategoryReportRequest { Page = 1, PageSize = 10, SortBy = "name", Direction = "asc" };

            // Act
            var result = await service.GetReportAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Total);
            Assert.Single(result.Data);
            var dataList = result.Data.ToList();
            Assert.NotEmpty(dataList[0].States);
            Assert.NotEmpty(dataList[0].Categories);
        }
    }
}