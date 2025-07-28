using API.Exceptions;
using API.Services.Abstracts;
using AutoMapper;
using Domain.Common;
using Domain.Common.Constants;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public CategoryService(ICategoryRepository categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task CreateCategoryAsync(CreateCategoryRequest request)
        {
            request.Category = request.Category.Trim();

            var existingCategoryName = _categoryRepository.Queryable
                .WithoutDeleted()
                .FirstOrDefault(c => c.Name == request.Category);

            if (existingCategoryName != null)
            {
                throw new BadRequestException($"Category is already existed. Please enter a different category");
            }

            var existingCategoryPrefix = _categoryRepository.Queryable
                .WithoutDeleted()
                .FirstOrDefault(c => c.Code == request.Prefix);

            if (existingCategoryPrefix != null)
            {
                throw new BadRequestException($"Prefix is already existed. Please enter a different prefix");
            }

            var category = _mapper.Map<Category>(request);

            await _categoryRepository.AddAsync(category);
            await _categoryRepository.UnitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<OptionResponse>> GetCategoriesAsync()
        {
            var categories = await _categoryRepository.Queryable
                .WithoutDeleted()
                .ApplySorting(nameof(Category.CreatedAt), PaginationConstants.DESCENDING)
                .ToListAsync();

            return _mapper.Map<IEnumerable<OptionResponse>>(categories);
        }
    }
}
