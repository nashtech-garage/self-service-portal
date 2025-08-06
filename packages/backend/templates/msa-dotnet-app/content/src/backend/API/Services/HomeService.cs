using API.Exceptions;
using API.Services.Abstracts;
using AutoMapper;
using Domain.Common;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class HomeService : IHomeService
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IReturningRequestRepository _returningRequestRepository;
        private readonly ICurrentUserContext _currentUserContext;
        private readonly IMapper _mapper;
        private readonly ILogger<HomeService> _logger;

        public HomeService(IAssignmentRepository assignmentRepository,
            IReturningRequestRepository returningRequestRepository,
            ICurrentUserContext currentUserContext,
            IMapper mapper,
            ILogger<HomeService> logger)
        {
            _assignmentRepository = assignmentRepository ?? throw new ArgumentNullException(nameof(assignmentRepository));
            _returningRequestRepository = returningRequestRepository ?? throw new ArgumentNullException(nameof(returningRequestRepository));
            _currentUserContext = currentUserContext ?? throw new ArgumentNullException(nameof(currentUserContext));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PaginationData<ListBasicHomeAssignmentResponse>> GetMyAssignmentsAsync(GetListHomeAssignmentRequest request)
        {
            if (request.SortBy != null)
            {
                request.SortBy = request.SortBy.ToLower() switch
                {
                    "assetcode" => "Asset.Code",
                    "assetname" => "Asset.Name",
                    "assetcategoryname" => "Asset.Category.Name",
                    "assigneddate" => "AssignedDate",
                    "state" => "State",
                    _ => throw new BadRequestException($"Invalid sort field: {request.SortBy}. Valid fields are: AssetCode, AssetName, AssetCategoryName, AssignedDate, State.")
                };
            }

            var assignmentsPageData = await _assignmentRepository.GetHomeAssignmentsForUserAsync(request, _currentUserContext.UserId);

            if (assignmentsPageData.Data == null || assignmentsPageData.Total == 0)
            {
                return new PaginationData<ListBasicHomeAssignmentResponse>(new List<ListBasicHomeAssignmentResponse>(), request.PageSize, request.Page, 0);
            }

            var assignmentIds = assignmentsPageData.Data.Where(a => a.State == AssignmentStateEnum.Accepted).Select(a => a.Id).ToList();

            var returningAssignments = await _returningRequestRepository.GetReturningAssignmentIdsAsync(assignmentIds);

            var assignmentDtos = _mapper.Map<List<ListBasicHomeAssignmentResponse>>(assignmentsPageData.Data);

            if (returningAssignments != null && returningAssignments.Any())
            {
                foreach (var dto in assignmentDtos)
                {
                    dto.IsReturningRequested = returningAssignments.Contains(dto.Id);
                }
            }

            return new PaginationData<ListBasicHomeAssignmentResponse>(assignmentDtos, assignmentsPageData.PageSize, assignmentsPageData.CurrentPage, assignmentsPageData.Total);
        }

        public async Task<DetailHomeAssignmentResponse?> GetMyAssignmentDetailAsync(int assignmentId)
        {
            _logger.LogInformation("Start GetAssignmentDetailAsync");

            var assignment = await _assignmentRepository.Queryable
                .WithoutDeleted()
                .Where(a => a.Id == assignmentId && a.AssignedTo == _currentUserContext.UserId)
                .AsNoTracking()
                .Include(a => a.Asset)
                .Include(a => a.Asset.Category)
                .Include(a => a.AssignedToUser)
                .Include(a => a.AssignedByUser)
                .FirstOrDefaultAsync();

            if (assignment == null)
            {
                throw new NotFoundException($"Assignment with ID {assignmentId} not found or you are not the assignee.");
            }

            var assignmentDto = _mapper.Map<DetailHomeAssignmentResponse>(assignment);

            _logger.LogInformation("End GetAssignmentDetailAsync");

            return assignmentDto;
        }

        public async Task UpdateMyAssignmentStateAsync(int assignmentId, AssignmentStateEnum state)
        {
            _logger.LogInformation("Start UpdateAssignmentStateAsync");

            var assignment = await _assignmentRepository.Queryable
               .WithoutDeleted()
               .Where(a => a.Id == assignmentId && a.AssignedTo == _currentUserContext.UserId)
               .Include(a => a.Asset)
               .FirstOrDefaultAsync();

            if (assignment == null)
            {
                throw new NotFoundException("Assignment not found");
            }

            if (assignment.State != AssignmentStateEnum.WaitingForAcceptance)
            {
                throw new BadRequestException($"Cannot update assignment in '{assignment.State}' state. Only assignments in 'Waiting for Acceptance' state can be updated.");
            }

            assignment.State = state;
            assignment.Asset.State = state == AssignmentStateEnum.Accepted ? AssetStateEnum.Assigned : AssetStateEnum.Available;

            await _assignmentRepository.UpdateAsync(assignment);
            await _assignmentRepository.UnitOfWork.SaveChangesAsync();

            _logger.LogInformation("End UpdateAssignmentStateAsync");
        }

        public async Task CreateReturningRequestAsync(int assignmentId)
        {
            _logger.LogInformation("Start CreateReturningRequestAsync");

            var assignment = await _assignmentRepository.Queryable
                .WithoutDeleted()
                .Where(a => a.Id == assignmentId)
                .FirstOrDefaultAsync();

            if (assignment == null)
            {
                throw new NotFoundException("Assignment not found.");
            }

            if (assignment.State != AssignmentStateEnum.Accepted)
            {
                throw new BadRequestException($"Cannot create returning request for assignment in '{assignment.State}' state. Only assignments in 'Accepted' state can have returning requests.");
            }

            if (assignment.AssignedTo != _currentUserContext.UserId)
            {
                throw new BadRequestException("You are not the assignee of this assignment.");
            }

            var existReturningRequest = await _returningRequestRepository.Queryable
                .WithoutDeleted()
                .Where(r => r.AssignmentId == assignmentId && r.State == ReturningRequestStateEnum.WaitingForReturning)
                .FirstOrDefaultAsync();

            if (existReturningRequest != null)
            {
                throw new BadRequestException("Returning request already exists for this assignment.");
            }

            var newReturningRequest = new ReturningRequest
            {
                AssignmentId = assignmentId,
                RequestedBy = _currentUserContext.UserId,
                State = ReturningRequestStateEnum.WaitingForReturning
            };

            await _returningRequestRepository.AddAsync(newReturningRequest);
            await _returningRequestRepository.UnitOfWork.SaveChangesAsync();

            _logger.LogInformation("End CreateReturningRequestAsync");
        }
    }
}