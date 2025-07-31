using Domain.Dtos;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Abstracts
{
    public interface IUserService
    {
        Task<PaginationData<ListBasicUserResponse>> GetAllUserAsync(GetListUserRequest parameters);
        Task<DetailUserResponse> GetUserByIdAsync(int userId);
        Task<CreateUserResponse?> CreateUserAsync(CreateUserRequest request);
        Task DisableUserAsync(int userId);
        Task<bool> CheckUserHasValidAssignmentAsync(int userId);
        Task<DetailUserResponse> UpdateUserAsync(int userId, UpdateUserRequest request);
    }
}