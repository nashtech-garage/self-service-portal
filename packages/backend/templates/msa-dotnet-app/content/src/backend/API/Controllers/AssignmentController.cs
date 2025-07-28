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
    [Authenticate(UserTypeEnum.Admin)]
    [Route("api/assignment-management")]
    [RequestTimeout(ConfigConstants.ShortTimeout)]
    public class AssignmentController : APIController<AssignmentController>
    {
        private readonly IAssignmentService _assignmentService;

        public AssignmentController(IHttpContextAccessor httpContextAccessor,
                                        ILogger<AssignmentController> logger,
                                        IAuthService authService,
                                        IAssignmentService assignmentService) : base(httpContextAccessor, logger, authService)
        {
            _assignmentService = assignmentService ?? throw new ArgumentNullException(nameof(assignmentService));
        }

        [HttpGet]
        public async Task<PaginationData<ListBasicAssignmentAdminResponse>> GetAssignmentsAdminAsync([FromQuery] GetListAssignmentAdminRequest request)
        {
            var result = await _assignmentService.GetAssignmentsAdminAsync(request);

            return result;
        }

        [HttpGet("{assignmentId}")]
        public async Task<IActionResult> GetAssignmentDetailAsync(int assignmentId)
        {
            var result = await _assignmentService.GetAssignmentDetailAsync(assignmentId);

            return OkResponse<DetailAssignmentAdminResponse>(result, "Get assignment detail successfully");
        }

        [HttpGet("edit/{assignmentId}")]
        public async Task<IActionResult> GetAssignmentDetailEditAsync(int assignmentId)
        {
            var result = await _assignmentService.GetAssignmentDetailEditAsync(assignmentId);
            
            return OkResponse<DetailAssignmentAdminEditResponse>(result, "Get assignment detail successfully");
        }

        [HttpPatch("{assignmentId}")]
        public async Task<IActionResult> UpdateAssignmentAsync(int assignmentId, [FromBody] UpdateAssignmentRequest request)
        {
            var result = await _assignmentService.UpdateAssignmentAsync(assignmentId, request);

            return OkResponse(result, "Update assignment successfully");
        }

        [HttpPost("{assignmentId}/returning-request")]
        public async Task<IActionResult> AssignmentReturningRequestAsync(int assignmentId)
        {
            await _assignmentService.CreateAssignmentReturningRequestAsync(assignmentId);

            return CreatedResponse<string>(string.Empty, "Returning request created successfully");
        }

        [HttpPost]
        public async Task<IActionResult> CreateAssignmentAsync([FromBody] CreateAssignmentRequest request)
        {
            var result = await _assignmentService.CreateAssignmentAsync(request);

            return CreatedResponse<CreateAssignmentResponse>(result, "Assignment created successfully");
        }

        [HttpGet("assignable-assets")]
        public async Task<PaginationData<AssignableAssetResponse>> GetAssignableAssetsAsync([FromQuery] GetAssignableAssetsRequest request)
        {
            var result = await _assignmentService.GetAssignableAssetsAsync(request);

            return result;
        }

        [HttpGet("assignable-users")]
        public async Task<PaginationData<AssignableUserResponse>> GetAssignableUsersAsync([FromQuery] GetAssignableUsersRequest request)
        {
            var result = await _assignmentService.GetAssignableUsersAsync(request);

            return result;
        }

        [HttpDelete("{assignmentId}")]
        public async Task<IActionResult> DeleteAssignmentAsync(int assignmentId)
        {
            await _assignmentService.DeleteAssignmentAsync(assignmentId);

            return NoContentResponse();
        }
    }
}