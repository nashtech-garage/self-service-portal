using Domain.Dtos.Requests;
using Domain.Dtos.Responses;

namespace API.Services.Abstracts
{
    public interface ICategoryService
    {
        Task CreateCategoryAsync(CreateCategoryRequest request);
        Task<IEnumerable<OptionResponse>> GetCategoriesAsync();
    }
}
