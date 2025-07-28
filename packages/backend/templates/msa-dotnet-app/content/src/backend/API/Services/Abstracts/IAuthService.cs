using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;

namespace API.Services.Abstracts
{
    public interface IAuthService
    {
        Task<User?> GetUserForAuth(int id);
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task LogoutAsync(string userId, string jti);
        Task<LoginResponse> RefreshLoginAsync(RefreshLoginRequest request);
        Task UpdatePasswordAsync(UpdatePasswordRequest request);
        Task UpdatePasswordFirstTimeAsync(UpdatePasswordFirstTimeRequest request);
    }
}