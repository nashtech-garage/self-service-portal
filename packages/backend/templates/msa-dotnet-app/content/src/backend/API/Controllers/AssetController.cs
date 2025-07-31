using API.Attributes;
using API.Services;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authenticate(UserTypeEnum.Admin)]
    [ApiController]
    [Route("api/asset-management")]
    [RequestTimeout(ConfigConstants.ShortTimeout)]
    public class AssetController : APIController<AssetController>
    {
        private readonly IAssetService _assetService;

        public AssetController(IHttpContextAccessor httpContextAccessor,
            ILogger<AssetController> logger,
            IAuthService authService,
            IAssetService assetService) : base(httpContextAccessor, logger, authService)
        {
            _assetService = assetService ?? throw new ArgumentNullException(nameof(assetService));
        }

        [HttpGet]
        public async Task<PaginationData<ListBasicAssetResponse>> GetAssetsAsync([FromQuery] GetListAssetRequest request)
        {
            var data = await _assetService.GetAssetsAsync(request);

            return data;
        }

        [HttpGet("{assetId}")]
        public async Task<ActionResult<GetAssetDetailsResponse>> GetAssetDetailsAsync(int assetId)
        {
            var data = await _assetService.GetAssetDetailsAsync(assetId);

            return OkResponse(data, "Get asset details successfully");
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsset([FromBody] CreateAssetRequest request)
        {
            var result = await _assetService.CreateAssetAsync(request);

            return CreatedResponse(result, "Create new asset successfully");
        }

        [HttpPut("assetId")]
        public async Task<IActionResult> UpdateAsset(int assetId, [FromBody] UpdateAssetRequest request)
        {
            var result = await _assetService.UpdateAssetAsync(assetId, request);

            return OkResponse(result, "Update asset successfully");
        }

        [HttpDelete("{assetId}")]
        public async Task<IActionResult> DeleteAsset(int assetId)
        {
            await _assetService.DeleteAssetAsync(assetId);

            return NoContentResponse();
        }
    }
}
