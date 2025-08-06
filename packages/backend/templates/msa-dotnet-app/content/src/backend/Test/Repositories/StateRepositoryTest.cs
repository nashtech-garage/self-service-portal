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
    public class StateRepositoryTest
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly StateRepository _repository;

        public StateRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var httpContextAccessor = new Microsoft.AspNetCore.Http.HttpContextAccessor();
            _dbContext = new ApplicationDbContext(options, httpContextAccessor);
            _repository = new StateRepository(_dbContext);
        }

        [Fact]
        public void Queryable_ReturnsDbSetAsQueryable()
        {
            // Arrange
            _dbContext.States.AddRange(
                new State { Id = 1, Name = "Available", TypeEntity = "Asset", Action = "View" },
                new State { Id = 2, Name = "Assigned", TypeEntity = "Asset", Action = "View" }
            );
            _dbContext.SaveChanges();

            // Act
            var result = _repository.Queryable.ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, s => s.Name == "Available");
            Assert.Contains(result, s => s.Name == "Assigned");
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
            var state = new State
            {
                Id = 3,
                Name = "NotAvailable",
                TypeEntity = "Asset",
                Action = "View"
            };

            // Act
            var result = await _repository.AddAsync(state);
            await _dbContext.SaveChangesAsync();

            // Assert
            Assert.Contains(_dbContext.States, s => s.Id == 3 && s.Name == "NotAvailable");
            Assert.Equal(state, result);
        }

        [Fact]
        public async Task AddRangeAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.AddRangeAsync(new List<State>()));
        }

        [Fact]
        public async Task DeleteAsync_ByEntity_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteAsync(new State()));
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
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteRangeAsync(new List<State>()));
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
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.UpdateAsync(new State()));
        }

        [Fact]
        public async Task UpdateRangeAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.UpdateRangeAsync(new List<State>()));
        }
    }
}