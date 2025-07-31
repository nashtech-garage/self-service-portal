using API.Attributes;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    [RequestTimeout(ConfigConstants.ShortTimeout)]
    public class AuthController : APIController<AuthController>
    {
        public AuthController(
            IHttpContextAccessor httpContextAccessor,
            ILogger<AuthController> logger,
            IAuthService authService) : base(httpContextAccessor, logger, authService)
        {
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var data = await _authService.LoginAsync(request);

            return OkResponse<LoginResponse>(data, "Login successfully");
        }

        [HttpPost("logout")]
        [Authenticate(UserTypeEnum.Admin, UserTypeEnum.Staff)]
        public async Task<IActionResult> Logout()
        {
            var jti = GetJti();

            var userId = (await GetAuth()).Id;

            await _authService.LogoutAsync(userId.ToString(), jti);

            return OkResponse<string>("Token revoked", "Logout successfully");
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshLoginRequest request)
        {
            var data = await _authService.RefreshLoginAsync(request);

            return OkResponse<LoginResponse>(data, "Refresh login successfully");
        }

        [HttpPut("change-password")]
        [Authenticate(UserTypeEnum.Admin, UserTypeEnum.Staff)]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
        {
            await _authService.UpdatePasswordAsync(request);

            return OkResponse<string>(string.Empty, "Your password has been changed successfully");
        }

        [HttpPut("first-change-password")]
        [Authenticate(UserTypeEnum.Admin, UserTypeEnum.Staff)]
        public async Task<IActionResult> UpdatePasswordFirstTime([FromBody] UpdatePasswordFirstTimeRequest request)
        {
            await _authService.UpdatePasswordFirstTimeAsync(request);

            return OkResponse<string>(string.Empty, "Your password has been changed successfully");
        }
    }
}