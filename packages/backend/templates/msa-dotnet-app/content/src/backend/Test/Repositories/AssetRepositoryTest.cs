using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Infrastructure.Database;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Test.Repositories
{
    public class AssetRepositoryTest
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly AssetRepository _repository;

        public AssetRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "AssetTestDb")
                .Options;
            var httpContextAccessor = new Microsoft.AspNetCore.Http.HttpContextAccessor();
            _dbContext = new ApplicationDbContext(options, httpContextAccessor);
            _repository = new AssetRepository(_dbContext);
        }

        [Fact]
        public void Queryable_ReturnsDbSetAsQueryable()
        {
            // Arrange
            _dbContext.Assets.AddRange(
                new Asset { Id = 1, Name = "Asset1", Code = "A001", CreatedBy = 1, Specification = "Spec1" },
                new Asset { Id = 2, Name = "Asset2", Code = "A002", CreatedBy = 1, Specification = "Spec2" }
            );
            _dbContext.SaveChanges();

            // Act
            var result = _repository.Queryable.ToList();

            // Assert
            Assert.Equal(4, result.Count);
            Assert.Equal("Asset3", result[0].Name);
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
            var asset = new Asset
            {
                Id = 3,
                Name = "Asset3",
                Code = "A003",
                Specification = "Spec3",
                CreatedBy = 1
            };

            // Act
            var result = await _repository.AddAsync(asset);
            await _dbContext.SaveChangesAsync();

            // Assert
            Assert.Contains(_dbContext.Assets, a => a.Id == 3 && a.Name == "Asset3");
            Assert.Equal(asset, result);
        }

        [Fact]
        public async Task UpdateAsync_UpdatesEntityInDbSet()
        {
            // Arrange
            var asset = new Asset
            {
                Id = 5,
                Name = "Asset5",
                Code = "A005",
                Specification = "Spec5s",
                CreatedBy = 1
            };
            _dbContext.Assets.Add(asset);
            _dbContext.SaveChanges();

            // Act
            asset.Name = "UpdatedAsset5";
            await _repository.UpdateAsync(asset);
            await _dbContext.SaveChangesAsync();

            // Assert
            var updated = _dbContext.Assets.First(a => a.Id == 5);
            Assert.Equal("UpdatedAsset5", updated.Name);
        }

        [Fact]
        public async Task AddRangeAsync_ThrowsNotImplementedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.AddRangeAsync(new List<Asset>()));
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
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.DeleteRangeAsync(new List<Asset>()));
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
            await Assert.ThrowsAsync<NotImplementedException>(() => _repository.UpdateRangeAsync(new List<Asset>()));
        }
    }
}