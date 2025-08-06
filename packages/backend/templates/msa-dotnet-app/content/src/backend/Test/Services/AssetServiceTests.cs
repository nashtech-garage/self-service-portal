using Moq;
using MockQueryable.Moq;
using API.Services;
using Domain.Repositories;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using AutoMapper;
using Domain.Entities;
using API.Exceptions;
using StackExchange.Redis;
using API.Services.Abstracts;
using Domain.Common.Enum;
using MockQueryable;
using Domain.Mapping;
using Domain.Common.Constants;

namespace Test.Services
{
    public class AssetServiceTests
    {
        private readonly Mock<IAssetRepository> _assetRepoMock = new();
        private readonly Mock<IAssignmentRepository> _assignmentRepoMock = new();
        private readonly Mock<IReturningRequestRepository> _returningRequestRepoMock = new();
        private readonly Mock<ICurrentUserContext> _currentUserContextMock = new();
        private readonly Mock<IUserRepository> _userRepoMock = new();
        private readonly Mock<ICategoryRepository> _categoryRepoMock = new();
        private readonly Mock<IConnectionMultiplexer> _redisMock = new();
        private readonly Mock<IDatabase> _databaseMock = new();

        private readonly IMapper _mapper;
        private readonly IConfigurationProvider _configProvider;
        private readonly AssetService _service;

        public AssetServiceTests()
        {
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<AssetProfile>(); // Replace with your actual Profile(s)
                cfg.AddProfile<AssignmentProfile>();
            });

            _mapper = mapperConfig.CreateMapper();
            _configProvider = mapperConfig;

            _redisMock.Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(_databaseMock.Object);

            _service = new AssetService(
                _assetRepoMock.Object,
                _configProvider,
                _currentUserContextMock.Object,
                _userRepoMock.Object,
                _redisMock.Object,
                _categoryRepoMock.Object,
                _mapper,
                _assignmentRepoMock.Object,
                _returningRequestRepoMock.Object
            );
        }

        [Fact]
        public async Task GetAssetsAsync_ShouldFilterAndReturnPaginatedData()
        {
            // Arrange
            var userId = 1;
            var locationId = 100;

            var laptopCate = new Category { Id = 1, Name = "Laptop" };
            var mouseCate = new Category { Id = 2, Name = "Accessory" };


            var assets = new List<Asset>
        {
            new Asset { Id = 1, Name = "Laptop A", Code = "LA001", CategoryId = 1, Category = laptopCate, State = AssetStateEnum.Available, LocationId = locationId },
            new Asset { Id = 2, Name = "Mouse B", Code = "MB002", CategoryId = 2, Category = mouseCate, State = AssetStateEnum.Assigned, LocationId = locationId },
        };

            var request = new GetListAssetRequest
            {
                Page = 1,
                PageSize = 10,
                KeySearch = "Laptop",
                SortBy = "name",
                Direction = "asc"
            };

            _currentUserContextMock.Setup(x => x.UserId).Returns(userId);

            var userQueryable = new List<User> {
            new User { Id = userId, LocationId = locationId }
        }.AsQueryable().BuildMock();

            var assetQueryable = assets.AsQueryable().BuildMock();

            _userRepoMock.Setup(x => x.Queryable).Returns(userQueryable);
            _assetRepoMock.Setup(x => x.Queryable).Returns(assetQueryable);

            // Act
            var result = await _service.GetAssetsAsync(request);

            // Assert
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetAssetDetailsAsync_ShouldThrowNotFound_WhenAssetDoesNotExist()
        {
            // Arrange
            var assetId = 999;
            var userId = 1;

            _currentUserContextMock.Setup(x => x.UserId).Returns(userId);

            var userQueryable = new List<User> {
            new User { Id = userId, LocationId = 1 }
        }.AsQueryable().BuildMock();

            var assetQueryable = new List<Asset>().AsQueryable().BuildMock();

            _userRepoMock.Setup(x => x.Queryable).Returns(userQueryable);
            _assetRepoMock.Setup(x => x.Queryable).Returns(assetQueryable);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _service.GetAssetDetailsAsync(assetId));
        }

        [Fact]
        public async Task GetAssetsAsync_ShouldFilterByState()
        {
            // Arrange
            var userId = 1;
            var locationId = 1;

            var category = new Category { Id = 1, Name = "Laptop" };

            var assets = new List<Asset>
        {
            new Asset { Id = 1, Code = "A01", Name = "Laptop A", State = AssetStateEnum.Available, LocationId = locationId, Category = category, CategoryId = category.Id },
            new Asset { Id = 2, Code = "A02", Name = "Laptop B", State = AssetStateEnum.Recycled, LocationId = locationId, Category = category, CategoryId = category.Id }
        };

            _currentUserContextMock.Setup(x => x.UserId).Returns(userId);
            _userRepoMock.Setup(x => x.Queryable).Returns(new List<User> {
            new User { Id = userId, LocationId = locationId }
        }.AsQueryable().BuildMock());

            _assetRepoMock.Setup(x => x.Queryable).Returns(assets.AsQueryable().BuildMock());

            var request = new GetListAssetRequest
            {
                Page = 1,
                PageSize = 10,
                States = new List<int> { 1, 3 }
            };

            // Act
            var result = await _service.GetAssetsAsync(request);

            // Assert
            Assert.Single(result.Data);
            Assert.Equal("A01", result.Data.First().Code);
        }

        [Fact]
        public async Task GetAssetsAsync_ShouldFilterByCategoryIds()
        {
            // Arrange
            var locationId = 1;
            var userId = 1;

            var categoryIdsToFilter = new List<int> { 2 };

            var category2 = new Category { Id = 2, Name = "Laptop" };
            var category3 = new Category { Id = 3, Name = "Mouse" };

            var assets = new List<Asset>
        {
            new Asset { Id = 1, Code = "A01", CategoryId = category2.Id, Category = category2, LocationId = locationId },
            new Asset { Id = 2, Code = "A02", CategoryId = category3.Id, Category = category3, LocationId = locationId },
            new Asset { Id = 3, Code = "A03", CategoryId = category2.Id, Category = category2, LocationId = locationId }
        };

            SetupBasicUserContext(userId, locationId, assets);

            var request = new GetListAssetRequest
            {
                Page = 1,
                PageSize = 10,
                CategoryIds = categoryIdsToFilter
            };

            // Act
            var result = await _service.GetAssetsAsync(request);

            // Assert
            Assert.Equal(2, result.Data.Count());
            Assert.All(result.Data, a => Assert.Contains(a.CategoryId, categoryIdsToFilter));
        }

        [Fact]
        public async Task GetAssetsAsync_ShouldReturnEmpty_WhenNoAssetInUserLocation()
        {
            // Arrange
            var locationId = 1;
            var otherLocationId = 2;
            var userId = 1;

            var category = new Category { Id = 1, Name = "Laptop" };

            var assets = new List<Asset>
        {
            new Asset { Id = 1, Code = "A01", LocationId = otherLocationId, CategoryId = category.Id, Category = category }
        };

            SetupBasicUserContext(userId, locationId, assets);

            var request = new GetListAssetRequest { Page = 1, PageSize = 10 };

            // Act
            var result = await _service.GetAssetsAsync(request);

            // Assert
            Assert.Empty(result.Data);
        }

        [Fact]
        public async Task GetAssetsAsync_ShouldSortByNameDescending()
        {
            // Arrange
            var locationId = 1;
            var userId = 1;

            var category = new Category { Id = 1, Name = "Laptop" };

            var assets = new List<Asset>
        {
            new Asset { Id = 1, Name = "Asset A", Code = "A01", Category = category, CategoryId = category.Id, LocationId = locationId },
            new Asset { Id = 2, Name = "Asset Z", Code = "A02", Category = category, CategoryId = category.Id, LocationId = locationId }
        };

            SetupBasicUserContext(userId, locationId, assets);

            var request = new GetListAssetRequest
            {
                Page = 1,
                PageSize = 10,
                SortBy = "name",
                Direction = "desc"
            };

            // Act
            var result = await _service.GetAssetsAsync(request);

            // Assert
            var names = result.Data.Select(a => a.Name).ToList();
            Assert.Equal(new List<string> { "Asset Z", "Asset A" }, names);
        }

        [Fact]
        public async Task GetAssetsAsync_ShouldReturnEmpty_WhenNoAssetMatchesFilter()
        {
            // Arrange
            var locationId = 1;
            var userId = 1;

            var category = new Category { Id = 5, Name = "Screen" };

            var assets = new List<Asset>
        {
            new Asset { Id = 1, Name = "Keyboard", Code = "K01", State = AssetStateEnum.Recycled, CategoryId = 5, Category = category, LocationId = locationId }
        };

            SetupBasicUserContext(userId, locationId, assets);

            var request = new GetListAssetRequest
            {
                Page = 1,
                PageSize = 10,
                KeySearch = "Mouse",
                CategoryIds = new List<int> { 1 },
                States = new List<int> { (int)AssetStateEnum.Assigned }
            };

            // Act
            var result = await _service.GetAssetsAsync(request);

            // Assert
            Assert.Empty(result.Data);
        }

        [Fact]
        public async Task GetAssetsAsync_ShouldPaginateCorrectly()
        {
            // Step 1: Setup test context
            var locationId = 1;
            var userId = 1;

            var category = new Category { Id = 1, Name = "Laptop" };

            // Step 2: Create 20 fake assets
            var assets = Enumerable.Range(1, 20).Select(i =>
                new Asset
                {
                    Id = i,
                    Name = $"Asset {i}",
                    Code = $"Code{i}",
                    LocationId = locationId,
                    Category = category,
                    CategoryId = category.Id,
                }).ToList();

            // Step 3: Setup the mock context and repository
            SetupBasicUserContext(userId, locationId, assets);

            var request = new GetListAssetRequest
            {
                Page = 2,
                PageSize = 5
            };

            // Step 4: Call the method
            var result = await _service.GetAssetsAsync(request);

            // Step 5: Verify results
            Assert.Equal(5, result.Data.Count()); // should have 5 items
            Assert.Equal("Code15", result.Data.First().Code); // first item on page 2
            Assert.Equal("Code11", result.Data.Last().Code); // last item on page 2
        }

        [Fact]
        public async Task GetAssetDetailsAsync_ShouldReturnCorrectAsset()
        {
            // Arrange
            var assetId = 1;
            var locationId = 1;
            var userId = 1;

            var category = new Category { Id = 1, Name = "Laptop" };
            var location = new Location { Id = locationId, Name = "HCM Office" };

            var asset = new Asset
            {
                Id = assetId,
                Name = "Laptop A",
                Code = "LA001",
                LocationId = locationId,
                CategoryId = category.Id,
                Category = category,
                Location = location
            };

            // Setup user context and asset list
            SetupBasicUserContext(userId, locationId, new List<Asset> { asset });

            // Mock assignments
            var assignments = new List<Assignment>
        {
            new Assignment
            {
                Id = 10,
                AssetId = assetId,
                AssignedDate = DateTime.UtcNow,
                AssignedToUser = new User { Id = 1, Username = "User A" },
                AssignedByUser = new User { Id = 2, Username = "Admin" },
                IsDeleted = false
            }
        };
            var mockAssignmentQueryable = assignments.AsQueryable().BuildMockDbSet();
            _assignmentRepoMock.Setup(r => r.Queryable).Returns(mockAssignmentQueryable.Object);

            // Mock return requests
            var returnRequests = new List<ReturningRequest>
        {
            new ReturningRequest
            {
                Id = 100,
                AssignmentId = 10,
                RequestedBy = 1,
                IsDeleted = false
            }
        };

            var mockReturnRequestQueryable = returnRequests.AsQueryable().BuildMockDbSet();
            _returningRequestRepoMock.Setup(r => r.Queryable).Returns(mockReturnRequestQueryable.Object);

            // Act
            var result = await _service.GetAssetDetailsAsync(assetId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(assetId, result.Id);
            Assert.Equal("LA001", result.Code);
        }

        private void SetupBasicUserContext(int userId, int locationId, List<Asset> assets)
        {
            _currentUserContextMock.Setup(x => x.UserId).Returns(userId);

            var userQueryable = new List<User>
        {
            new User { Id = userId, LocationId = locationId }
        }.AsQueryable().BuildMock();

            var assetQueryable = assets.AsQueryable().BuildMock();

            _userRepoMock.Setup(x => x.Queryable).Returns(userQueryable);
            _assetRepoMock.Setup(x => x.Queryable).Returns(assetQueryable);
        }

        private void SetupRedisStringGet(string key, RedisValue value)
        {
            _databaseMock.Setup(x => x.StringGetAsync(key, It.IsAny<CommandFlags>()))
                        .ReturnsAsync(value);
        }

        private void SetupRedisStringSet(string key, RedisValue value, bool isSet = false)
        {
            _databaseMock.Setup(x => x.StringSetAsync(key, value, null, When.Always, CommandFlags.None))
                        .ReturnsAsync(isSet);
        }

        [Fact]
        public async Task CreateAssetAsync_ShouldReturnResponse_WhenValidRequest()
        {
            // Arrange
            var request = new CreateAssetRequest
            {
                Name = "Laptop HP",
                CategoryId = 1,
                Specification = "16GB RAM, SSD",
                InstalledDate = DateTime.Now.AddDays(-1),
                State = AssetStateEnum.Available
            };

            var category = new Category { Id = 1, Code = "LA" };

            _categoryRepoMock.Setup(x => x.Queryable)
                                .Returns(new List<Category> { category }.AsQueryable().BuildMock());

            _userRepoMock.Setup(x => x.Queryable)
                            .Returns(new List<User> { new User { Id = 1, LocationId = 10 } }.AsQueryable().BuildMock());

            _currentUserContextMock.Setup(x => x.UserId).Returns(1);

            _assetRepoMock.Setup(x => x.Queryable)
                            .Returns(new List<Asset>().AsQueryable().BuildMock());

            _databaseMock.Setup(x => x.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                        .ReturnsAsync(RedisValue.Null);

            _databaseMock.Setup(x => x.StringSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), null, When.Always, CommandFlags.None))
                        .ReturnsAsync(true);

            _assetRepoMock.Setup(x => x.AddAsync(It.IsAny<Asset>())).ReturnsAsync((Asset a) => a);
            _assetRepoMock.Setup(x => x.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
                            .ReturnsAsync(1);

            var service = new AssetService(_assetRepoMock.Object, _configProvider, _currentUserContextMock.Object,
                                            _userRepoMock.Object, _redisMock.Object,
                                            _categoryRepoMock.Object, _mapper,
                                            _assignmentRepoMock.Object,
                                            _returningRequestRepoMock.Object);

            // Act
            var result = await service.CreateAssetAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.StartsWith("LA", result.Code);
            Assert.Equal("Laptop HP", result.Name);
            Assert.Equal(AssetStateEnum.Available, result.State);
        }

        [Fact]
        public async Task CreateAssetAsync_ShouldThrowException_WhenCategoryNotFound()
        {
            // Arrange
            var request = new CreateAssetRequest
            {
                Name = "Laptop HP",
                CategoryId = 99, // Non-existent category
                Specification = "16GB RAM, SSD",
                InstalledDate = DateTime.Now.AddDays(-1),
                State = AssetStateEnum.Available
            };

            _categoryRepoMock.Setup(x => x.Queryable)
                                .Returns(new List<Category>().AsQueryable().BuildMock()); // No categories

            _currentUserContextMock.Setup(x => x.UserId).Returns(1);

            var service = new AssetService(_assetRepoMock.Object, _configProvider, _currentUserContextMock.Object,
                                            _userRepoMock.Object, _redisMock.Object,
                                            _categoryRepoMock.Object, _mapper,
                                            _assignmentRepoMock.Object,
                                            _returningRequestRepoMock.Object);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() => service.CreateAssetAsync(request));
            Assert.Equal("Category with ID 99 does not exist.", exception.Message);
        }

        [Fact]
        public async Task CreateAssetAsync_ShouldGenerateCorrectAssetCode()
        {
            // Arrange
            var request = new CreateAssetRequest
            {
                Name = "Laptop HP",
                CategoryId = 1,
                Specification = "16GB RAM, SSD",
                InstalledDate = DateTime.Now.AddDays(-1),
                State = AssetStateEnum.Available
            };

            var category = new Category { Id = 1, Code = "LA" };

            _categoryRepoMock.Setup(x => x.Queryable)
                                .Returns(new List<Category> { category }.AsQueryable().BuildMock());

            _userRepoMock.Setup(x => x.Queryable)
                            .Returns(new List<User> { new User { Id = 1, LocationId = 10 } }.AsQueryable().BuildMock());

            _currentUserContextMock.Setup(x => x.UserId).Returns(1);

            _assetRepoMock.Setup(x => x.Queryable)
                            .Returns(new List<Asset>
                            {
                    new Asset { Code = "LA000001" } // Existing asset code
                            }.AsQueryable().BuildMock());

            _databaseMock.Setup(x => x.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                        .ReturnsAsync(RedisValue.Null); // Simulate no value in Redis

            _databaseMock.Setup(x => x.StringSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), null, When.Always, CommandFlags.None))
                        .ReturnsAsync(true);

            _assetRepoMock.Setup(x => x.AddAsync(It.IsAny<Asset>())).ReturnsAsync((Asset a) => a);
            _assetRepoMock.Setup(x => x.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
                            .ReturnsAsync(1);

            var service = new AssetService(_assetRepoMock.Object, _configProvider, _currentUserContextMock.Object,
                                            _userRepoMock.Object, _redisMock.Object,
                                            _categoryRepoMock.Object, _mapper,
                                            _assignmentRepoMock.Object,
                                            _returningRequestRepoMock.Object);

            // Act
            var result = await service.CreateAssetAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.StartsWith("LA", result.Code); // Ensure the code starts with the category code
            Assert.Equal("LA000002", result.Code); // Ensure the next code is generated correctly
        }

        [Fact]
        public async Task GenerateAssetCodeAsync_ShouldStartFromOne_WhenNoDataInRedisOrDb()
        {
            // Arrange
            var categoryCode = "MO";
            var redisKey = string.Format(AuthConstant.AssetCodeMaxPostfixKey, categoryCode);

            SetupRedisStringGet(redisKey, RedisValue.Null);
            SetupRedisStringSet(redisKey, "1");

            _assetRepoMock.Setup(x => x.Queryable)
                            .Returns(new List<Asset>().AsQueryable().BuildMock());

            var service = new AssetService(_assetRepoMock.Object, _configProvider, _currentUserContextMock.Object,
                                            _userRepoMock.Object, _redisMock.Object,
                                            _categoryRepoMock.Object, _mapper,
                                            _assignmentRepoMock.Object,
                                            _returningRequestRepoMock.Object);

            // Act
            var result = await service.GenerateAssetCodeAsync(categoryCode);

            // Assert
            Assert.Equal("000001", result);
        }

        [Fact]
        public async Task GenerateAssetCodeAsync_ShouldDefaultToOne_WhenDbHasInvalidCode()
        {
            var categoryCode = "MO";

            var redisKey = string.Format(AuthConstant.AssetCodeMaxPostfixKey, categoryCode);

            SetupRedisStringGet(redisKey, RedisValue.Null);
            SetupRedisStringSet(redisKey, "1");

            _assetRepoMock.Setup(x => x.Queryable)
                            .Returns(new List<Asset> { new Asset { Code = "MOXYZ" } }
                                    .AsQueryable().BuildMock());

            var service = new AssetService(_assetRepoMock.Object, _configProvider, _currentUserContextMock.Object,
                                            _userRepoMock.Object, _redisMock.Object,
                                            _categoryRepoMock.Object, _mapper,
                                            _assignmentRepoMock.Object,
                                            _returningRequestRepoMock.Object);

            var result = await service.GenerateAssetCodeAsync(categoryCode);

            Assert.Equal("000001", result);
        }

        [Fact]
        public async Task GenerateAssetCodeAsync_ShouldPadWithZeros()
        {
            var categoryCode = "LA";

            var redisKey = string.Format(AuthConstant.AssetCodeMaxPostfixKey, categoryCode);

            SetupRedisStringGet(redisKey, RedisValue.Null);
            SetupRedisStringSet(redisKey, "10");

            _assetRepoMock.Setup(x => x.Queryable)
                            .Returns(new List<Asset> { new Asset { Code = "LA000009" } }
                                    .AsQueryable().BuildMock());

            var service = new AssetService(_assetRepoMock.Object, _configProvider, _currentUserContextMock.Object,
                                            _userRepoMock.Object, _redisMock.Object,
                                            _categoryRepoMock.Object, _mapper,
                                            _assignmentRepoMock.Object,
                                            _returningRequestRepoMock.Object);

            var result = await service.GenerateAssetCodeAsync(categoryCode);

            Assert.Equal("000010", result);
        }

        [Fact]
        public async Task GenerateAssetCodeAsync_ShouldUseRedisValue_WhenAvailable()
        {
            var categoryCode = "MO";

            var redisKey = string.Format(AuthConstant.AssetCodeMaxPostfixKey, categoryCode);

            SetupRedisStringGet(redisKey, "5");
            SetupRedisStringSet(redisKey, "6");

            var service = new AssetService(_assetRepoMock.Object, _configProvider, _currentUserContextMock.Object,
                                            _userRepoMock.Object, _redisMock.Object,
                                            _categoryRepoMock.Object, _mapper,
                                            _assignmentRepoMock.Object,
                                            _returningRequestRepoMock.Object);

            var result = await service.GenerateAssetCodeAsync(categoryCode);

            Assert.Equal("000006", result);
        }

        [Fact]
        public async Task UpdateAssetAsync_ShouldUpdateAsset_WhenAssetExists()
        {
            // Arrange
            var assetId = 1;
            var request = new UpdateAssetRequest
            {
                Name = " Updated Asset Name ",
                Specification = " Updated Specification ",
                InstalledDate = DateTime.Now,
                State = AssetStateEnum.Available
            };

            var asset = new Asset
            {
                Id = assetId,
                Name = "Old Asset Name",
                Specification = "Old Specification",
                InstalledDate = DateTime.Now.AddDays(-1),
                State = AssetStateEnum.NotAvailable,
                CategoryId = 1,
                LocationId = 1,
                Code = "LA000001",
                IsDeleted = false
            };

            _assetRepoMock.Setup(x => x.Queryable)
                .Returns(new List<Asset> { asset }.AsQueryable().BuildMock());

            _assetRepoMock.Setup(x => x.UpdateAsync(It.IsAny<Asset>())).Returns(Task.CompletedTask);

            var unitOfWorkMock = new Mock<IUnitOfWork>();
            unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1); // hoặc bất kỳ int nào

            _assetRepoMock.Setup(r => r.UnitOfWork).Returns(unitOfWorkMock.Object);

            var service = new AssetService(
                _assetRepoMock.Object,
                _configProvider,
                _currentUserContextMock.Object,
                _userRepoMock.Object,
                _redisMock.Object,
                _categoryRepoMock.Object,
                _mapper,
                _assignmentRepoMock.Object,
                _returningRequestRepoMock.Object
            );

            // Act
            await service.UpdateAssetAsync(assetId, request);

            // Assert
            _assetRepoMock.Verify(x => x.UpdateAsync(It.Is<Asset>(a =>
                a.Id == assetId &&
                a.Name == "Updated Asset Name" &&
                a.Specification == "Updated Specification"
            )), Times.Once);

            _assetRepoMock.Verify(x => x.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAssetAsync_ShouldThrowNotFoundException_WhenAssetDoesNotExist()
        {
            // Arrange
            var assetId = 1;
            var request = new UpdateAssetRequest
            {
                Name = "Updated Asset Name",
                Specification = "Updated Specification",
                InstalledDate = DateTime.Now,
                State = AssetStateEnum.Available
            };

            _assetRepoMock.Setup(x => x.Queryable)
                .Returns(new List<Asset>().AsQueryable().BuildMock());

            var service = new AssetService(
                _assetRepoMock.Object,
                _configProvider,
                _currentUserContextMock.Object,
                _userRepoMock.Object,
                _redisMock.Object,
                _categoryRepoMock.Object,
                _mapper,
                _assignmentRepoMock.Object,
                _returningRequestRepoMock.Object
            );

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => service.UpdateAssetAsync(assetId, request));
        }

        [Fact]
        public async Task UpdateAssetAsync_ShouldTrimInput_WhenUpdatingAsset()
        {
            // Arrange
            var assetId = 1;
            var request = new UpdateAssetRequest
            {
                Name = "Updated Asset Name",
                Specification = "Updated Specification",
                InstalledDate = DateTime.Now,
                State = AssetStateEnum.Available

            };

            var asset = new Asset
            {
                Id = assetId,
                Name = "Old Asset Name",
                Specification = "Old Specification"
            };

            _assetRepoMock.Setup(x => x.Queryable)
                .Returns(new List<Asset> { asset }.AsQueryable().BuildMock());

            _assetRepoMock.Setup(x => x.UpdateAsync(It.IsAny<Asset>())).Returns(Task.CompletedTask);

            var unitOfWorkMock = new Mock<IUnitOfWork>();
            unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1); // hoặc bất kỳ int nào

            _assetRepoMock.Setup(r => r.UnitOfWork).Returns(unitOfWorkMock.Object);

            var service = new AssetService(
                _assetRepoMock.Object,
                _configProvider,
                _currentUserContextMock.Object,
                _userRepoMock.Object,
                _redisMock.Object,
                _categoryRepoMock.Object,
                _mapper,
                _assignmentRepoMock.Object,
                _returningRequestRepoMock.Object
            );

            // Act
            await service.UpdateAssetAsync(assetId, request);

            // Assert
            _assetRepoMock.Verify(x => x.UpdateAsync(It.Is<Asset>(a =>
                a.Name == "Updated Asset Name" &&
                a.Specification == "Updated Specification"
            )), Times.Once);
        }

        [Fact]
        public async Task DeleteAssetAsync_ShouldThrowNotFoundException_WhenAssetDoesNotExist()
        {
            // Arrange
            var assetId = 999;
            var userId = 1;
            var locationId = 1;

            SetupBasicUserContext(userId, locationId, new List<Asset>());

            var service = new AssetService(
                _assetRepoMock.Object,
                _configProvider,
                _currentUserContextMock.Object,
                _userRepoMock.Object,
                _redisMock.Object,
                _categoryRepoMock.Object,
                _mapper,
                _assignmentRepoMock.Object,
                _returningRequestRepoMock.Object
            );

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() => service.DeleteAssetAsync(assetId));
            Assert.Equal($"Asset with ID {assetId} does not exist.", exception.Message);
        }

        [Fact]
        public async Task DeleteAssetAsync_ShouldThrowBadRequestException_WhenAssetIsAssigned()
        {
            // Arrange
            var assetId = 1;
            var userId = 1;
            var locationId = 1;

            var asset = new Asset
            {
                Id = assetId,
                Name = "Test Asset",
                Code = "TA001",
                State = AssetStateEnum.Assigned, // Asset is currently assigned
                LocationId = locationId,
                IsDeleted = false
            };

            SetupBasicUserContext(userId, locationId, new List<Asset> { asset });

            var service = new AssetService(
                _assetRepoMock.Object,
                _configProvider,
                _currentUserContextMock.Object,
                _userRepoMock.Object,
                _redisMock.Object,
                _categoryRepoMock.Object,
                _mapper,
                _assignmentRepoMock.Object,
                _returningRequestRepoMock.Object
            );

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() => service.DeleteAssetAsync(assetId));
            Assert.Equal("Cannot delete asset that is currently assigned.", exception.Message);
        }

        [Fact]
        public async Task DeleteAssetAsync_ShouldThrowBadRequestException_WhenAssetHasHistoricalAssignments()
        {
            // Arrange
            var assetId = 1;
            var userId = 1;
            var locationId = 1;

            var asset = new Asset
            {
                Id = assetId,
                Name = "Test Asset",
                Code = "TA001",
                State = AssetStateEnum.Available, // Asset is available but has historical assignments
                LocationId = locationId,
                IsDeleted = false
            };

            SetupBasicUserContext(userId, locationId, new List<Asset> { asset });

            // Setup assignments to simulate historical assignments
            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    AssetId = assetId,
                    State = AssignmentStateEnum.Returned, // Historical assignment
                    IsDeleted = false
                }
            };

            var mockAssignmentQueryable = assignments.AsQueryable().BuildMockDbSet();
            _assignmentRepoMock.Setup(r => r.Queryable).Returns(mockAssignmentQueryable.Object);

            var service = new AssetService(
                _assetRepoMock.Object,
                _configProvider,
                _currentUserContextMock.Object,
                _userRepoMock.Object,
                _redisMock.Object,
                _categoryRepoMock.Object,
                _mapper,
                _assignmentRepoMock.Object,
                _returningRequestRepoMock.Object
            );

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(() => service.DeleteAssetAsync(assetId));
            Assert.Equal("Cannot delete the asset because it belongs to one or more historical assignments. If the asset is not able to be used anymore, please update its state in Edit Asset page.", exception.Message);
        }

        [Fact]
        public async Task DeleteAssetAsync_ShouldDeleteSuccessfully_WhenAssetCanBeDeleted()
        {
            // Arrange
            var assetId = 1;
            var userId = 1;
            var locationId = 1;

            var asset = new Asset
            {
                Id = assetId,
                Name = "Test Asset",
                Code = "TA001",
                State = AssetStateEnum.Available, // Asset is available
                LocationId = locationId,
                IsDeleted = false
            };

            SetupBasicUserContext(userId, locationId, new List<Asset> { asset });

            // Setup no historical assignments
            var mockAssignmentQueryable = new List<Assignment>().AsQueryable().BuildMockDbSet();
            _assignmentRepoMock.Setup(r => r.Queryable).Returns(mockAssignmentQueryable.Object);

            // Setup mock for delete operations
            _assetRepoMock.Setup(x => x.DeleteAsync(It.IsAny<Asset>())).Returns(Task.CompletedTask);

            var unitOfWorkMock = new Mock<IUnitOfWork>();
            unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            _assetRepoMock.Setup(r => r.UnitOfWork).Returns(unitOfWorkMock.Object);

            var service = new AssetService(
                _assetRepoMock.Object,
                _configProvider,
                _currentUserContextMock.Object,
                _userRepoMock.Object,
                _redisMock.Object,
                _categoryRepoMock.Object,
                _mapper,
                _assignmentRepoMock.Object,
                _returningRequestRepoMock.Object
            );

            // Act
            await service.DeleteAssetAsync(assetId);

            // Assert
            _assetRepoMock.Verify(x => x.DeleteAsync(It.Is<Asset>(a => a.Id == assetId)), Times.Once);
            _assetRepoMock.Verify(x => x.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAssetAsync_ShouldThrowNotFoundException_WhenAssetNotInUserLocation()
        {
            // Arrange
            var assetId = 1;
            var userId = 1;
            var userLocationId = 1;
            var assetLocationId = 2; // Different location

            var asset = new Asset
            {
                Id = assetId,
                Name = "Test Asset",
                Code = "TA001",
                State = AssetStateEnum.Available,
                LocationId = assetLocationId, // Asset in different location
                IsDeleted = false
            };

            // Setup user in location 1, but asset is in location 2
            _currentUserContextMock.Setup(x => x.UserId).Returns(userId);

            var userQueryable = new List<User>
            {
                new User { Id = userId, LocationId = userLocationId }
            }.AsQueryable().BuildMock();

            var assetQueryable = new List<Asset> { asset }.AsQueryable().BuildMock();

            _userRepoMock.Setup(x => x.Queryable).Returns(userQueryable);
            _assetRepoMock.Setup(x => x.Queryable).Returns(assetQueryable);

            var service = new AssetService(
                _assetRepoMock.Object,
                _configProvider,
                _currentUserContextMock.Object,
                _userRepoMock.Object,
                _redisMock.Object,
                _categoryRepoMock.Object,
                _mapper,
                _assignmentRepoMock.Object,
                _returningRequestRepoMock.Object
            );

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(() => service.DeleteAssetAsync(assetId));
            Assert.Equal($"Asset with ID {assetId} does not exist.", exception.Message);
        }
    }
}

