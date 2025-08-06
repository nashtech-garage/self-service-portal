using AutoMapper;
using Domain.Dtos.Responses;
using Domain.Entities;
using Domain.Extensions;
using Domain.Dtos.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Mapping
{
    [ExcludeFromCodeCoverage]
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, ListBasicUserResponse>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
            CreateMap<User, DetailUserResponse>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
            CreateMap<User, GetMeResponse>();
            CreateMap<User, CreateUserResponse>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.RawPassword, opt => opt.Ignore());
            CreateMap<User, AssignableUserResponse>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.UserType));
            CreateMap<UpdateUserRequest, User>();
        }
    }
}
