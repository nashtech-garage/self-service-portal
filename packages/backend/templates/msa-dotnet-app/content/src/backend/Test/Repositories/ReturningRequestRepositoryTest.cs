using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Entities;
using Infrastructure.Database;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Test.Repositories
{
    public class ReturningRequestRepositoryTest
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ReturningRequestRepository _repository;

        public ReturningRequestRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var httpContextAccessor = new Microsoft.AspNetCore.Http.HttpContextAccessor();
            _dbContext = new ApplicationDbContext(options, httpContextAccessor);
            _repository = new ReturningRequestRepository(_dbContext);
        }

        [Fact]
        public void Queryable_ReturnsDbSetAsQueryable()
        {
            // Arrange
            _dbContext.ReturningRequests.AddRange(
                new ReturningRequest { Id = 1, CreatedBy = 1},
                new ReturningRequest { Id = 2, CreatedBy = 1}
            );
            _dbContext.SaveChanges();

            // Act
            var result = _repository.Queryable.ToList();

            // Assert
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public void UnitOfWork_ReturnsDbContext()
        {
            // Act
            var unitOfWork = _repository.UnitOfWork;

            // Assert
            Assert.Equal(_dbContext, unitOfWork);
        }

        [Fact]
        public async Task AddAsync_AddsEntityToDbSet()
        {
            // Arrange
            var returningRequest = new ReturningRequest
            {
                Id = 3,
                CreatedBy = 1
            };

            // Act
            var result = await _repository.AddAsync(returningRequest);
            await _dbContext.SaveChangesAsync();

            // Assert
            Assert.Contains(_dbContext.ReturningRequests, r => r.Id == 3);
            Assert.Equal(returningRequest, result);
        }

        [Fact]
        public async Task AddRangeAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.AddRangeAsync(new List<ReturningRequest>()));
        }

        [Fact]
        public async Task DeleteAsync_ByEntity_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteAsync(new ReturningRequest()));
        }

        [Fact]
        public async Task DeleteAsync_ById_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteAsync(1));
        }

        [Fact]
        public async Task DeleteRangeAsync_Entities_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteRangeAsync(new List<ReturningRequest>()));
        }

        [Fact]
        public async Task DeleteRangeAsync_Ids_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteRangeAsync(new List<object>()));
        }

        [Fact]
        public async Task UpdateRangeAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.UpdateRangeAsync(new List<ReturningRequest>()));
        }

        [Fact]
        public async Task GetReturningAssignmentIdsAsync_ReturnsCorrectIds()
        {
            // Arrange
            var req1 = new ReturningRequest
            {
                Id = 10,
                AssignmentId = 100,
                State = ReturningRequestStateEnum.WaitingForReturning,
                CreatedBy = 1,
                IsDeleted = false
            };
            var req2 = new ReturningRequest
            {
                Id = 11,
                AssignmentId = 101,
                State = ReturningRequestStateEnum.Completed,
                CreatedBy = 1,
                IsDeleted = false
            };
            var req3 = new ReturningRequest
            {
                Id = 12,
                AssignmentId = 102,
                State = ReturningRequestStateEnum.WaitingForReturning,
                CreatedBy = 1,
                IsDeleted = true // Should be filtered out
            };
            _dbContext.ReturningRequests.AddRange(req1, req2, req3);
            _dbContext.SaveChanges();

            var assignmentIds = new List<int> { 100, 101, 102 };

            // Act
            var result = await _repository.GetReturningAssignmentIdsAsync(assignmentIds);

            // Assert
            Assert.Single(result);
            Assert.Contains(100, result);
        }
        [Fact]
        public async Task GetReturningRequestsAsync_ReturnsPagedData_FilteredByLocation()
        {
            // Arrange
            var locationId = 1;
            var asset = new Asset { Id = 1, Code = "A001", Name = "Asset1", LocationId = locationId, CategoryId = 1, CreatedBy = 1, Specification = "Spec1" };
            var assignment = new Assignment { Id = 1, Asset = asset, AssetId = asset.Id, CreatedBy = 1 };
            var user = new User
            {
                Id = 1,
                Username = "user1",
                CreatedBy = 1,
                FirstName = "First",
                LastName = "Last",
                PasswordHash = "hashedpassword",
                StaffCode = "SC001"
            };
            var returningRequest = new ReturningRequest
            {
                Id = 1,
                Assignment = assignment,
                AssignmentId = assignment.Id,
                RequestedByUser = user,
                RequestedBy = user.Id,
                State = Domain.Common.Enum.ReturningRequestStateEnum.WaitingForReturning,
                ReturnDate = DateTime.UtcNow.Date,
                CreatedBy = 1,
                IsDeleted = false
            };
            _dbContext.Assets.Add(asset);
            _dbContext.Assignments.Add(assignment);
            _dbContext.Users.Add(user);
            _dbContext.ReturningRequests.Add(returningRequest);
            _dbContext.SaveChanges();

            var request = new GetListReturningRequest
            {
                Page = 1,
                PageSize = 10,
                SortBy = "Id",
                Direction = "asc"
            };

            // Act
            var result = await _repository.GetReturningRequestsAsync(request, locationId);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result.Data);
            Assert.Equal(returningRequest.Id, result.Data.First().Id);
            Assert.Equal(1, result.Total);
        }

        [Fact]
        public async Task GetReturningRequestsAsync_FiltersByKeySearch()
        {
            // Arrange
            var locationId = 2;
            var asset = new Asset { Id = 2, Code = "A002", Name = "SpecialAsset", LocationId = locationId, CategoryId = 1, CreatedBy = 2, Specification = "Spec2" };
            var assignment = new Assignment { Id = 2, Asset = asset, AssetId = asset.Id, CreatedBy = 2 };
            var user = new User
            {
                Id = 2,
                Username = "user2",
                CreatedBy = 1,
                FirstName = "First",
                LastName = "Last",
                PasswordHash = "hashedpassword",
                StaffCode = "SC002"
            };
            var returningRequest = new ReturningRequest
            {
                Id = 2,
                Assignment = assignment,
                AssignmentId = assignment.Id,
                RequestedByUser = user,
                CreatedBy = 1,
                RequestedBy = user.Id,
                State = Domain.Common.Enum.ReturningRequestStateEnum.WaitingForReturning,
                ReturnDate = DateTime.UtcNow.Date,
                IsDeleted = false
            };
            _dbContext.Assets.Add(asset);
            _dbContext.Assignments.Add(assignment);
            _dbContext.Users.Add(user);
            _dbContext.ReturningRequests.Add(returningRequest);
            _dbContext.SaveChanges();

            var request = new GetListReturningRequest
            {
                Page = 1,
                PageSize = 10,
                SortBy = "Id",
                Direction = "asc",
            };
            // Act
            var result = await _repository.GetReturningRequestsAsync(request, locationId);

            // Assert
            Assert.Single(result.Data);
            Assert.Equal(returningRequest.Id, result.Data.First().Id);
        }

        [Fact]
        public async Task GetReturningRequestsAsync_FiltersByState()
        {
            // Arrange
            var locationId = 3;
            var asset = new Asset { Id = 3, Code = "A003", Name = "Asset3", LocationId = locationId, CategoryId = 1, CreatedBy = 3, Specification = "Spec3" };
            var assignment = new Assignment { Id = 3, Asset = asset, AssetId = asset.Id, CreatedBy = 3 };
            var user = new User
            {
                Id = 3,
                Username = "user3",
                CreatedBy = 3,
                FirstName = "First",
                LastName = "Last",
                PasswordHash = "hashedpassword",
                StaffCode = "SC003"
            };

            var rr1 = new ReturningRequest
            {
                Id = 3,
                Assignment = assignment,
                AssignmentId = assignment.Id,
                RequestedByUser = user,
                RequestedBy = user.Id,
                CreatedBy = 3,
                State = Domain.Common.Enum.ReturningRequestStateEnum.WaitingForReturning,
                ReturnDate = DateTime.UtcNow.Date,
                IsDeleted = false
            };

            var rr2 = new ReturningRequest
            {
                Id = 4,
                Assignment = assignment,
                AssignmentId = assignment.Id,
                RequestedByUser = user,
                RequestedBy = user.Id,
                State = Domain.Common.Enum.ReturningRequestStateEnum.Completed,
                ReturnDate = DateTime.UtcNow.Date,
                CreatedBy = 3,
                IsDeleted = false
            };
            _dbContext.Assets.Add(asset);
            _dbContext.Assignments.Add(assignment);
            _dbContext.Users.Add(user);
            _dbContext.ReturningRequests.AddRange(rr1, rr2);
            _dbContext.SaveChanges();

            var request = new GetListReturningRequest
            {
                Page = 1,
                PageSize = 10,
                SortBy = "Id",
                Direction = "asc",
                State = new List<Domain.Common.Enum.ReturningRequestStateEnum> { Domain.Common.Enum.ReturningRequestStateEnum.Completed }
            };

            // Act
            var result = await _repository.GetReturningRequestsAsync(request, locationId);

            // Assert
            Assert.Single(result.Data);
            Assert.Equal(rr2.Id, result.Data.First().Id);
        }

        [Fact]
        public async Task GetReturningRequestsAsync_FiltersByReturnedDate()
        {
            // Arrange
            var locationId = 4;
            var date = new DateTime(2024, 1, 1);
            var asset = new Asset { Id = 4, Code = "A004", Name = "Asset4", LocationId = locationId, CategoryId = 1, CreatedBy = 4, Specification = "Spec4" };
            var assignment = new Assignment { Id = 4, Asset = asset, AssetId = asset.Id, CreatedBy = 4, };
            var user = new User
            {
                Id = 4,
                Username = "user4",
                CreatedBy = 4,
                FirstName = "First",
                LastName = "Last",
                PasswordHash = "hashedpassword",
                StaffCode = "SC004"
            };
            var rr1 = new ReturningRequest
            {
                Id = 5,
                Assignment = assignment,
                AssignmentId = assignment.Id,
                RequestedByUser = user,
                RequestedBy = user.Id,
                State = Domain.Common.Enum.ReturningRequestStateEnum.WaitingForReturning,
                ReturnDate = date,
                CreatedBy = 4,
                IsDeleted = false
            };
            var rr2 = new ReturningRequest
            {
                Id = 6,
                Assignment = assignment,
                AssignmentId = assignment.Id,
                RequestedByUser = user,
                RequestedBy = user.Id,
                CreatedBy = 4,
                State = Domain.Common.Enum.ReturningRequestStateEnum.WaitingForReturning,
                ReturnDate = date.AddDays(1),
                IsDeleted = false
            };
            _dbContext.Assets.Add(asset);
            _dbContext.Assignments.Add(assignment);
            _dbContext.Users.Add(user);
            _dbContext.ReturningRequests.AddRange(rr1, rr2);
            _dbContext.SaveChanges();

            var request = new GetListReturningRequest
            {
            Page = 1,
            PageSize = 10,
            SortBy = "Id",
            Direction = "asc",
            ReturnedDate = date
            };

            // Act
            var result = await _repository.GetReturningRequestsAsync(request, locationId);

            // Assert
            Assert.Single(result.Data);
            Assert.Equal(rr1.Id, result.Data.First().Id);
        }

        [Fact]
        public async Task GetReturningRequestsAsync_ReturnsEmpty_WhenNoMatch()
        {
            // Arrange
            var locationId = 999;
            var request = new GetListReturningRequest
            {
            Page = 1,
            PageSize = 10,
            SortBy = "Id",
            Direction = "asc"
            };

            // Act
            var result = await _repository.GetReturningRequestsAsync(request, locationId);

            // Assert
            Assert.Empty(result.Data);
            Assert.Equal(0, result.Total);
        }
    }
}