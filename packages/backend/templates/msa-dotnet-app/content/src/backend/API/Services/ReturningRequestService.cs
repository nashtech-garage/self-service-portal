using API.Exceptions;
using API.Services.Abstracts;
using AutoMapper;
using Domain.Common;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Repositories;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class ReturningRequestService : IReturningRequestService
    {
        private readonly IMapper _mapper;
        private readonly ICurrentUserContext _currentUserContext;
        private readonly IUserRepository _userRepository;
        private readonly IReturningRequestRepository _returningRequestRepository;
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IAssetRepository _assetRepository;

        public ReturningRequestService(
            IMapper mapper,
            ICurrentUserContext currentUserContext,
            IUserRepository userRepository,
            IReturningRequestRepository returningRequestRepository,
            IAssignmentRepository assignmentRepository,
            IAssetRepository assetRepository)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _currentUserContext = currentUserContext ?? throw new ArgumentNullException(nameof(currentUserContext));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _returningRequestRepository = returningRequestRepository ?? throw new ArgumentNullException(nameof(returningRequestRepository));
            _assignmentRepository = assignmentRepository ?? throw new ArgumentNullException(nameof(assignmentRepository));
            _assetRepository = assetRepository ?? throw new ArgumentNullException(nameof(assetRepository));
        }

        public async Task<PaginationData<ListBasicReturningResponse>> GetReturningRequestsAsync(GetListReturningRequest request)
        {
            var adminUser = await _userRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .FirstOrDefaultAsync(u => u.Id == _currentUserContext.UserId);

            if (adminUser == null)
            {
                throw new NotFoundException("User not found");
            }

            request.SortBy = request.SortBy?.ToLower() switch
            {
                "assetcode" => "Assignment.Asset.Code",
                "assetname" => "Assignment.Asset.Name",
                "requestedby" => "RequestedByUser.Username",
                "acceptedby" => "AcceptedByUser.Username",
                "assigneddate" => "Assignment.AssignedDate",
                "returneddate" => "ReturnDate",
                "state" => "State",
                "id" => "Id",
                null => "Assignment.AssignedDate",
                _ => throw new BadRequestException($"Invalid sort field: {request.SortBy}.")
            };

            var returningRequestResult = await _returningRequestRepository.GetReturningRequestsAsync(request, adminUser.LocationId);

            var returningRequestDtos = _mapper.Map<List<ListBasicReturningResponse>>(returningRequestResult.Data);

            return new PaginationData<ListBasicReturningResponse>(returningRequestDtos, returningRequestResult.PageSize, returningRequestResult.CurrentPage, returningRequestResult.Total);
        }

        public async Task CancelReturningRequestStateAsync(int returningRequestId)
        {
            var adminUser = await _userRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .FirstOrDefaultAsync(u => u.Id == _currentUserContext.UserId);

            if (adminUser == null)
            {
                throw new NotFoundException("User not found");
            }

            var returningRequest = await _returningRequestRepository.Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(r => r.Id == returningRequestId &&
                                          r.State == ReturningRequestStateEnum.WaitingForReturning);

            if (returningRequest == null)
            {
                throw new KeyNotFoundException($"Returning request with ID {returningRequestId} not found or not in a cancellable state.");
            }

            returningRequest.IsDeleted = true;

            await _returningRequestRepository.UnitOfWork.SaveChangesAsync();
        }

        public async Task CompleteReturningRequestAsync(int returningRequestId)
        {
            var adminUser = await _userRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .FirstOrDefaultAsync(u => u.Id == _currentUserContext.UserId);

            if (adminUser == null)
            {
                throw new NotFoundException("User not found");
            }

            var returningRequest = await _returningRequestRepository.Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(r => r.Id == returningRequestId &&
                                          r.State == ReturningRequestStateEnum.WaitingForReturning);

            if (returningRequest == null)
            {
                throw new KeyNotFoundException($"Returning request with ID {returningRequestId} not found or not in a completable state.");
            }

            var assignment = await _assignmentRepository
                .Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(x => x.Id == returningRequest.AssignmentId);

            if (assignment == null)
            {
                throw new NotFoundException("Assignment not found for the returning request.");
            }

            var asset = await _assetRepository
                .Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(x => x.Id == assignment.AssetId);

            if (asset == null)
            {
                throw new NotFoundException("Asset not found for the assignment.");
            }

            returningRequest.State = ReturningRequestStateEnum.Completed;
            returningRequest.AcceptedBy = adminUser.Id;
            returningRequest.ReturnDate = DateTime.UtcNow;
            assignment.State = AssignmentStateEnum.Returned;
            asset.State = AssetStateEnum.Available;

            await _returningRequestRepository.UnitOfWork.SaveChangesAsync();
        }
    }

}
