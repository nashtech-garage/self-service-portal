using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Exceptions;
using API.Services;
using AutoMapper;
using Domain.Common;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Moq;
using MockQueryable.Moq;
using Xunit;
using API.Services.Abstracts;
using MockQueryable;
using Microsoft.Extensions.Logging;
using System.Threading;

namespace Test.Services
{
    public class HomeServiceTest
    {
        private readonly Mock<IAssignmentRepository> _assignmentRepositoryMock;
        private readonly Mock<IReturningRequestRepository> _returningRequestRepositoryMock;
        private readonly Mock<ICurrentUserContext> _currentUserContextMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<ILogger<HomeService>> _loggerMock;
        private readonly HomeService _homeService;

        public HomeServiceTest()
        {
            _assignmentRepositoryMock = new Mock<IAssignmentRepository>();
            _returningRequestRepositoryMock = new Mock<IReturningRequestRepository>();
            _currentUserContextMock = new Mock<ICurrentUserContext>();
            _mapperMock = new Mock<IMapper>();
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _loggerMock = new Mock<ILogger<HomeService>>();

            _currentUserContextMock.SetupGet(c => c.UserId).Returns(1);
            _assignmentRepositoryMock.Setup(r => r.UnitOfWork).Returns(_unitOfWorkMock.Object);
            _returningRequestRepositoryMock.Setup(r => r.UnitOfWork).Returns(_unitOfWorkMock.Object);

            _homeService = new HomeService(
                _assignmentRepositoryMock.Object,
                _returningRequestRepositoryMock.Object,
                _currentUserContextMock.Object,
                _mapperMock.Object,
                _loggerMock.Object
            );
        }

        [Fact]
        public async Task GetMyAssignmentsAsync_ReturnsAssignmentsWithReturningFlag()
        {
            // Arrange
            var request = new GetListHomeAssignmentRequest();
            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    Asset = new Asset { Code = "A1", Name = "Asset1", Category = new Category { Name = "Cat1" } },
                    AssignedDate = DateTime.Today,
                    State = AssignmentStateEnum.WaitingForAcceptance
                },
                new Assignment
                {
                    Id = 2,
                    Asset = new Asset { Code = "A2", Name = "Asset2", Category = new Category { Name = "Cat2" } },
                    AssignedDate = DateTime.Today,
                    State = AssignmentStateEnum.Accepted
                }
            };
            var paginationData = new PaginationData<Assignment>(assignments, 10, 1, 2);

            _assignmentRepositoryMock
                .Setup(r => r.GetHomeAssignmentsForUserAsync(request, 1))
                .ReturnsAsync(paginationData);

            var returningRequests = new List<ReturningRequest>
            {
                new ReturningRequest { Id = 1, AssignmentId = 2 }
            }.AsQueryable().BuildMock();

            _returningRequestRepositoryMock
                .Setup(r => r.GetReturningAssignmentIdsAsync(It.IsAny<List<int>>()))
                .ReturnsAsync(new List<int> { 2 });

            _mapperMock
                .Setup(m => m.Map<List<ListBasicHomeAssignmentResponse>>(It.IsAny<IEnumerable<Assignment>>()))
                .Returns((IEnumerable<Assignment> src) => src.Select(a => new ListBasicHomeAssignmentResponse
                {
                    Id = a.Id,
                    AssetCode = a.Asset?.Code ?? string.Empty,
                    AssetName = a.Asset?.Name ?? string.Empty,
                    AssetCategoryName = a.Asset?.Category?.Name ?? string.Empty,
                    AssignedDate = a.AssignedDate,
                    State = a.State,
                    IsReturningRequested = false // will be set by the service after mapping
                }).ToList());

            // Act
            var result = await _homeService.GetMyAssignmentsAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Data.Count());
            var list = result.Data.ToList();
            Assert.False(list.First(a => a.Id == 1).IsReturningRequested);
            Assert.True(list.First(a => a.Id == 2).IsReturningRequested);
        }

        [Fact]
        public async Task GetMyAssignmentsAsync_ReturnsEmpty_WhenNoAssignments()
        {
            // Arrange
            var request = new GetListHomeAssignmentRequest();
            var paginationData = new PaginationData<Assignment>(new List<Assignment>(), 10, 1, 0);

            _assignmentRepositoryMock
                .Setup(r => r.GetHomeAssignmentsForUserAsync(request, 1))
                .ReturnsAsync(paginationData);

            var returningRequests = new List<ReturningRequest>().AsQueryable().BuildMock();
            _returningRequestRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(returningRequests);

            // Act
            var result = await _homeService.GetMyAssignmentsAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result.Data);
        }

        [Theory]
        [InlineData("assetcode", "Asset.Code")]
        [InlineData("assetname", "Asset.Name")]
        [InlineData("assetcategoryname", "Asset.Category.Name")]
        [InlineData("assigneddate", "AssignedDate")]
        [InlineData("state", "State")]
        public async Task GetMyAssignmentsAsync_HandlesSortFields_Correctly(string inputSort, string expectedSort)
        {
            // Arrange
            var request = new GetListHomeAssignmentRequest
            {
                SortBy = inputSort
            };

            var paginationData = new PaginationData<Assignment>(new List<Assignment>(), 10, 1, 0);

            _assignmentRepositoryMock
                .Setup(r => r.GetHomeAssignmentsForUserAsync(
                    It.Is<GetListHomeAssignmentRequest>(req => req.SortBy == expectedSort),
                    1))
                .ReturnsAsync(paginationData);

            // Act
            var result = await _homeService.GetMyAssignmentsAsync(request);

            // Assert
            _assignmentRepositoryMock.Verify(
                r => r.GetHomeAssignmentsForUserAsync(
                    It.Is<GetListHomeAssignmentRequest>(req => req.SortBy == expectedSort),
                    1),
                Times.Once);
        }

        [Fact]
        public async Task GetMyAssignmentsAsync_ThrowsBadRequest_WhenInvalidSortField()
        {
            // Arrange
            var request = new GetListHomeAssignmentRequest
            {
                SortBy = "invalidField"
            };

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() =>
                _homeService.GetMyAssignmentsAsync(request));
        }

        [Fact]
        public async Task GetMyAssignmentsAsync_HandlesNoReturningRequests()
        {
            // Arrange
            var request = new GetListHomeAssignmentRequest();
            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    Asset = new Asset { Code = "A1", Name = "Asset1", Category = new Category { Name = "Cat1" } },
                    AssignedDate = DateTime.Today,
                    State = AssignmentStateEnum.Accepted
                }
            };
            var paginationData = new PaginationData<Assignment>(assignments, 10, 1, 1);

            _assignmentRepositoryMock
                .Setup(r => r.GetHomeAssignmentsForUserAsync(request, 1))
                .ReturnsAsync(paginationData);

            _returningRequestRepositoryMock
                .Setup(r => r.GetReturningAssignmentIdsAsync(It.IsAny<List<int>>()))
                .ReturnsAsync(new List<int>());

            _mapperMock
                .Setup(m => m.Map<List<ListBasicHomeAssignmentResponse>>(It.IsAny<IEnumerable<Assignment>>()))
                .Returns((IEnumerable<Assignment> src) => src.Select(a => new ListBasicHomeAssignmentResponse
                {
                    Id = a.Id,
                    IsReturningRequested = false
                }).ToList());

            // Act
            var result = await _homeService.GetMyAssignmentsAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result.Data);
            Assert.False(result.Data.First().IsReturningRequested);
        }

        [Fact]
        public async Task GetMyAssignmentDetailAsync_ReturnsDetail_WhenAssignmentExists()
        {
            // Arrange
            int assignmentId = 1;
            var assignment = new Assignment
            {
                Id = assignmentId,
                AssignedTo = 1,
                Asset = new Asset { Code = "A1", Name = "Asset1", Category = new Category { Name = "Cat1" } }
            };
            var assignments = new List<Assignment> { assignment }.AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            var mappedDetail = new DetailHomeAssignmentResponse { Id = assignmentId };
            _mapperMock
                .Setup(m => m.Map<DetailHomeAssignmentResponse>(It.IsAny<Assignment>()))
                .Returns(mappedDetail);

            // Act
            var result = await _homeService.GetMyAssignmentDetailAsync(assignmentId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(assignmentId, result.Id);
        }

        [Fact]
        public async Task GetMyAssignmentDetailAsync_ThrowsNotFound_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 99;
            var assignments = new List<Assignment>().AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(
                async () => await _homeService.GetMyAssignmentDetailAsync(assignmentId)
            );
        }

        [Fact]
        public async Task UpdateMyAssignmentStateAsync_UpdatesState_WhenValid()
        {
            // Arrange
            int assignmentId = 1;
            var assignment = new Assignment
            {
                Id = assignmentId,
                AssignedTo = 1,
                State = AssignmentStateEnum.WaitingForAcceptance,
                Asset = new Asset { Code = "A1", Name = "Asset1", Category = new Category { Name = "Cat1" }, State = AssetStateEnum.Assigned }
            };
            var assignments = new List<Assignment> { assignment }.AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            _assignmentRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<Assignment>()))
                .Returns(Task.CompletedTask);

            // Act
            await _homeService.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Accepted);

            // Assert
            _assignmentRepositoryMock.Verify(r => r.UpdateAsync(It.Is<Assignment>(a =>
                a.State == AssignmentStateEnum.Accepted)), Times.Once);
            Assert.Equal(AssetStateEnum.Assigned, assignment.Asset.State);
        }

        [Fact]
        public async Task UpdateMyAssignmentStateAsync_UpdatesAssetStateToAvailable_WhenDeclined()
        {
            // Arrange
            int assignmentId = 1;
            var assignment = new Assignment
            {
                Id = assignmentId,
                AssignedTo = 1,
                State = AssignmentStateEnum.WaitingForAcceptance,
                Asset = new Asset { Code = "A1", Name = "Asset1", Category = new Category { Name = "Cat1" }, State = AssetStateEnum.Assigned }
            };
            var assignments = new List<Assignment> { assignment }.AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            _assignmentRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<Assignment>()))
                .Returns(Task.CompletedTask);

            // Act
            await _homeService.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Declined);

            // Assert
            _assignmentRepositoryMock.Verify(r => r.UpdateAsync(It.Is<Assignment>(a =>
                a.State == AssignmentStateEnum.Declined)), Times.Once);
            Assert.Equal(AssetStateEnum.Available, assignment.Asset.State);
        }

        [Fact]
        public async Task UpdateMyAssignmentStateAsync_ThrowsNotFound_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 99;
            var assignments = new List<Assignment>().AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() =>
                _homeService.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Accepted));
        }

        [Fact]
        public async Task UpdateMyAssignmentStateAsync_ThrowsBadRequest_WhenAssignmentNotWaiting()
        {
            // Arrange
            int assignmentId = 1;
            var assignment = new Assignment
            {
                Id = assignmentId,
                AssignedTo = 1,
                State = AssignmentStateEnum.Accepted
            };
            var assignments = new List<Assignment> { assignment }.AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() =>
                _homeService.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Declined));
        }

        [Fact]
        public async Task CreateReturningRequestAsync_CreatesRequest_WhenValid()
        {
            // Arrange
            int assignmentId = 1;
            var assignment = new Assignment
            {
                Id = assignmentId,
                AssignedTo = 1,
                State = AssignmentStateEnum.Accepted
            };
            var assignments = new List<Assignment> { assignment }.AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            var returningRequests = new List<ReturningRequest>().AsQueryable().BuildMock();
            _returningRequestRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(returningRequests);

            // Act
            await _homeService.CreateReturningRequestAsync(assignmentId);

            // Assert
            _returningRequestRepositoryMock.Verify(r => r.AddAsync(It.Is<ReturningRequest>(req =>
                req.AssignmentId == assignmentId &&
                req.RequestedBy == 1 &&
                req.State == ReturningRequestStateEnum.WaitingForReturning)));

            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()));
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsNotFound_WhenAssignmentNotFound()
        {
            // Arrange
            int assignmentId = 99;
            var assignments = new List<Assignment>().AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() =>
                _homeService.CreateReturningRequestAsync(assignmentId));
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsBadRequest_WhenAssignmentNotAccepted()
        {
            // Arrange
            int assignmentId = 1;
            var assignment = new Assignment
            {
                Id = assignmentId,
                AssignedTo = 1,
                State = AssignmentStateEnum.WaitingForAcceptance
            };
            var assignments = new List<Assignment> { assignment }.AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() =>
                _homeService.CreateReturningRequestAsync(assignmentId));
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsBadRequest_WhenUserNotAssignee()
        {
            // Arrange
            int assignmentId = 1;
            var assignment = new Assignment
            {
                Id = assignmentId,
                AssignedTo = 2, // Different user
                State = AssignmentStateEnum.Accepted
            };
            var assignments = new List<Assignment> { assignment }.AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() =>
                _homeService.CreateReturningRequestAsync(assignmentId));
        }

        [Fact]
        public async Task CreateReturningRequestAsync_ThrowsBadRequest_WhenRequestAlreadyExists()
        {
            // Arrange
            int assignmentId = 1;
            var assignment = new Assignment
            {
                Id = assignmentId,
                AssignedTo = 1,
                State = AssignmentStateEnum.Accepted
            };
            var assignments = new List<Assignment> { assignment }.AsQueryable().BuildMock();

            _assignmentRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(assignments);

            var existingRequest = new ReturningRequest
            {
                Id = 1,
                AssignmentId = assignmentId,
                State = ReturningRequestStateEnum.WaitingForReturning
            };
            var returningRequests = new List<ReturningRequest> { existingRequest }.AsQueryable().BuildMock();

            _returningRequestRepositoryMock
                .Setup(r => r.Queryable)
                .Returns(returningRequests);

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() =>
                _homeService.CreateReturningRequestAsync(assignmentId));
        }

        [Fact]
        public void ConstructorTest_ThrowsException_WhenNullParameters()
        {
            // Arrange & Act & Assert
            Assert.Throws<ArgumentNullException>(() => new HomeService(
                null!,
                _returningRequestRepositoryMock.Object,
                _currentUserContextMock.Object,
                _mapperMock.Object,
                _loggerMock.Object
            ));

            Assert.Throws<ArgumentNullException>(() => new HomeService(
                _assignmentRepositoryMock.Object,
                null!,
                _currentUserContextMock.Object,
                _mapperMock.Object,
                _loggerMock.Object
            ));

            Assert.Throws<ArgumentNullException>(() => new HomeService(
                _assignmentRepositoryMock.Object,
                _returningRequestRepositoryMock.Object,
                null!,
                _mapperMock.Object,
                _loggerMock.Object
            ));

            Assert.Throws<ArgumentNullException>(() => new HomeService(
                _assignmentRepositoryMock.Object,
                _returningRequestRepositoryMock.Object,
                _currentUserContextMock.Object,
                null!,
                _loggerMock.Object
            ));

            Assert.Throws<ArgumentNullException>(() => new HomeService(
                _assignmentRepositoryMock.Object,
                _returningRequestRepositoryMock.Object,
                _currentUserContextMock.Object,
                _mapperMock.Object,
                null!
            ));
        }
    }
}