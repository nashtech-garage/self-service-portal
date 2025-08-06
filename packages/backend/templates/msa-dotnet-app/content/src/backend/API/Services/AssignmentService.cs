using API.Exceptions;
using API.Services.Abstracts;
using AutoMapper;
using Domain.Common;
using Domain.Common.Enum;
using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using AutoMapper.QueryableExtensions;
using StackExchange.Redis;

namespace API.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly ILogger _logger;
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IReturningRequestRepository _returningRequestRepository;
        private readonly AutoMapper.IConfigurationProvider _config;
        private readonly ICurrentUserContext _currentUserContext;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IAssetRepository _assetRepository;
        private readonly IDatabase _redis;

        public AssignmentService(ILogger<AssignmentService> logger,
            IAssignmentRepository assignmentRepository,
            IReturningRequestRepository returningRequestRepository,
            ICurrentUserContext currentUserContext,
            IUserRepository userRepository,
            AutoMapper.IConfigurationProvider config,
            IMapper mapper,
            IAssetRepository assetRepository,
            IConnectionMultiplexer connectionMultiplexer)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _assignmentRepository = assignmentRepository ?? throw new ArgumentNullException(nameof(assignmentRepository));
            _returningRequestRepository = returningRequestRepository ?? throw new ArgumentNullException(nameof(returningRequestRepository));
            _currentUserContext = currentUserContext ?? throw new ArgumentNullException(nameof(currentUserContext));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _assetRepository = assetRepository ?? throw new ArgumentNullException(nameof(assetRepository));
            _redis = connectionMultiplexer.GetDatabase() ?? throw new ArgumentNullException(nameof(connectionMultiplexer));
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task CreateAssignmentReturningRequestAsync(int assignmentId)
        {
            _logger.LogInformation("Start AssignmentReturningRequestAsync");

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

            _logger.LogInformation("End AssignmentReturningRequestAsync");
        }

        public async Task<DetailAssignmentAdminResponse> GetAssignmentDetailAsync(int assignmentId)
        {
            var assignment = await _assignmentRepository.Queryable
                .WithoutDeleted()
                .Where(a => a.Id == assignmentId)
                .AsNoTracking()
                .Include(a => a.Asset)
                .Include(a => a.Asset.Category)
                .Include(a => a.AssignedToUser)
                .Include(a => a.AssignedByUser)
                .FirstOrDefaultAsync();

            if (assignment == null)
            {
                throw new NotFoundException("Assignment not found");
            }

            return _mapper.Map<DetailAssignmentAdminResponse>(assignment);
        }

        public async Task<DetailAssignmentAdminEditResponse> GetAssignmentDetailEditAsync(int assignmentId)
        {
            var assignment = await _assignmentRepository.Queryable
                .WithoutDeleted()
                .Where(a => a.Id == assignmentId)
                .AsNoTracking()
                .Include(a => a.Asset)
                .Include(a => a.Asset.Category)
                .Include(a => a.AssignedToUser)
                .FirstOrDefaultAsync();

            if (assignment == null)
            {
                throw new NotFoundException("Assignment not found");
            }

            if (assignment.State != AssignmentStateEnum.WaitingForAcceptance)
            {
                throw new BadRequestException("Only assignment in 'Waiting for acceptance' state can be edited");
            }

            return _mapper.Map<DetailAssignmentAdminEditResponse>(assignment);
        }

        public async Task<PaginationData<ListBasicAssignmentAdminResponse>> GetAssignmentsAdminAsync(GetListAssignmentAdminRequest request)
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
                "assetcode" => "Asset.Code",
                "assetname" => "Asset.Name",
                "assignedto" => "AssignedToUser.Username",
                "assignedby" => "AssignedByUser.Username",
                "assigneddate" => "AssignedDate",
                "state" => "State",
                "id" => "Id",
                null => "AssignedDate",
                _ => throw new BadRequestException($"Invalid sort field: {request.SortBy}.")
            };

            var assignmentResult = await _assignmentRepository.GetAssignmentsAdminAsync(request, adminUser.LocationId);

            if (assignmentResult.Data == null || assignmentResult.Total == 0)
            {
                return new PaginationData<ListBasicAssignmentAdminResponse>(new List<ListBasicAssignmentAdminResponse>(), request.PageSize, request.Page, 0);
            }

            var assignmentIds = assignmentResult.Data.Where(a => a.State == AssignmentStateEnum.Accepted).Select(a => a.Id).ToList();
            var returningAssignments = await _returningRequestRepository.GetReturningAssignmentIdsAsync(assignmentIds);

            var assignmentDtos = _mapper.Map<List<ListBasicAssignmentAdminResponse>>(assignmentResult.Data);

            if (returningAssignments != null && returningAssignments.Any())
            {
                foreach (var dto in assignmentDtos)
                {
                    dto.IsReturningRequested = returningAssignments.Contains(dto.Id);
                }
            }

            return new PaginationData<ListBasicAssignmentAdminResponse>(assignmentDtos, assignmentResult.PageSize, assignmentResult.CurrentPage, assignmentResult.Total);
        }

        public async Task<CreateAssignmentResponse> CreateAssignmentAsync(CreateAssignmentRequest request)
        {
            _logger.LogInformation("Start CreateAssignmentAsync");


            var user = await _userRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .FirstOrDefaultAsync(u => u.Id == request.UserId);

            if (user == null)
            {
                throw new NotFoundException($"User with ID {request.UserId} not found or is inactive");
            }

            var adminUser = await _userRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .FirstOrDefaultAsync(u => u.Id == _currentUserContext.UserId);

            if (adminUser == null)
            {
                throw new NotFoundException("Admin user not found");
            }

            var asset = await _assetRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .FirstOrDefaultAsync(a => a.Id == request.AssetId && a.LocationId == adminUser.LocationId);

            if (asset == null)
            {
                throw new NotFoundException($"Asset with ID {request.AssetId} not found or does not belong to your location");
            }

            if (asset.State != AssetStateEnum.Available)
            {
                throw new BadRequestException($"Asset with ID {request.AssetId} is not available for assignment");
            }

            // Trim note if not null or empty
            var trimmedNote = string.IsNullOrEmpty(request.Note) ? request.Note : request.Note.Trim();

            var assignment = new Assignment
            {
                AssetId = request.AssetId,
                AssignedTo = request.UserId,
                AssignedBy = _currentUserContext.UserId,
                AssignedDate = request.AssignedDate,
                Note = trimmedNote
            };

            var result = await _assignmentRepository.AddAsync(assignment);
            asset.State = AssetStateEnum.Assigned;
            await _assetRepository.UpdateAsync(asset);
            await _assignmentRepository.UnitOfWork.SaveChangesAsync();
            // Get the assignment with all navigation properties for mapping
            var assignmentWithIncludes = await _assignmentRepository.Queryable
                .Include(a => a.Asset)
                .Include(a => a.AssignedToUser)
                .Include(a => a.AssignedByUser)
                .FirstOrDefaultAsync(a => a.Id == result.Id);

            _logger.LogInformation("End CreateAssignmentAsync");

            return _mapper.Map<CreateAssignmentResponse>(assignmentWithIncludes);
        }

        public async Task<PaginationData<AssignableAssetResponse>> GetAssignableAssetsAsync(GetAssignableAssetsRequest request)
        {
            _logger.LogInformation("Start GetAssignableAssetsAsync");

            var adminUser = await _userRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .FirstOrDefaultAsync(u => u.Id == _currentUserContext.UserId);

            if (adminUser == null)
            {
                throw new NotFoundException("Admin user not found");
            }

            var query = _assetRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .Where(a => a.LocationId == adminUser.LocationId && a.State == AssetStateEnum.Available);

            if (!string.IsNullOrEmpty(request.KeySearch))
            {
                var keyword = request.KeySearch.Trim().ToLower();
                query = query.Where(a => a.Code.ToLower().Contains(keyword) ||
                                         a.Name.ToLower().Contains(keyword));
            }

            // Always sort by CreatedAt as secondary sort to ensure newest items appear first
            if (request.SortBy.ToLower() == "createdat")
            {
                query = query.ApplySorting(request.SortBy, request.Direction);
            }
            else
            {
                // Apply custom sorting to include CreatedAt as secondary sort
                var sortBy = request.SortBy.ToLower() switch
                {
                    "code" => "Code",
                    "name" => "Name",
                    "categoryname" => "Category.Name",
                    _ => throw new BadRequestException($"Invalid sort field: {request.SortBy}. Valid fields are: Code, Name, CategoryName.")
                };

                if (request.Direction.ToUpper() == "ASC")
                {
                    if (sortBy == "Code")
                        query = query.OrderBy(a => a.Code).ThenByDescending(a => a.CreatedAt);
                    else if (sortBy == "Name")
                        query = query.OrderBy(a => a.Name).ThenByDescending(a => a.CreatedAt);
                    else if (sortBy == "Category.Name")
                        query = query.OrderBy(a => a.Category.Name).ThenByDescending(a => a.CreatedAt);
                }
                else
                {
                    if (sortBy == "Code")
                        query = query.OrderByDescending(a => a.Code).ThenByDescending(a => a.CreatedAt);
                    else if (sortBy == "Name")
                        query = query.OrderByDescending(a => a.Name).ThenByDescending(a => a.CreatedAt);
                    else if (sortBy == "Category.Name")
                        query = query.OrderByDescending(a => a.Category.Name).ThenByDescending(a => a.CreatedAt);
                }
            }

            query = query.Include(a => a.Category);

            var totalItems = await query.CountAsync();

            var assets = await query
                .AsNoTracking()
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<AssignableAssetResponse>(_config)
                .ToListAsync();

            var result = new PaginationData<AssignableAssetResponse>(
                assets,
                request.PageSize,
                request.Page,
                totalItems);

            _logger.LogInformation("End GetAssignableAssetsAsync");

            return result;
        }

        public async Task<PaginationData<AssignableUserResponse>> GetAssignableUsersAsync(GetAssignableUsersRequest request)
        {
            _logger.LogInformation("Start GetAssignableUsersAsync");

            var adminUser = await _userRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .FirstOrDefaultAsync(u => u.Id == _currentUserContext.UserId);

            if (adminUser == null)
            {
                throw new NotFoundException("Admin user not found");
            }

            // Get fresh data from database
            var query = _userRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .Where(u => u.LocationId == adminUser.LocationId && !u.IsDisable);

            if (!string.IsNullOrEmpty(request.KeySearch))
            {
                var keyword = request.KeySearch.Trim().ToLower();
                query = query.Where(u => u.StaffCode.ToLower().Contains(keyword) || (u.FirstName + " " + u.LastName).ToLower().Contains(keyword));
            }

            // Always sort with CreatedAt as secondary sort to ensure newest items appear first
            if (request.SortBy.ToLower() == "createdat" || request.SortBy.ToLower() == "joineddate")
            {
                query = query.ApplySorting(request.SortBy, request.Direction);
            }
            else
            {
                var sortBy = request.SortBy.ToLower() switch
                {
                    "staffcode" => "StaffCode",
                    "firstname" => "FirstName",
                    "lastname" => "LastName",
                    "fullname" => "FirstName",
                    "usertype" => "UserType",
                    _ => throw new BadRequestException($"Invalid sort field: {request.SortBy}. Valid fields are: StaffCode, FirstName, LastName, FullName, UserType, JoinedDate.")
                };

                if (request.Direction.ToUpper() == "ASC")
                {
                    if (sortBy == "StaffCode")
                        query = query.OrderBy(u => u.StaffCode).ThenByDescending(u => u.CreatedAt);
                    else if (sortBy == "FirstName")
                        query = query.OrderBy(u => u.FirstName).ThenByDescending(u => u.CreatedAt);
                    else if (sortBy == "LastName")
                        query = query.OrderBy(u => u.LastName).ThenByDescending(u => u.CreatedAt);
                    else if (sortBy == "UserType")
                        query = query.OrderBy(u => u.UserType).ThenByDescending(u => u.CreatedAt);
                }
                else
                {
                    if (sortBy == "StaffCode")
                        query = query.OrderByDescending(u => u.StaffCode).ThenByDescending(u => u.CreatedAt);
                    else if (sortBy == "FirstName")
                        query = query.OrderByDescending(u => u.FirstName).ThenByDescending(u => u.CreatedAt);
                    else if (sortBy == "LastName")
                        query = query.OrderByDescending(u => u.LastName).ThenByDescending(u => u.CreatedAt);
                    else if (sortBy == "UserType")
                        query = query.OrderByDescending(u => u.UserType).ThenByDescending(u => u.CreatedAt);
                }
            }

            var totalItems = await query.CountAsync();

            var users = await query
                .AsNoTracking()
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<AssignableUserResponse>(_config)
                .ToListAsync();

            var result = new PaginationData<AssignableUserResponse>(users, request.PageSize, request.Page, totalItems);

            return result;
        }

        public async Task<EditAssignmentResponse> UpdateAssignmentAsync(int assignmentId, UpdateAssignmentRequest request)
        {
            var userExists = await _userRepository.Queryable
                .WithoutDeleted()
                .AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
            {
                throw new NotFoundException("Assigned user not found.");
            }

            var asset = await _assetRepository.Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(a => a.Id == request.AssetId);

            if (asset is null)
            {
                throw new NotFoundException("Assigned asset not found.");
            }

            if (asset.LocationId != _currentUserContext.LocationId)
            {
                throw new ForbiddenException("You do not have permission to assign this asset");
            }

            var assignment = await _assignmentRepository.Queryable
                .WithoutDeleted()
                .Include(a => a.Asset)
                .Include(a => a.AssignedToUser)
                .Include(a => a.AssignedByUser)
                .FirstOrDefaultAsync(a => a.Id == assignmentId);
            
            if (asset.Id != assignment?.AssetId && asset.State != AssetStateEnum.Available)
            {
                throw new ForbiddenException("Asset is not available for assignment");
            }

            if (assignment is null)
            {
                throw new NotFoundException("Assignment not found");
            }

            if (!IsAccessibleByLocation(assignment, _currentUserContext.LocationId))
            {
                throw new ForbiddenException("You do not have permission to access this assignment");
            }

            if (assignment.State != AssignmentStateEnum.WaitingForAcceptance)
                {
                    throw new BadRequestException("Only assignments in 'Waiting for Acceptance' state can be edited.");
                }

            if (request.AssignedDate < assignment.AssignedDate)
            {
                throw new BadRequestException("Assigned date cannot be earlier than current assigned date");
            }
            
            _mapper.Map(request, assignment);

            await _assignmentRepository.UpdateAsync(assignment);
            await _assignmentRepository.UnitOfWork.SaveChangesAsync();

            var updatedAssignment = await _assignmentRepository.Queryable
                                                                .Include(a => a.Asset)
                                                                .Include(a => a.AssignedToUser)
                                                                .Include(a => a.AssignedByUser)
                                                                .FirstOrDefaultAsync(a => a.Id == assignment.Id);

            return _mapper.Map<EditAssignmentResponse>(updatedAssignment);
        }

        public async Task DeleteAssignmentAsync(int assignmentId)
        {
            var assignment = await _assignmentRepository.Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(a => a.Id == assignmentId);

            if (assignment is null)
            {
                throw new NotFoundException("Assignment not found");
            }

            var isDeletable = assignment.State == AssignmentStateEnum.WaitingForAcceptance || assignment.State == AssignmentStateEnum.Declined;

            if (!isDeletable)
            {
                throw new BadRequestException("Cannot delete assignment that is not in Waiting for Acceptance or Declined state");
            }

            await _assignmentRepository.DeleteAsync(assignment);
            await _assignmentRepository.UnitOfWork.SaveChangesAsync();
        }

        private static bool IsAccessibleByLocation(Assignment assignment, int locationId)
        {
            return assignment.Asset.LocationId == locationId;
        }
    }
}
