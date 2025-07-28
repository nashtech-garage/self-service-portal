using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;
using API.Exceptions;
using API.Services.Abstracts;
using Domain.Common;
using Domain.Common.Constants;
using Domain.Dtos.Common;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Domain.Extensions;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ILogger _logger;
        private readonly IDatabase _redis;
        private readonly ITokenService _tokenService;
        private readonly IUserRepository _userRepository;
        private readonly TokenSettings _tokenSettings;
        private readonly ICurrentUserContext _currentUserContext;

        public AuthService(ILogger<AuthService> logger,
            IConnectionMultiplexer connectionMultiplexer,
            ITokenService tokenService,
            IOptions<TokenSettings> tokenSettings,
            IUserRepository userRepository,
            ICurrentUserContext currentUserContext)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _redis = connectionMultiplexer.GetDatabase() ?? throw new ArgumentNullException(nameof(connectionMultiplexer));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
            _tokenSettings = tokenSettings.Value ?? throw new ArgumentNullException(nameof(tokenSettings.Value));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _currentUserContext = currentUserContext ?? throw new ArgumentNullException(nameof(currentUserContext));
        }

        public async Task<User?> GetUserForAuth(int id)
        {
            return await _userRepository
                .Queryable
                .WithoutDeleted()
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            _logger.LogInformation("Start LoginAsync");
            // Check by Redis
            var usernameHashed = StringExtension.HashStringCRC32(request.Username);

            await _redis.StringGetBitAsync(AuthConstant.UsernameList, usernameHashed);

            if (!await _redis.StringGetBitAsync(AuthConstant.UsernameList, usernameHashed))
            {
                throw new NotFoundException("Wrong username/password");
            }

            var key = $"{AuthConstant.RetryLogin}_{request.Username}";

            // check retry
            var valueRedis = await _redis.StringGetAsync(key);

            int retryTime = 0;

            if (!valueRedis.IsNullOrEmpty && int.TryParse(valueRedis.ToString(), out int parsedValue))
            {
                retryTime = parsedValue;
            }

            if (retryTime > AuthConstant.MaxRetryTime)
            {
                throw new TooManyRequestsException($"Too many request to login, retry after {AuthConstant.BlockTime} Minutes");
            }

            var user = await _userRepository.Queryable.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user is null)
            {
                throw new NotFoundException("Wrong username/password");
            }

            if (user.IsDisable)
            {
                throw new ForbiddenException("You has been disabled");
            }

            if (user.IsChangedPassword && !Regex.IsMatch(request.Password, RegexConstants.PasswordPattern))
            {
                throw new BadRequestException("Password must be 6-100 characters long, contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character (@, #, $, %, &, *).");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                retryTime = retryTime + 1;
                await _redis.StringSetAsync(key, retryTime, TimeSpan.FromMinutes(AuthConstant.BlockTime));

                throw new BadRequestException("Wrong username/password");
            }

            var jti = Guid.NewGuid().ToString();

            var accessToken = await _tokenService.GenerateToken(user, jti);

            var refreshToken = _tokenService.GenerateRefreshToken(user, jti);

            await _redis.KeyDeleteAsync(key);
            _logger.LogInformation("End LoginAsync");

            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpireIn = (_tokenSettings.AccessTokenExpirationHours + AuthConstant.BONUS_HOUR_REFRESH_TOKEN) * 60 * 60,
                UserId = user.Id,
                UserType = user.UserType,
                IsChangedPassword = user.IsChangedPassword
            };
        }

        public async Task LogoutAsync(string userId, string jti)
        {
            _logger.LogInformation("Start LogoutAsync");
            var key = $"{AuthConstant.ACCESS_TOKEN_BLACK_LIST}_{jti}_{userId}";

            // Revoke token
            await _redis.StringSetAsync(key, 1, null, When.Always, CommandFlags.None);
            _logger.LogInformation("End LogoutAsync");
        }

        public async Task<LoginResponse> RefreshLoginAsync(RefreshLoginRequest request)
        {
            _logger.LogInformation("Start RefreshLoginAsync");
            var claim = _tokenService.ValidateToken(request.RefreshToken);

            if (claim == null)
            {
                throw new UnAuthorizedException("Invalid Refresh Token");
            }

            var userId = claim.FindFirstValue("userId");

            var user = await _userRepository.Queryable.FirstOrDefaultAsync(u => u.Id.ToString() == userId);
            if (user == null)
            {
                throw new NotFoundException("Login failed");
            }

            var jti = claim.FindFirstValue(JwtRegisteredClaimNames.Jti);

            if (await _redis.KeyExistsAsync($"{AuthConstant.REFRESH_TOKEN_BLACK_LIST}_{jti}_{userId}"))
            {
                throw new UnAuthorizedException("Refresh token is expired, please login again");
            }

            var key = $"{AuthConstant.REFRESH_TOKEN_BLACK_LIST}_{jti}_{userId}";

            await _redis.StringSetAsync(key, 1);

            var newJti = Guid.NewGuid().ToString();

            var accessToken = await _tokenService.GenerateToken(user, newJti);

            var refreshToken = _tokenService.GenerateRefreshToken(user, newJti);

            _logger.LogInformation("End RefreshLoginAsync");

            return new LoginResponse
            {
                UserId = user.Id,
                UserType = user.UserType,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpireIn = (_tokenSettings.AccessTokenExpirationHours + AuthConstant.BONUS_HOUR_REFRESH_TOKEN) * 60 * 60,
                IsChangedPassword = user.IsChangedPassword
            };
        }

        public async Task UpdatePasswordAsync(UpdatePasswordRequest request)
        {
            _logger.LogInformation("Start UpdatePasswordAsync");
            if (string.Equals(request.CurrentPassword, request.NewPassword))
            {
                throw new BadRequestException("New password must be different from current password");
            }

            var user = await _userRepository
                .Queryable
                .FirstAsync(u => u.Id == _currentUserContext.UserId);

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new BadRequestException("Wrong password");
            }

            await UpdateUserPassword(user, request.NewPassword);
            _logger.LogInformation("End UpdatePasswordAsync");
        }

        public async Task UpdatePasswordFirstTimeAsync(UpdatePasswordFirstTimeRequest request)
        {
            _logger.LogInformation("Start UpdatePasswordFirstTimeAsync");
            var user = await _userRepository
                .Queryable
                .FirstAsync(u => u.Id == _currentUserContext.UserId);

            if (user.IsChangedPassword)
            {
                throw new BadRequestException("You has changed default password");
            }

            if (BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new BadRequestException("New password must be different from current password");
            }

            await UpdateUserPassword(user, request.Password);
            _logger.LogInformation("End UpdatePasswordFirstTimeAsync");
        }

        private async Task UpdateUserPassword(User user, string password)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            user.IsChangedPassword = true;

            await _userRepository.UpdateAsync(user);
            await _userRepository.UnitOfWork.SaveChangesAsync();
        }
    }
}
