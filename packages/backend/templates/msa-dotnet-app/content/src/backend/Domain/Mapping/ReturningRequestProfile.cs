using AutoMapper;
using Domain.Dtos.Responses;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Mapping
{
    [ExcludeFromCodeCoverage]
    public class ReturningRequestProfile : Profile
    {
        public ReturningRequestProfile()
        {
            CreateMap<ReturningRequest, ListBasicReturningResponse>()
                .ForMember(dest => dest.AssetCode, opt => opt.MapFrom(src => src.Assignment.Asset.Code))
                .ForMember(dest => dest.AssetName, opt => opt.MapFrom(src => src.Assignment.Asset.Name))
                .ForMember(dest => dest.AssignedDate, opt => opt.MapFrom(src => src.Assignment.AssignedDate))
                .ForMember(dest => dest.RequestedBy, opt => opt.MapFrom(src => src.RequestedByUser != null ? src.RequestedByUser.Username : null))
                .ForMember(dest => dest.AcceptedBy, opt => opt.MapFrom(src => src.AcceptedByUser != null ? src.AcceptedByUser.Username : null))
                .ForMember(dest => dest.ReturnedDate, opt => opt.MapFrom(src => src.ReturnDate));
        }
    }
}
