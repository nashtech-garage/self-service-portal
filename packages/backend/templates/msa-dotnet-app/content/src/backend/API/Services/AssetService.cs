using API.Exceptions;
using API.Services.Abstracts;
using AutoMapper.QueryableExtensions;
using Domain.Common;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using Domain.Common.Constants;
using AutoMapper;
using Domain.Entities;

namespace API.Services
{
    public class AssetService : IAssetService
    {
        private readonly IAssetRepository _assetRepository;
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IReturningRequestRepository _returningRequestRepository;
        private readonly ICurrentUserContext _currentUserContext;
        private readonly IUserRepository _userRepository;
        private readonly AutoMapper.IConfigurationProvider _config;
        private readonly IMapper _mapper;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IDatabase _redis;

        public AssetService(IAssetRepository assetRepository,
                            AutoMapper.IConfigurationProvider config,
                            ICurrentUserContext currentUserContext,
                            IUserRepository userRepository,
                            IConnectionMultiplexer connectionMultiplexer,
                            ICategoryRepository categoryRepository,
                            IMapper mapper,
                            IAssignmentRepository assignmentRepository,
                            IReturningRequestRepository returningRequestRepository)
        {
            _assetRepository = assetRepository ?? throw new ArgumentNullException(nameof(assetRepository));
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _currentUserContext = currentUserContext ?? throw new ArgumentNullException(nameof(currentUserContext));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _redis = connectionMultiplexer.GetDatabase();
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _assignmentRepository = assignmentRepository ?? throw new ArgumentNullException(nameof(assignmentRepository));
            _returningRequestRepository = returningRequestRepository ?? throw new ArgumentNullException(nameof(returningRequestRepository));
        }

        public async Task<PaginationData<ListBasicAssetResponse>> GetAssetsAsync(GetListAssetRequest request)
        {
            var query = await GetAssetsByCurrentUserLocationAsync();

            if (request.KeySearch is not null)
            {
                var keyword = request.KeySearch.Trim().ToLower();

                query = query.Where(x => x.Name.ToLower().Contains(keyword) ||
                                         x.Code.ToLower().Contains(keyword));
            }

            request.SortBy = request.SortBy.ToLower() switch
            {
                "code" => "Code",
                "name" => "Name",
                "categoryname" => "Category.Name",
                "state" => "State",
                "createdat" => "CreatedAt",
                _ => throw new BadRequestException($"Invalid sort field: {request.SortBy}. Valid fields are: Code, Name, CategoryName, State, CreatedAt.")
            };

            if (request.CategoryIds is not null && request.CategoryIds.Any())
            {
                query = query.Where(x => request.CategoryIds.Contains(x.CategoryId));
            }

            if (request.States is not null && request.States.Any())
            {
                query = query.Where(x => request.States.Contains((int)x.State));
            }

            query = query.ApplySorting(request.SortBy, request.Direction);

            int totalItems = await query.CountAsync();

            var data = await query
                            .AsNoTracking()
                            .ProjectTo<ListBasicAssetResponse>(_config)
                            .Skip((request.Page - 1) * request.PageSize)
                            .Take(request.PageSize)
                            .ToListAsync();

            return new PaginationData<ListBasicAssetResponse>(data, request.PageSize, request.Page, totalItems);
        }

        public async Task<GetAssetDetailsResponse> GetAssetDetailsAsync(int assetId)
        {
            var query = await GetAssetsByCurrentUserLocationAsync();

            var asset = await query
                            .WithoutDeleted()
                            .Include(a => a.Category)
                            .Include(a => a.Location)
                            .FirstOrDefaultAsync(a => a.Id == assetId);

            if (asset == null)
            {
                throw new NotFoundException($"Asset with ID {assetId} does not exist.");
            }

            var assignments = await _assignmentRepository.Queryable
                                                        .WithoutDeleted()
                                                        .Where(x => x.AssetId == assetId)
                                                        .OrderByDescending(x => x.AssignedDate)
                                                        .Include(x => x.AssignedToUser)
                                                        .Include(x => x.AssignedByUser)
                                                        .ToListAsync();

            if (assignments is null)
            {
                throw new NotFoundException($"Assignments with asset id {assetId} not found !");
            }

            var assignmentIds = assignments.Select(a => a.Id).ToList();

            var returnRequests = await _returningRequestRepository.Queryable
                .WithoutDeleted()
                .Where(r => assignmentIds.Contains(r.AssignmentId))
                .ToListAsync();

            var response = _mapper.Map<GetAssetDetailsResponse>(asset);
            response.History = GetAssignmentHistory(assignments, returnRequests);

            return response;
        }

        public async Task<CreateEditAssetResponse> CreateAssetAsync(CreateAssetRequest request)
        {
            var existingCategory = await _categoryRepository.Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(c => c.Id == request.CategoryId);

            if (existingCategory == null)
            {
                throw new BadRequestException($"Category with ID {request.CategoryId} does not exist.");
            }

            request.Name = request.Name.Trim();
            request.Specification = request.Specification.Trim();

            var asset = _mapper.Map<Asset>(request);

            var categoryCode = existingCategory.Code;

            var assetCode = await GenerateAssetCodeAsync(categoryCode);

            asset.Code = $"{categoryCode}{assetCode}";

            var adminLocationId = await _userRepository.Queryable
                .Where(c => c.Id == _currentUserContext.UserId)
                .Select(c => c.LocationId)
                .FirstOrDefaultAsync();

            asset.LocationId = adminLocationId;

            await _assetRepository.AddAsync(asset);
            await _assetRepository.UnitOfWork.SaveChangesAsync();

            return _mapper.Map<CreateEditAssetResponse>(asset);
        }

        internal async Task<string> GenerateAssetCodeAsync(string categoryCode)
        {
            string redisKey = string.Format(AuthConstant.AssetCodeMaxPostfixKey, categoryCode);

            // Lấy số hiện tại từ Redis
            var currentValue = await _redis.StringGetAsync(redisKey);

            int currentMax = 0;

            if (!currentValue.IsNullOrEmpty && int.TryParse(currentValue, out int value))
            {
                currentMax = value;
            }
            else
            {
                // Nếu chưa có thì truy vấn DB 1 lần duy nhất
                var lastAssetCode = await _assetRepository.Queryable
                    .AsNoTracking()
                    .WithoutDeleted()
                    .Where(x => x.Code.StartsWith(categoryCode))
                    .OrderByDescending(u => u.Code)
                    .Select(u => u.Code)
                    .FirstOrDefaultAsync();

                if (!string.IsNullOrEmpty(lastAssetCode))
                {
                    var numericPart = lastAssetCode.Substring(categoryCode.Length);
                    if (int.TryParse(numericPart, out int parsed))
                    {
                        currentMax = parsed;
                    }
                }
            }

            int nextCode = currentMax + 1;

            // Lưu lại vào Redis
            await _redis.StringSetAsync(redisKey, nextCode.ToString());

            return nextCode.ToString().PadLeft(6, '0');
        }

        public async Task<CreateEditAssetResponse> UpdateAssetAsync(int assetId, UpdateAssetRequest request)
        {
            var asset = await _assetRepository.Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(x => x.Id == assetId);

            if (asset == null)
            {
                throw new NotFoundException($"Asset does not exist.");
            }

            if (asset.State == AssetStateEnum.Assigned && request.State != AssetStateEnum.Assigned)
            {
                throw new BadRequestException("Cannot update asset that is currently assigned to a user. Please return the asset before updating its details.");
            }

            request.Name = request.Name.Trim();
            request.Specification = request.Specification.Trim();

            _mapper.Map(request, asset);

            await _assetRepository.UpdateAsync(asset);
            await _assetRepository.UnitOfWork.SaveChangesAsync();

            var updatedAsset = await _assetRepository.Queryable
                .Include(x => x.Category)
                .FirstOrDefaultAsync(x => x.Id == assetId);

            return _mapper.Map<CreateEditAssetResponse>(updatedAsset);
        }

        private async Task<IQueryable<Asset>> GetAssetsByCurrentUserLocationAsync()
        {
            var user = await _userRepository.Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(x => x.Id == _currentUserContext.UserId);

            if (user == null)
            {
                throw new NotFoundException("Current user not found.");
            }

            return _assetRepository.Queryable
                                .WithoutDeleted()
                                .Where(x => x.LocationId == user.LocationId);
        }

        private List<AssignmentHistoryResponse> GetAssignmentHistory(List<Assignment> assignments,
                                                                        List<ReturningRequest> returnRequests)
        {
            var history = new List<AssignmentHistoryResponse>();

            foreach (var assignment in assignments)
            {
                var returnRequest = returnRequests
                    .Where(r => r.AssignmentId == assignment.Id)
                    .OrderByDescending(r => r.ReturnDate)
                    .FirstOrDefault();

                var item = _mapper.Map<AssignmentHistoryResponse>(assignment);
                item.ReturnDate = returnRequest?.ReturnDate;

                history.Add(item);
            }

            return history;
        }

        public async Task DeleteAssetAsync(int assetId)
        {
            var query = await GetAssetsByCurrentUserLocationAsync();

            var asset = await query
                .FirstOrDefaultAsync(a => a.Id == assetId);

            if (asset == null)
            {
                throw new NotFoundException($"Asset with ID {assetId} does not exist.");
            }

            // Check if asset is currently assigned
            if (asset.State == AssetStateEnum.Assigned)
            {
                throw new BadRequestException("Cannot delete asset that is currently assigned.");
            }

            // Check if asset has any historical assignments
            var hasHistoricalAssignments = await _assignmentRepository.Queryable
                .WithoutDeleted()
                .AnyAsync(a => a.AssetId == assetId);

            if (hasHistoricalAssignments)
            {
                throw new BadRequestException("Cannot delete the asset because it belongs to one or more historical assignments. If the asset is not able to be used anymore, please update its state in Edit Asset page.");
            }

            await _assetRepository.DeleteAsync(asset);
            await _assetRepository.UnitOfWork.SaveChangesAsync();
        }
    }
}