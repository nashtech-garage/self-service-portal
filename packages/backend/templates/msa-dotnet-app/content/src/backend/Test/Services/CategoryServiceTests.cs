using API.Services;
using AutoMapper;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Domain.Repositories;
using Moq;
using MockQueryable.Moq;
using Xunit;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Exceptions;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using MockQueryable;

namespace Test.Services
{
    public class CategoryServiceTests
    {
        private readonly Mock<ICategoryRepository> _categoryRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly CategoryService _service;

        public CategoryServiceTests()
        {
            _categoryRepoMock = new Mock<ICategoryRepository>();
            _mapperMock = new Mock<IMapper>();
            _service = new CategoryService(_categoryRepoMock.Object, _mapperMock.Object);
        }

        [Fact]
        public async Task CreateCategoryAsync_ShouldThrow_WhenCategoryNameExists()
        {
            // Arrange
            var request = new CreateCategoryRequest { Category = "Books", Prefix = "BK" };
            _categoryRepoMock.Setup(r => r.Queryable)
                .Returns(new List<Category> {
                new Category { Name = "Books", IsDeleted = false }
                }.AsQueryable());

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() => _service.CreateCategoryAsync(request));
        }

        [Fact]
        public async Task CreateCategoryAsync_ShouldThrow_WhenPrefixExists()
        {
            // Arrange
            var request = new CreateCategoryRequest { Category = "Music", Prefix = "BK" };
            _categoryRepoMock.Setup(r => r.Queryable)
                .Returns(new List<Category> {
                new Category { Name = "Books", Code = "BK", IsDeleted = false }
                }.AsQueryable());

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() => _service.CreateCategoryAsync(request));
        }

        [Fact]
        public async Task CreateCategoryAsync_ShouldAddCategory_WhenValid()
        {
            // Arrange
            var request = new CreateCategoryRequest { Category = "Movies", Prefix = "MV" };
            var categoryEntity = new Category { Name = "Movies", Code = "MV" };

            _categoryRepoMock.Setup(r => r.Queryable)
                .Returns(new List<Category>().AsQueryable());
            _mapperMock.Setup(m => m.Map<Category>(request))
                .Returns(categoryEntity);
            _categoryRepoMock.Setup(r => r.AddAsync(categoryEntity));
            _categoryRepoMock.Setup(u => u.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            // Act
            await _service.CreateCategoryAsync(request);

            // Assert
            _categoryRepoMock.Verify(r => r.AddAsync(It.IsAny<Category>()), Times.Once);
            _categoryRepoMock.Verify(r => r.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetCategoriesAsync_ShouldReturnMappedOptions()
        {
            // Arrange
            var categories = new List<Category>
               {
                   new Category { Id = 1, Name = "Books" },
                   new Category { Id = 2, Name = "Music" }
               }.AsQueryable().BuildMock();

            _categoryRepoMock.Setup(r => r.Queryable)
                .Returns(categories);

            _mapperMock.Setup(m => m.Map<IEnumerable<OptionResponse>>(It.IsAny<List<Category>>()))
                .Returns(new List<OptionResponse> {
               new OptionResponse { Value = 1, Name = "Books" },
               new OptionResponse { Value = 2, Name = "Music" }
                });

            // Act
            var result = await _service.GetCategoriesAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }


    }
}
