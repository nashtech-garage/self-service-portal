using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Infrastructure.Database;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Test.Repositories
{
    public class CategoryRepositoryTest
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly CategoryRepository _repository;

        public CategoryRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var httpContextAccessor = new Microsoft.AspNetCore.Http.HttpContextAccessor();
            _dbContext = new ApplicationDbContext(options, httpContextAccessor);
            _repository = new CategoryRepository(_dbContext);
        }

        [Fact]
        public void Queryable_ReturnsDbSetAsQueryable()
        {
            // Arrange
            _dbContext.Categories.AddRange(
                new Category { Id = 1, Name = "Laptop", Code = "LA", CreatedBy = 1 },
                new Category { Id = 2, Name = "Monitor", Code = "MO", CreatedBy = 1 }
            );
            _dbContext.SaveChanges();

            // Act
            var result = _repository.Queryable.ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, c => c.Name == "Laptop");
            Assert.Contains(result, c => c.Name == "Monitor");
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
            var category = new Category
            {
                Id = 3,
                Name = "Keyboard",
                Code = "KB",
                CreatedBy = 1
            };

            // Act
            var result = await _repository.AddAsync(category);
            await _dbContext.SaveChangesAsync();

            // Assert
            Assert.Contains(_dbContext.Categories, c => c.Id == 3 && c.Name == "Keyboard");
            Assert.Equal(category, result);
        }

        [Fact]
        public async Task AddRangeAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.AddRangeAsync(new List<Category>()));
        }

        [Fact]
        public async Task DeleteAsync_ByEntity_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteAsync(new Category()));
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
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteRangeAsync(new List<Category>()));
        }

        [Fact]
        public async Task DeleteRangeAsync_Ids_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteRangeAsync(new List<object>()));
        }

        [Fact]
        public async Task UpdateAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.UpdateAsync(new Category()));
        }

        [Fact]
        public async Task UpdateRangeAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.UpdateRangeAsync(new List<Category>()));
        }
    }
}