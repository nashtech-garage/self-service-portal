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
    public class AssignmentRepositoryTest
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly AssignmentRepository _repository;

        public AssignmentRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var httpContextAccessor = new Microsoft.AspNetCore.Http.HttpContextAccessor();
            _dbContext = new ApplicationDbContext(options, httpContextAccessor);
            _repository = new AssignmentRepository(_dbContext);
        }

        [Fact]
        public void Queryable_ReturnsDbSetAsQueryable()
        {
            // Arrange
            _dbContext.Assignments.AddRange(
                new Assignment { Id = 1, Note = "A1", CreatedBy = 1 },
                new Assignment { Id = 2, Note = "A2", CreatedBy = 1 }
            );
            _dbContext.SaveChanges();

            // Act
            var result = _repository.Queryable.ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, a => a.Note == "A1");
            Assert.Contains(result, a => a.Note == "A2");
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
        public async Task AddAsync_AddsEntityAndSetsDefaultState()
        {
            // Arrange
            var assignment = new Assignment
            {
                Id = 10,
                Note = "Test",
                State = AssignmentStateEnum.Accepted // Should be overwritten
            };

            // Act
            var result = await _repository.AddAsync(assignment);
            await _dbContext.SaveChangesAsync();

            // Assert
            Assert.Equal(AssignmentStateEnum.WaitingForAcceptance, result.State);
            Assert.Contains(_dbContext.Assignments, a => a.Id == 10 && a.State == AssignmentStateEnum.WaitingForAcceptance);
        }

        [Fact]
        public async Task DeleteAsync_NullEntity_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _repository.DeleteAsync((Assignment)null!));
        }

        [Fact]
        public async Task UpdateAsync_UpdatesEntityInDbSet()
        {
            // Arrange
            var assignment = new Assignment { Id = 30, Note = "OldNote", CreatedBy = 1 };
            _dbContext.Assignments.Add(assignment);
            _dbContext.SaveChanges();

            // Act
            assignment.Note = "UpdatedNote";
            await _repository.UpdateAsync(assignment);
            await _dbContext.SaveChangesAsync();

            // Assert
            var updated = _dbContext.Assignments.First(a => a.Id == 30);
            Assert.Equal("UpdatedNote", updated.Note);
        }

        [Fact]
        public async Task AddRangeAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.AddRangeAsync(new List<Assignment>()));
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
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteRangeAsync(new List<Assignment>()));
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
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.UpdateRangeAsync(new List<Assignment>()));
        }

        [Fact]
        public async Task GetHomeAssignmentsForUserAsync_ReturnsAssignments_FilteredAndPaged()
        {
            // Arrange
            var userId = 100;
            var today = DateTime.UtcNow.Date;
            var assignments = new List<Assignment>
                {
                new Assignment { Id = 1, AssignedTo = userId, AssignedDate = today.AddDays(-1), State = AssignmentStateEnum.WaitingForAcceptance, CreatedBy = 1, Asset = new Asset { Id = 1, Code = "C1", Name = "Asset1", CreatedBy = 1, Specification = "Spec1", Category = new Category { Code = "CAT1", CreatedBy = 1, Name = "Category1" } }},
                new Assignment { Id = 2, AssignedTo = userId, AssignedDate = today, State = AssignmentStateEnum.Accepted, CreatedBy = 1, Asset = new Asset { Id = 2, Code = "C2", Name = "Asset2", CreatedBy = 1, Specification = "Spec2", Category = new Category { Code = "CAT2", CreatedBy = 1, Name = "Category2" } } },
                new Assignment { Id = 3, AssignedTo = userId, AssignedDate = today.AddDays(1), State = AssignmentStateEnum.WaitingForAcceptance, CreatedBy = 1, Asset = new Asset { Id = 3, Code = "C3", Name = "Asset3", CreatedBy = 1, Specification = "Spec3", Category = new Category { Code = "CAT3", CreatedBy = 1, Name = "Category3" } } }, // Should be filtered out (future date)
                new Assignment { Id = 4, AssignedTo = userId, AssignedDate = today, State = AssignmentStateEnum.Declined, CreatedBy = 1, Asset = new Asset { Id = 4, Code = "C4", Name = "Asset4", CreatedBy = 1, Specification = "Spec4", Category = new Category { Code = "CAT4", CreatedBy = 1, Name = "Category4" } } }, // Should be filtered out (Declined)
                new Assignment { Id = 5, AssignedTo = 999, AssignedDate = today, State = AssignmentStateEnum.WaitingForAcceptance, CreatedBy = 1, Asset = new Asset { Id = 5, Code = "C5", Name = "Asset5", CreatedBy = 1, Specification = "Spec5", Category = new Category { Code = "CAT5", CreatedBy = 1, Name = "Category5" } } } // Should be filtered out (wrong user)
                };
            _dbContext.Assignments.AddRange(assignments);
            _dbContext.SaveChanges();

            var request = new GetListHomeAssignmentRequest
            {
                Page = 1,
                PageSize = 2,
                SortBy = "Id",
                Direction = "asc"
            };

            // Act
            var result = await _repository.GetHomeAssignmentsForUserAsync(request, userId);

            // Assert
            Assert.Equal(2, result.PageSize);
            Assert.Equal(2, result.Data.Count()); // Only Id 1 and 2 should match
            Assert.All(result.Data, a => Assert.Equal(userId, a.AssignedTo));
            Assert.All(result.Data, a => Assert.True(a.AssignedDate.Date <= today));
            Assert.All(result.Data, a => Assert.NotEqual(AssignmentStateEnum.Declined, a.State));
            Assert.All(result.Data, a => Assert.NotEqual(AssignmentStateEnum.Returned, a.State));
        }

        [Fact]
        public async Task GetAssignmentsAdminAsync_ReturnsAssignments_FilteredAndPaged()
        {
            // Arrange
            var locationId = 10;
            var today = DateTime.UtcNow.Date;
            var asset1 = new Asset { Id = 1, LocationId = locationId, Code = "A001", Name = "Asset1", CreatedBy = 1, Specification = "SpecA1", Category = new Category { Code = "CAT1", CreatedBy = 1, Name = "Category1" } };
            var asset2 = new Asset { Id = 2, LocationId = locationId, Code = "A002", Name = "Asset2", CreatedBy = 1, Specification = "SpecA2", Category = new Category { Code = "CAT2", CreatedBy = 1, Name = "Category2" } };
            var user1 = new User
            {
                Id = 1,
                Username = "user1",
                CreatedBy = 1,
                FirstName = "First1",
                LastName = "Last1",
                PasswordHash = "hash1",
                StaffCode = "S001"
            };
            var user2 = new User
            {
                Id = 2,
                Username = "user2",
                CreatedBy = 1,
                FirstName = "First2",
                LastName = "Last2",
                PasswordHash = "hash2",
                StaffCode = "S002"
            };
            var assignments = new List<Assignment>
            {
            new Assignment { Id = 1, Asset = asset1, AssignedToUser = user1, AssignedByUser = user2, AssignedDate = today, State = AssignmentStateEnum.WaitingForAcceptance, CreatedBy = 1 },
            new Assignment { Id = 2, Asset = asset2, AssignedToUser = user2, AssignedByUser = user1, AssignedDate = today, State = AssignmentStateEnum.Accepted, CreatedBy = 1 },
            new Assignment { Id = 3, Asset = new Asset { Id = 3, LocationId = 99, Code = "A003", Name = "OtherLocation", CreatedBy = 1, Specification = "SpecA3", Category = new Category { Code = "CAT3", CreatedBy = 1, Name = "Category3" } }, AssignedToUser = user1, AssignedByUser = user2, AssignedDate = today, State = AssignmentStateEnum.WaitingForAcceptance, CreatedBy = 1 },
            new Assignment { Id = 4, Asset = asset1, AssignedToUser = user1, AssignedByUser = user2, AssignedDate = today, State = AssignmentStateEnum.Returned, CreatedBy = 1 }
            };
            _dbContext.Assignments.AddRange(assignments);
            _dbContext.SaveChanges();

            var request = new GetListAssignmentAdminRequest
            {
                Page = 1,
                PageSize = 2,
                SortBy = "Id",
                Direction = "asc",
                KeySearch = "A00",
                State = new List<AssignmentStateEnum> { AssignmentStateEnum.WaitingForAcceptance, AssignmentStateEnum.Accepted },
                AssignedDate = today
            };

            // Act
            var result = await _repository.GetAssignmentsAdminAsync(request, locationId);

            // Assert
            Assert.Equal(2, result.PageSize);
            Assert.All(result.Data, a => Assert.Equal(locationId, a.Asset.LocationId));
            Assert.All(result.Data, a => Assert.NotEqual(AssignmentStateEnum.Returned, a.State));
            Assert.All(result.Data, a => Assert.Contains(a.Asset.Code, new[] { "A001", "A002" }));
        }
    }
}

