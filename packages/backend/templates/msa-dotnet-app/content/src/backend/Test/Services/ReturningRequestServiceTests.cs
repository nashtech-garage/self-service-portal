using API.Exceptions;
using API.Services;
using API.Services.Abstracts;
using AutoMapper;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Domain.Repositories;
using MockQueryable;
using Moq;

namespace Test.Services
{
    public class ReturningRequestServiceTests
    {
        private readonly Mock<IMapper> _mapperMock = new Mock<IMapper>();
        private readonly Mock<ICurrentUserContext> _currentUserContextMock = new Mock<ICurrentUserContext>();
        private readonly Mock<IUserRepository> _userRepositoryMock = new Mock<IUserRepository>();
        private readonly Mock<IReturningRequestRepository> _returningRequestRepositoryMock = new Mock<IReturningRequestRepository>();
        private readonly Mock<IAssignmentRepository> _assignmentRepositoryMock = new Mock<IAssignmentRepository>();
        private readonly Mock<IAssetRepository> _assetRepositoryMock = new Mock<IAssetRepository>();
        private readonly ReturningRequestService _service;

        public ReturningRequestServiceTests()
        {
            _service = new ReturningRequestService(
                _mapperMock.Object,
                _currentUserContextMock.Object,
                _userRepositoryMock.Object,
                _returningRequestRepositoryMock.Object,
                _assignmentRepositoryMock.Object,
                _assetRepositoryMock.Object
            );
        }

        [Fact]
        public async Task GetReturningRequestsAsync_ShouldThrowNotFoundException_WhenUserNotFound()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);
            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User>().AsQueryable().BuildMock());

            var request = new GetListReturningRequest();

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _service.GetReturningRequestsAsync(request));
        }

        [Fact]
        public async Task CancelReturningRequestStateAsync_ShouldThrowNotFoundException_WhenReturningRequestNotFound()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);
            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User> { new User { Id = 1 } }.AsQueryable().BuildMock());

            _returningRequestRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<ReturningRequest>().AsQueryable().BuildMock());

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CancelReturningRequestStateAsync(1));
        }

        [Fact]
        public async Task CompleteReturningRequestAsync_ShouldThrowNotFoundException_WhenAssignmentNotFound()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);
            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User> { new User { Id = 1 } }.AsQueryable().BuildMock());

            _returningRequestRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<ReturningRequest>
                {
            new ReturningRequest { Id = 1, State = ReturningRequestStateEnum.WaitingForReturning, AssignmentId = 1 }
                }.AsQueryable().BuildMock());

            _assignmentRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<Assignment>().AsQueryable().BuildMock());

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _service.CompleteReturningRequestAsync(1));
        }

        [Fact]
        public async Task CompleteReturningRequestAsync_ShouldThrowNotFoundException_WhenAssetNotFound()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);
            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User> { new User { Id = 1 } }.AsQueryable().BuildMock());

            _returningRequestRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<ReturningRequest>
                {
            new ReturningRequest { Id = 1, State = ReturningRequestStateEnum.WaitingForReturning, AssignmentId = 1 }
                }.AsQueryable().BuildMock());

            _assignmentRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<Assignment>
                {
            new Assignment { Id = 1, AssetId = 1 }
                }.AsQueryable().BuildMock());

            _assetRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<Asset>().AsQueryable().BuildMock());

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _service.CompleteReturningRequestAsync(1));
        }


        [Fact]
        public async Task CompleteReturningRequestAsync_ShouldUpdateReturningRequestAndAssetState_WhenSuccessful()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);
            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User> { new User { Id = 1 } }.AsQueryable().BuildMock());

            _returningRequestRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<ReturningRequest>
                {
            new ReturningRequest { Id = 1, State = ReturningRequestStateEnum.WaitingForReturning, AssignmentId = 1 }
                }.AsQueryable().BuildMock());

            _assignmentRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<Assignment>
                {
            new Assignment { Id = 1, AssetId = 1 }
                }.AsQueryable().BuildMock());

            _assetRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<Asset>
                {
            new Asset { Id = 1 }
                }.AsQueryable().BuildMock());

            _returningRequestRepositoryMock.Setup(x => x.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(1));

            // Act
            await _service.CompleteReturningRequestAsync(1);

            // Assert
            _returningRequestRepositoryMock.Verify(x => x.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetReturningRequestsAsync_ShouldReturnRequests_WhenUserExists()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);

            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User> { new User { Id = 1, LocationId = 10 } }.AsQueryable().BuildMock());

            var returningRequests = new List<ReturningRequest>
            {
                new ReturningRequest { Id = 1, State = ReturningRequestStateEnum.WaitingForReturning },
                new ReturningRequest { Id = 2, State = ReturningRequestStateEnum.Completed }
            };

            _returningRequestRepositoryMock.Setup(x => x.Queryable)
                .Returns(returningRequests.AsQueryable().BuildMock());

            var repoResponse = new PaginationData<ReturningRequest>(returningRequests, 10, 1, 2);
            _returningRequestRepositoryMock.Setup(x => x.GetReturningRequestsAsync(
                It.IsAny<GetListReturningRequest>(), It.IsAny<int>()))
                .ReturnsAsync(repoResponse);

            var responseItems = new List<ListBasicReturningResponse>
            {
                new ListBasicReturningResponse { Id = 1 },
                new ListBasicReturningResponse { Id = 2 }
            };
            var paginationResponse = new PaginationData<ListBasicReturningResponse>(responseItems, 10, 1, 2);

            _mapperMock.Setup(m => m.Map<IEnumerable<ListBasicReturningResponse>>(It.IsAny<IEnumerable<ReturningRequest>>()))
                .Returns(responseItems);

            _mapperMock.Setup(m => m.Map<PaginationData<ListBasicReturningResponse>>(It.IsAny<object>()))
                .Returns(paginationResponse);

            var request = new GetListReturningRequest();

            // Act
            var result = await _service.GetReturningRequestsAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Total);
        }

        [Fact]
        public async Task CompleteReturningRequestAsync_ShouldThrowInvalidOperationException_WhenRequestAlreadyCompleted()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);
            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User> { new User { Id = 1 } }.AsQueryable().BuildMock());

            _returningRequestRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<ReturningRequest>
                {
            new ReturningRequest { Id = 1, State = ReturningRequestStateEnum.Completed }
                }.AsQueryable().BuildMock());

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CompleteReturningRequestAsync(1));
        }

        [Fact]
        public async Task CancelReturningRequestStateAsync_ShouldSetDeletedFlagAndSave_WhenValid()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);
            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User> { new User { Id = 1 } }.AsQueryable().BuildMock());

            var returningRequest = new ReturningRequest
            {
                Id = 1,
                State = ReturningRequestStateEnum.WaitingForReturning
            };

            var mockQueryable = new List<ReturningRequest> { returningRequest }.AsQueryable().BuildMock();
            _returningRequestRepositoryMock.Setup(x => x.Queryable)
                .Returns(mockQueryable);

            _returningRequestRepositoryMock.Setup(x => x.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            // Act
            await _service.CancelReturningRequestStateAsync(1);

            // Assert
            Assert.True(returningRequest.IsDeleted);
            _returningRequestRepositoryMock.Verify(x => x.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
        [Fact]
        public async Task GetReturningRequestsAsync_ShouldFilter_WhenKeySearchProvided()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);
            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User> { new User { Id = 1, LocationId = 10 } }.AsQueryable().BuildMock());

            var request = new GetListReturningRequest { KeySearch = "search term" };

            _returningRequestRepositoryMock.Setup(x => x.GetReturningRequestsAsync(
                It.Is<GetListReturningRequest>(r => r.KeySearch == "search term"), It.IsAny<int>()))
                .ReturnsAsync(new PaginationData<ReturningRequest>(new List<ReturningRequest>(), 10, 1, 0));

            _mapperMock.Setup(m => m.Map<PaginationData<ListBasicReturningResponse>>(It.IsAny<object>()))
                .Returns(new PaginationData<ListBasicReturningResponse>(new List<ListBasicReturningResponse>(), 10, 1, 0));

            // Act
            await _service.GetReturningRequestsAsync(request);

            // Assert
            _returningRequestRepositoryMock.Verify(x => x.GetReturningRequestsAsync(
                It.Is<GetListReturningRequest>(r => r.KeySearch == "search term"), It.IsAny<int>()), Times.Once);
        }

        [Fact]
        public async Task CancelReturningRequestStateAsync_ShouldThrowInvalidOperationException_WhenStateIsAlreadyCompleted()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);
            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User> { new User { Id = 1 } }.AsQueryable().BuildMock());

            _returningRequestRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<ReturningRequest>
                {
            new ReturningRequest
            {
                Id = 1,
                State = ReturningRequestStateEnum.Completed
            }
                }.AsQueryable().BuildMock());

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CancelReturningRequestStateAsync(1));
        }

        [Fact]
        public async Task CompleteReturningRequestAsync_ShouldUpdateAssignmentState()
        {
            // Arrange
            _currentUserContextMock.Setup(x => x.UserId).Returns(1);
            _userRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<User> { new User { Id = 1 } }.AsQueryable().BuildMock());

            var assignment = new Assignment
            {
                Id = 1,
                AssetId = 1,
                State = AssignmentStateEnum.Accepted
            };

            _returningRequestRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<ReturningRequest>
                {
            new ReturningRequest
            {
                Id = 1,
                State = ReturningRequestStateEnum.WaitingForReturning,
                AssignmentId = 1
            }
                }.AsQueryable().BuildMock());

            _assignmentRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<Assignment> { assignment }.AsQueryable().BuildMock());

            _assetRepositoryMock.Setup(x => x.Queryable)
                .Returns(new List<Asset> { new Asset { Id = 1 } }.AsQueryable().BuildMock());

            _returningRequestRepositoryMock.Setup(x => x.UnitOfWork.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            // Act
            await _service.CompleteReturningRequestAsync(1);

            // Assert
            Assert.Equal(AssignmentStateEnum.Returned, assignment.State);
        }
    }
}