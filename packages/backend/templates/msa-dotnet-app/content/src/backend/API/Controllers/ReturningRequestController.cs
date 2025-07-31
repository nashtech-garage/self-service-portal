using API.Attributes;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/returning-request-management")]
    [Authenticate(UserTypeEnum.Admin)]
    [RequestTimeout(ConfigConstants.ShortTimeout)]
    public class ReturningRequestController : APIController<ReturningRequest>
    {
        private readonly IReturningRequestService _returningRequestService;

        public ReturningRequestController(IHttpContextAccessor httpContextAccessor, 
            ILogger<ReturningRequest> logger,
            IAuthService authService,
            IReturningRequestService returningRequestService) : base(httpContextAccessor, logger, authService)
        {
            _returningRequestService = returningRequestService ?? throw new ArgumentNullException(nameof(returningRequestService));
        }

        [HttpGet]
        public async Task<PaginationData<ListBasicReturningResponse>> GetReturningRequestsAsync([FromQuery] GetListReturningRequest request)
        {
            var data = await _returningRequestService.GetReturningRequestsAsync(request);

            return data;
        }

        [HttpPatch("{returningRequestId}/cancel")]
        public async Task<IActionResult> CancelReturningRequestAsync(int returningRequestId)
        {
            await _returningRequestService.CancelReturningRequestStateAsync(returningRequestId);

            return OkResponse<string>(string.Empty, "Returning request cancelled successfully");
        }

        [HttpPatch("{returningRequestId}/complete")]
        public async Task<IActionResult> CompleteReturningRequestAsync(int returningRequestId)
        {
            await _returningRequestService.CompleteReturningRequestAsync(returningRequestId);

            return OkResponse<string>(string.Empty, "Returning request completed successfully");
        }
    }
}
