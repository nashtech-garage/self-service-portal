using System.Diagnostics.CodeAnalysis;
using AutoMapper;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;

namespace Domain.Mapping
{
    [ExcludeFromCodeCoverage]
    public class CategoryProfile : Profile
    {
        public CategoryProfile()
        {
            CreateMap<CreateCategoryRequest, Category>()
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Category))
               .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.Prefix));

            CreateMap<Category, OptionResponse>()
               .ForMember(dest => dest.Value, opt => opt.MapFrom(src => src.Id))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}
