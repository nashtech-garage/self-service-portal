using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Dtos.Requests;
using Domain.Entities;
using Infrastructure.Database;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Test.Repositories
{
    public class UserRepositoryTest
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserRepository _repository;

        public UserRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var httpContextAccessor = new Microsoft.AspNetCore.Http.HttpContextAccessor();
            _dbContext = new ApplicationDbContext(options, httpContextAccessor);
            _repository = new UserRepository(_dbContext);
        }

        [Fact]
        public void Queryable_ReturnsDbSetAsQueryable()
        {
            // Arrange
            _dbContext.Users.AddRange(
                new User {
                    Id = 1,
                    Username = "admin",
                    FirstName = "Admin",
                    LastName = "User",
                    LocationId = 1,
                    UserType = Domain.Common.Enum.UserTypeEnum.Admin,
                    PasswordHash = "passwordHash",
                    StaffCode = "SD001",
                    CreatedBy = 1 },
                new User {
                    Id = 2,
                    Username = "staff",
                    FirstName = "Staff",
                    LastName = "User",
                    LocationId = 1,
                    UserType = Domain.Common.Enum.UserTypeEnum.Staff,
                    PasswordHash = "passwordHash",
                    StaffCode = "SD001",
                    CreatedBy = 1 }
            );
            _dbContext.SaveChanges();

            // Act
            var result = _repository.Queryable.ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, u => u.Username == "admin");
            Assert.Contains(result, u => u.Username == "staff");
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
            var user = new User
            {
                Id = 3,
                Username = "newuser",
                FirstName = "New",
                LastName = "User",
                LocationId = 2,
                UserType = Domain.Common.Enum.UserTypeEnum.Staff,
                PasswordHash = "passwordHash",
                StaffCode = "SD001",
                CreatedBy = 1
            };

            // Act
            var result = await _repository.AddAsync(user);
            await _dbContext.SaveChangesAsync();

            // Assert
            Assert.Contains(_dbContext.Users, u => u.Id == 3 && u.Username == "newuser");
            Assert.Equal(user, result);
        }

        [Fact]
        public async Task AddRangeAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.AddRangeAsync(new List<User>()));
        }

        [Fact]
        public async Task DeleteAsync_ByEntity_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteAsync(new User()));
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
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteRangeAsync(new List<User>()));
        }

        [Fact]
        public async Task DeleteRangeAsync_Ids_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteRangeAsync(new List<object>()));
        }

        [Fact]
        public async Task UpdateAsync_UpdatesEntityInDbSet()
        {
            // Arrange
            var user = new User {
                Id = 4,
                Username = "updateuser",
                FirstName = "Old",
                LastName = "Name",
                LocationId = 1,
                UserType = Domain.Common.Enum.UserTypeEnum.Staff,
                PasswordHash = "passwordHash",
                StaffCode = "SD001",
                CreatedBy = 1 };
            _dbContext.Users.Add(user);
            _dbContext.SaveChanges();

            // Act
            user.FirstName = "Updated";
            await _repository.UpdateAsync(user);
            await _dbContext.SaveChangesAsync();

            // Assert
            var updated = _dbContext.Users.First(u => u.Id == 4);
            Assert.Equal("Updated", updated.FirstName);
        }

        [Fact]
        public async Task UpdateRangeAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.UpdateRangeAsync(new List<User>()));
        }

        [Fact]
        public async Task GetPagedAsync_ReturnsPagedUsers_FilteredAndSorted()
        {
            // Arrange
            var admin = new User { Id = 10, Username = "admin", FirstName = "Admin", LastName = "User", LocationId = 100, UserType = Domain.Common.Enum.UserTypeEnum.Admin, StaffCode = "A01", CreatedBy = 1, PasswordHash = "passwordHash", };
            var staff1 = new User { Id = 11, Username = "staff1", FirstName = "Staff", LastName = "One", LocationId = 100, UserType = Domain.Common.Enum.UserTypeEnum.Staff, StaffCode = "S01", CreatedBy = 1, PasswordHash = "passwordHash", };
            var staff2 = new User { Id = 12, Username = "staff2", FirstName = "Staff", LastName = "Two", LocationId = 100, UserType = Domain.Common.Enum.UserTypeEnum.Staff, StaffCode = "S02", CreatedBy = 1, PasswordHash = "passwordHash", };
            var other = new User { Id = 13, Username = "other", FirstName = "Other", LastName = "User", LocationId = 200, UserType = Domain.Common.Enum.UserTypeEnum.Staff, StaffCode = "O01", CreatedBy = 1 , PasswordHash = "passwordHash",};
            _dbContext.Users.AddRange(admin, staff1, staff2, other);
            _dbContext.SaveChanges();

            var request = new GetListUserRequest
            {
                Page = 1,
                PageSize = 2,
                SortBy = "fullname",
                Direction = "asc",
                KeySearch = "staff",
                UserType = new List<Domain.Common.Enum.UserTypeEnum> { Domain.Common.Enum.UserTypeEnum.Staff }
            };

            // Act
            var (users, totalCount) = await _repository.GetPagedAsync(request, admin.Id);

            // Assert
            Assert.Equal(2, totalCount);
            Assert.All(users, u => Assert.Contains("staff", u.Username));
        }

        [Fact]
        public async Task GetAsync_ReturnsUserWithFilterAndInclude()
        {
            // Arrange
            var admin = new User { Id = 20, Username = "admin", FirstName = "Admin", LastName = "User", LocationId = 300, StaffCode = "SD001", UserType = Domain.Common.Enum.UserTypeEnum.Admin, CreatedBy = 1, PasswordHash = "passwordHash", };
            var staff = new User { Id = 21, Username = "staff", FirstName = "Staff", LastName = "User", LocationId = 300, StaffCode = "SD001", UserType = Domain.Common.Enum.UserTypeEnum.Staff, CreatedBy = 1, PasswordHash = "passwordHash", };
            _dbContext.Users.AddRange(admin, staff);
            _dbContext.SaveChanges();

            // Act
            var result = await _repository.GetAsync(admin.Id, u => u.Username == "staff");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("staff", result.Username);
        }

        [Fact]
        public async Task GetAsync_ReturnsNull_WhenUserNotInAdminLocation()
        {
            // Arrange
            var admin = new User { Id = 30, Username = "admin", FirstName = "Admin", LastName = "User", LocationId = 400, StaffCode = "SD001", UserType = Domain.Common.Enum.UserTypeEnum.Admin, CreatedBy = 1, PasswordHash = "passwordHash", };
            var staff = new User { Id = 31, Username = "staff", FirstName = "Staff", LastName = "User", LocationId = 401, StaffCode = "SD001", UserType = Domain.Common.Enum.UserTypeEnum.Staff, CreatedBy = 1, PasswordHash = "passwordHash", };
            _dbContext.Users.AddRange(admin, staff);
            _dbContext.SaveChanges();

            // Act
            var result = await _repository.GetAsync(admin.Id, u => u.Username == "staff");

            // Assert
            Assert.Null(result);
        }
    }
}