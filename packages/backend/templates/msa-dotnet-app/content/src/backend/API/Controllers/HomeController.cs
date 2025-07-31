using API.Attributes;
using API.Exceptions;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/home")]
    [Authenticate(UserTypeEnum.Admin, UserTypeEnum.Staff)]
    [RequestTimeout(ConfigConstants.ShortTimeout)]
    public class HomeController : APIController<HomeController>
    {
        private readonly IHomeService _homeService;

        public HomeController(IHttpContextAccessor httpContextAccessor,
                                ILogger<HomeController> logger,
                                IAuthService authService,
                                IHomeService homeService) : base(httpContextAccessor, logger, authService)
        {
            _homeService = homeService ?? throw new ArgumentNullException(nameof(homeService));
        }

        [HttpGet("my-assignment")]
        public async Task<PaginationData<ListBasicHomeAssignmentResponse>> GetMyAssignment([FromQuery] GetListHomeAssignmentRequest request)
        {
            var data = await _homeService.GetMyAssignmentsAsync(request);

            return data;
        }

        [HttpGet("my-assignment/{assignmentId}")]
        public async Task<IActionResult> GetAssignmentAsync(int assignmentId)
        {
            var assignment = await _homeService.GetMyAssignmentDetailAsync(assignmentId);

            return OkResponse<DetailHomeAssignmentResponse>(assignment!, "Get data successfully");
        }

        [HttpPatch("my-assignment/{assignmentId}/accept")]
        public async Task<IActionResult> AcceptAssignmentAsync(int assignmentId)
        {
            await _homeService.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Accepted);

            return OkResponse<string>(string.Empty, "Assignment accepted successfully");
        }

        [HttpPatch("my-assignment/{assignmentId}/decline")]
        public async Task<IActionResult> DeclineAssignmentAsync(int assignmentId)
        {
            await _homeService.UpdateMyAssignmentStateAsync(assignmentId, AssignmentStateEnum.Declined);

            return OkResponse<string>(string.Empty, "Assignment declined successfully");
        }

        [HttpPost("my-assignment/{assignmentId}/returning-request")]
        public async Task<IActionResult> CreateReturningRequestAsync(int assignmentId)
        {
            await _homeService.CreateReturningRequestAsync(assignmentId);

            return CreatedResponse<string>(string.Empty, "Returning request created successfully");
        }
    }
}