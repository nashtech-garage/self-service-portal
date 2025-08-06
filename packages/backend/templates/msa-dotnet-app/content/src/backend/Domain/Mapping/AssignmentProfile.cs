using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;

namespace Domain.Mapping
{
    [ExcludeFromCodeCoverage]
    public class AssignmentProfile : Profile
    {
        public AssignmentProfile()
        {
            CreateMap<Assignment, ListBasicHomeAssignmentResponse>()
                .ForMember(dest => dest.AssetCode, opt => opt.MapFrom(src => src.Asset.Code))
                .ForMember(dest => dest.AssetName, opt => opt.MapFrom(src => src.Asset.Name))
                .ForMember(dest => dest.AssetCategoryName, opt => opt.MapFrom(src => src.Asset.Category.Name))
                .ForMember(dest => dest.IsReturningRequested, opt => opt.Ignore());

            CreateMap<Assignment, DetailHomeAssignmentResponse>()
                .ForMember(dest => dest.AssetCode, opt => opt.MapFrom(src => src.Asset.Code))
                .ForMember(dest => dest.AssetName, opt => opt.MapFrom(src => src.Asset.Name))
                .ForMember(dest => dest.AssetSpecification, opt => opt.MapFrom(src => src.Asset.Specification))
                .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.AssignedToUser.Username))
                .ForMember(dest => dest.AssignedBy, opt => opt.MapFrom(src => src.AssignedByUser.Username));

            CreateMap<Assignment, DetailAssignmentAdminResponse>()
                .ForMember(dest => dest.AssetCode, opt => opt.MapFrom(src => src.Asset.Code))
                .ForMember(dest => dest.AssetName, opt => opt.MapFrom(src => src.Asset.Name))
                .ForMember(dest => dest.AssetSpecification, opt => opt.MapFrom(src => src.Asset.Specification))
                .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.AssignedToUser.Username))
                .ForMember(dest => dest.AssignedBy, opt => opt.MapFrom(src => src.AssignedByUser.Username));

            CreateMap<Assignment, DetailAssignmentAdminEditResponse>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.AssignedToUser.Id))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.AssignedToUser.FirstName} {src.AssignedToUser.LastName}"))
                .ForMember(dest => dest.AssetName, opt => opt.MapFrom(src => src.Asset.Name));

            CreateMap<Assignment, ListBasicAssignmentAdminResponse>()
                .ForMember(dest => dest.AssetCode, opt => opt.MapFrom(src => src.Asset.Code))
                .ForMember(dest => dest.AssetName, opt => opt.MapFrom(src => src.Asset.Name))
                .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.AssignedToUser.Username))
                .ForMember(dest => dest.AssignedBy, opt => opt.MapFrom(src => src.AssignedByUser.Username))
                .ForMember(dest => dest.IsReturningRequested, opt => opt.Ignore());

            CreateMap<Assignment, AssignmentHistoryResponse>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.AssignedDate))
                .ForMember(dest => dest.AssignedToId, opt => opt.MapFrom(src => src.AssignedTo))
                .ForMember(dest => dest.AssignedToUsername, opt => opt.MapFrom(src => src.AssignedToUser.Username))
                .ForMember(dest => dest.AssignedById, opt => opt.MapFrom(src => src.AssignedBy))
                .ForMember(dest => dest.AssignedByUsername, opt => opt.MapFrom(src => src.AssignedByUser.Username));

            CreateMap<Assignment, CreateAssignmentResponse>()
                .ForMember(dest => dest.AssetCode, opt => opt.MapFrom(src => src.Asset.Code))
                .ForMember(dest => dest.AssetName, opt => opt.MapFrom(src => src.Asset.Name))
                .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.AssignedToUser.Username))
                .ForMember(dest => dest.AssignedBy, opt => opt.MapFrom(src => src.AssignedByUser.Username));

            CreateMap<Assignment, EditAssignmentResponse>()
                .ForMember(dest => dest.AssetCode, opt => opt.MapFrom(src => src.Asset.Code))
                .ForMember(dest => dest.AssetName, opt => opt.MapFrom(src => src.Asset.Name))
                .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.AssignedToUser.Username))
                .ForMember(dest => dest.AssignedBy, opt => opt.MapFrom(src => src.AssignedByUser.Username));

            CreateMap<UpdateAssignmentRequest, Assignment>()
                .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.UserId));
        }
    }
}
