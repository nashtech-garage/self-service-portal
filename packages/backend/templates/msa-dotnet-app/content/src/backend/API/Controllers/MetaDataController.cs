using API.Attributes;
using API.Services;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Common.Enum;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/meta-data")]
    [Authenticate(UserTypeEnum.Admin)]
    [RequestTimeout(ConfigConstants.ShortTimeout)]
    public class MetaDataController : APIController<MetaDataController>
    {
        private readonly ICategoryService _categoryService;

        public MetaDataController(IHttpContextAccessor httpContextAccessor, ILogger<MetaDataController> logger, IAuthService authService, ICategoryService categoryService) : base(httpContextAccessor, logger, authService)
        {
            _categoryService = categoryService ?? throw new ArgumentNullException(nameof(categoryService));
        }

        [HttpGet("get-categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _categoryService.GetCategoriesAsync();

            return OkResponse(categories, "Get categories successfully");
        }
    }
}
