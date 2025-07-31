using API.Exceptions;
using API.Services.Abstracts;
using AutoMapper;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Domain.Extensions;
using Domain.Common.Constants;
using StackExchange.Redis;
using Domain.Common;
using Domain.Dtos;
using Domain.Common.Enum;

namespace API.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IDatabase _redis;
        private readonly ICurrentUserContext _currentUserContext;
        private readonly IAssignmentRepository _assignmentRepository;

        public UserService(
            IUserRepository userRepository,
            IMapper mapper,
            IConnectionMultiplexer connectionMultiplexer,
            ICurrentUserContext currentUserContext,
            IAssignmentRepository assignmentRepository)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _redis = connectionMultiplexer.GetDatabase();
            _currentUserContext = currentUserContext;
            _assignmentRepository = assignmentRepository ?? throw new ArgumentNullException(nameof(assignmentRepository));
        }

        public async Task<PaginationData<ListBasicUserResponse>> GetAllUserAsync(GetListUserRequest parameters)
        {
            var (users, totalCount) = await _userRepository.GetPagedAsync(parameters, _currentUserContext.UserId);

            var userDTOs = _mapper.Map<List<ListBasicUserResponse>>(users);

            return new PaginationData<ListBasicUserResponse>(
                userDTOs,
                pageSize: parameters.PageSize,
                currentPage: parameters.Page,
                totalCount);
        }

        public async Task<DetailUserResponse> GetUserByIdAsync(int userId)
        {
            var user = await _userRepository.GetAsync(_currentUserContext.UserId, u => u.Id == userId);

            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            return _mapper.Map<DetailUserResponse>(user);
        }

        public async Task<CreateUserResponse?> CreateUserAsync(CreateUserRequest request)
        {
            // get admin's from db
            var admin = await _userRepository.Queryable
                .AsNoTracking()
                .WithoutDeleted()
                .FirstOrDefaultAsync(u => u.Id == _currentUserContext.UserId) ?? throw new NotFoundException("Admin not found");

            var locationId = admin.LocationId;

            // Normalize first name and last name
            request.FirstName = StringExtension.NormalizeWhitespace(request.FirstName);
            request.LastName = StringExtension.NormalizeWhitespace(request.LastName);

            // Normalize dates to have zero time
            var dateOfBirth = request.DateOfBirth.Date.ToUniversalTime();

            var joinedDate = request.JoinedDate.Date.ToUniversalTime();

            // Gen username
            var username = await GenerateUsernameAsync(request.FirstName, request.LastName);

            // Gen staff code
            var staffCode = await GenerateStaffCodeAsync();

            // Gen password
            var rawPassword = GeneratePassword(username, dateOfBirth);

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(rawPassword);

            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                DateOfBirth = dateOfBirth,
                Gender = request.Gender,
                JoinedDate = joinedDate,
                UserType = request.UserType,
                StaffCode = staffCode,
                Username = username,
                PasswordHash = passwordHash,
                IsChangedPassword = false,
                IsDisable = false,
                LocationId = locationId,
                CreatedBy = admin.Id
            };

            await _userRepository.AddAsync(user);
            await _userRepository.UnitOfWork.SaveChangesAsync();

            // hash username
            var hashedUsername = StringExtension.HashStringCRC32(username);

            // set username to redis
            await _redis.StringSetBitAsync(AuthConstant.UsernameList, hashedUsername, true);

            var response = _mapper.Map<CreateUserResponse>(user);

            response.RawPassword = rawPassword;

            return response;
        }

        private async Task<string> GenerateUsernameAsync(string firstName, string lastName)
        {
            var baseFirstName = string.Join("", firstName.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(x => x.ToLower()));

            var lastNameParts = lastName.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            var baseUsername = baseFirstName;

            foreach (var part in lastNameParts)
            {
                baseUsername += part[0].ToString().ToLower();
            }

            // check base username in redis
            var baseUsernameHashed = StringExtension.HashStringCRC32(baseUsername);

            var baseUsernameExists = await _redis.StringGetBitAsync(AuthConstant.UsernameList, baseUsernameHashed);

            // check max postfix in redis
            string maxPostfixKey = string.Format(AuthConstant.UsernameMaxPostfixKey, baseUsername);

            int maxPostfix = 0;

            var maxPostfixValue = await _redis.StringGetAsync(maxPostfixKey);

            if (!maxPostfixValue.IsNullOrEmpty)
            {
                // found in redis
                if (int.TryParse(maxPostfixValue, out int redisMaxPostfix))
                {
                    maxPostfix = redisMaxPostfix;
                }
            }

            // update redis with max postfix from database
            await _redis.StringSetAsync(maxPostfixKey, maxPostfix.ToString());

            var username = baseUsernameExists || maxPostfix > 0
                ? baseUsername + (maxPostfix + 1)
                : baseUsername;

            // update max postfix in redis if created username with new postfix
            if (username != baseUsername)
            {
                await _redis.StringSetAsync(maxPostfixKey, (maxPostfix + 1).ToString());
            }

            return username;
        }

        private async Task<string> GenerateStaffCodeAsync()
        {
            var lastStaffCode = await _userRepository.Queryable
                .AsNoTracking() // this is for not tracking state of db
                .WithoutDeleted()
                .Where(u => u.StaffCode.StartsWith("SD"))
                .OrderByDescending(u => u.StaffCode)
                .Select(u => u.StaffCode)
                .FirstOrDefaultAsync();

            int maxNumber = 0;

            if (lastStaffCode != null && int.TryParse(lastStaffCode[2..], out int num))
            {
                maxNumber = num;
            }

            return $"SD{(maxNumber + 1).ToString("D4")}";
        }

        private string GeneratePassword(string username, DateTime dob)
        {
            string dobString = dob.ToString("ddMMyyyy");

            return $"{username}@{dobString}";
        }

        public async Task DisableUserAsync(int userId)
        {
            var today = DateTime.UtcNow.Date;

            var user = await _userRepository.Queryable
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null)
            {
                throw new NotFoundException("Not found user");
            }

            // disable user
            user.IsDisable = true;
            await _userRepository.UpdateAsync(user);
            await _userRepository.UnitOfWork.SaveChangesAsync();
        }

        public async Task<bool> CheckUserHasValidAssignmentAsync(int userId)
        {
            var user = await _userRepository.Queryable
               .FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null)
            {
                throw new NotFoundException("Not found user");
            }

            return await _assignmentRepository
                .Queryable
                .WithoutDeleted()
                .Where(x => x.AssignedTo == userId && (x.State == AssignmentStateEnum.WaitingForAcceptance || x.State == AssignmentStateEnum.Accepted))
                .AnyAsync();
        }

        public async Task<DetailUserResponse> UpdateUserAsync(int userId, UpdateUserRequest request)
        {
            var user = await _userRepository.Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            _mapper.Map(request, user);

            await _userRepository.UpdateAsync(user);
            await _userRepository.UnitOfWork.SaveChangesAsync();

            return _mapper.Map<DetailUserResponse>(user);
        }
    }
}
