using API.Attributes;
using API.Exceptions;
using API.Services;
using API.Services.Abstracts;
using Domain.Common.Enum;
using Domain.Dtos;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Domain.Common.Constants;
using Microsoft.AspNetCore.Http.Timeouts;

namespace API.Controllers
{
    [ApiController]
    [Route("api/user-management")]
    [Authenticate(UserTypeEnum.Admin)]
    [RequestTimeout(ConfigConstants.ShortTimeout)]
    public class UserController : APIController<UserController>
    {
        private readonly IUserService _userService;

        public UserController(IHttpContextAccessor httpContextAccessor, ILogger<UserController> logger, IAuthService authService, IUserService userService) 
            : base(httpContextAccessor, logger, authService)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        }

        [HttpGet]
        public async Task<PaginationData<ListBasicUserResponse>> GetUserList([FromQuery] GetListUserRequest request)
        {
            var data = await _userService.GetAllUserAsync(request);

            return data;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var data = await _userService.GetUserByIdAsync(id);

            return OkResponse<DetailUserResponse>(data, "Get data successfully");
        }

        [HttpPost("")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {   
            var result = await _userService.CreateUserAsync(request) ?? throw new BadRequestException("User creation failed");

            return CreatedResponse(result, "User created successfully");
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var result = await _userService.UpdateUserAsync(id, request);

            return OkResponse<DetailUserResponse>(result, "User updated successfully");
        }

        [HttpGet("{id}/check-has-valid-assignment")]
        public async Task<bool> CheckUserHasValidAssignment(int id)
        {
            return await _userService.CheckUserHasValidAssignmentAsync(id);
        }

        [HttpDelete("{id}/disable")]
        public async Task<IActionResult> DisableUser(int id)
        {
            await _userService.DisableUserAsync(id);

            return NoContentResponse();
        }
    }
}
