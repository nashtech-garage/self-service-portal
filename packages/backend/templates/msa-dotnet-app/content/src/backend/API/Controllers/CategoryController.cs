using API.Attributes;
using API.Exceptions;
using API.Services;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/category-management")]
    [ApiController]
    [Authenticate(UserTypeEnum.Admin)]
    [RequestTimeout(ConfigConstants.ShortTimeout)]
    public class CategoryController : APIController<CategoryController>
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(IHttpContextAccessor httpContextAccessor, ILogger<CategoryController> logger, IAuthService authService, ICategoryService categoryService) : base(httpContextAccessor, logger, authService)
        {
            _categoryService = categoryService ?? throw new ArgumentNullException(nameof(categoryService));
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            await _categoryService.CreateCategoryAsync(request);

            return CreatedResponse("Create new category successfully");
        }
    }
}
