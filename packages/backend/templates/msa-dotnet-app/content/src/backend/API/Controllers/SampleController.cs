using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    // This is an example controller
    [ApiController]
    [Route("api/sample")]
    [RequestTimeout(ConfigConstants.ShortTimeout)]
    public class SampleController : APIController<SampleController>
    {
        private readonly ISampleService _sampleService;

        public SampleController(
            IHttpContextAccessor httpContextAccessor,
            ILogger<SampleController> logger,
            ISampleService sampleService, IAuthService authService) : base(httpContextAccessor, logger, authService)
        {
            _sampleService = sampleService ?? throw new ArgumentNullException(nameof(sampleService));
        }

        // This is an example request
        [HttpGet("")]
        public async Task<IActionResult> SampleGet()
        {
            var data = await _sampleService.SampleGetAsync();
            return OkResponse<SampleResponse>(data, "Get data successfully");
        }

        [HttpGet("with-auth")]
        [Authenticate(UserTypeEnum.Admin, UserTypeEnum.Staff)]
        public async Task<ActionResult<string>> SampleGetWithAuth(string value)
        {
            var user = await GetAuth();

            return OkResponse<User>(user, "Get data successfully");
        }

        [HttpPost("")]
        public async Task<IActionResult> SamplePost([FromBody] SampleRequest request)
        {
            await Task.CompletedTask;
            return OkResponse<object>(1, "ssss");
        }

        [HttpGet("timeout")]
        public async Task SampleTimeoutRequest(CancellationToken cancellationToken = default)
        {
            await Task.Delay(TimeSpan.FromSeconds(ConfigConstants.RequestTime + 1), cancellationToken);
        }

        [HttpGet("sync-redis")]
        public async Task<ActionResult<string>> SyncRedis()
        {
            await _sampleService.SyncRedisAsync();

            return OkResponse<string>(string.Empty, "Sync data successfully");
        }
    }
}