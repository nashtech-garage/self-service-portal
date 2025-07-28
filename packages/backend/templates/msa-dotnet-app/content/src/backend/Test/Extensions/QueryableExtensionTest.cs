using Domain.Common;
using Domain.Common.Constants;
using Domain.Entities;

namespace Test.Extensions
{
    public class QueryableExtensionTest
    {
        private class TestEntity : BaseEntity
        {
            public string Name { get; set; }
            public TestEnum Status { get; set; }
        }

        private enum TestEnum
        {
            First = 1,
            Second = 2
        }

        private class UserEntity : User
        {
        }

        [Fact]
        public void WithoutDeleted_FiltersOutDeletedEntities()
        {
            var data = new List<TestEntity>
            {
                new TestEntity { Id = 1, IsDeleted = false },
                new TestEntity { Id = 2, IsDeleted = true },
                new TestEntity { Id = 3, IsDeleted = false }
            }.AsQueryable();

            var result = data.WithoutDeleted().ToList();

            Assert.Equal(2, result.Count);
            Assert.DoesNotContain(result, e => e.IsDeleted);
        }

        [Fact]
        public void WithDeleted_ReturnsOnlyDeletedEntities()
        {
            var data = new List<TestEntity>
            {
                new TestEntity { Id = 1, IsDeleted = false },
                new TestEntity { Id = 2, IsDeleted = true },
                new TestEntity { Id = 3, IsDeleted = true }
            }.AsQueryable();

            var result = data.WithDeleted().ToList();

            Assert.Equal(2, result.Count);
            Assert.All(result, e => Assert.True(e.IsDeleted));
        }

        [Fact]
        public void WithoutDisabledUser_FiltersOutDisabledUsers()
        {
            var data = new List<UserEntity>
            {
                new UserEntity { Id = 1, IsDisable = false },
                new UserEntity { Id = 2, IsDisable = true },
                new UserEntity { Id = 3, IsDisable = false }
            }.AsQueryable();

            var result = data.WithoutDisabledUser().ToList();

            Assert.Equal(2, result.Count);
            Assert.DoesNotContain(result, u => u.IsDisable);
        }

        [Fact]
        public void ApplySorting_SortsByStringAscending()
        {
            var data = new List<TestEntity>
            {
                new TestEntity { Id = 1, Name = "Charlie" },
                new TestEntity { Id = 2, Name = "Bravo" },
                new TestEntity { Id = 3, Name = "Alpha" }
            }.AsQueryable();

            var result = data.ApplySorting("Name", PaginationConstants.ASCENDING).ToList();

            Assert.Equal(new[] { "Alpha", "Bravo", "Charlie" }, result.Select(x => x.Name));
        }

        [Fact]
        public void ApplySorting_SortsByStringDescending()
        {
            var data = new List<TestEntity>
            {
                new TestEntity { Id = 1, Name = "Charlie" },
                new TestEntity { Id = 2, Name = "Bravo" },
                new TestEntity { Id = 3, Name = "Alpha" }
            }.AsQueryable();

            var result = data.ApplySorting("Name", PaginationConstants.DESCENDING).ToList();

            Assert.Equal(new[] { "Charlie", "Bravo", "Alpha" }, result.Select(x => x.Name));
        }

        [Fact]
        public void ApplySorting_SortsByEnumAsString()
        {
            var data = new List<TestEntity>
            {
                new TestEntity { Id = 1, Status = TestEnum.Second },
                new TestEntity { Id = 2, Status = TestEnum.First },
                new TestEntity { Id = 3, Status = TestEnum.Second }
            }.AsQueryable();

            var result = data.ApplySorting("Status", PaginationConstants.ASCENDING).ToList();

            // "First" < "Second" lexicographically
            Assert.Equal(TestEnum.First, result[0].Status);
            Assert.Equal(TestEnum.Second, result[1].Status);
            Assert.Equal(TestEnum.Second, result[2].Status);
        }

        [Fact]
        public void ApplySorting_ThrowsIfPropertyNotFound()
        {
            var data = new List<TestEntity>
            {
                new TestEntity { Id = 1, Name = "A" }
            }.AsQueryable();

            Assert.Throws<ArgumentException>(() => data.ApplySorting("NonExistent", PaginationConstants.ASCENDING).ToList());
        }

        [Fact]
        public void ApplySorting_ThenByDescendingId()
        {
            var data = new List<TestEntity>
            {
                new TestEntity { Id = 2, Name = "Alpha" },
                new TestEntity { Id = 1, Name = "Alpha" },
                new TestEntity { Id = 3, Name = "Bravo" }
            }.AsQueryable();

            var result = data.ApplySorting("Name", PaginationConstants.ASCENDING).ToList();

            // Both "Alpha" entries, Id 2 should come before Id 1 due to ThenByDescending
            Assert.Equal(2, result[0].Id);
            Assert.Equal(1, result[1].Id);
            Assert.Equal(3, result[2].Id);
        }

        [Fact]
        public void ApplySorting_EmptySortBy_ReturnsOriginal()
        {
            var data = new List<TestEntity>
            {
                new TestEntity { Id = 1, Name = "A" }
            }.AsQueryable();

            var result = data.ApplySorting("", PaginationConstants.ASCENDING).ToList();

            Assert.Single(result);
            Assert.Equal(1, result[0].Id);
        }
    }
}