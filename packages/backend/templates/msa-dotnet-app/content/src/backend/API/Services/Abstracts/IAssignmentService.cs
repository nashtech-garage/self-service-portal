using Domain.Dtos.Requests;
using Domain.Dtos.Responses;

namespace API.Services.Abstracts
{
    public interface IAssignmentService
    {
        Task CreateAssignmentReturningRequestAsync(int assignmentId);
        Task<PaginationData<ListBasicAssignmentAdminResponse>> GetAssignmentsAdminAsync(GetListAssignmentAdminRequest request);
        Task<DetailAssignmentAdminResponse> GetAssignmentDetailAsync(int assignmentId);
        Task<DetailAssignmentAdminEditResponse> GetAssignmentDetailEditAsync(int assignmentId);
        Task<CreateAssignmentResponse> CreateAssignmentAsync(CreateAssignmentRequest request);
        Task<PaginationData<AssignableAssetResponse>> GetAssignableAssetsAsync(GetAssignableAssetsRequest request);
        Task<PaginationData<AssignableUserResponse>> GetAssignableUsersAsync(GetAssignableUsersRequest request);
        Task<EditAssignmentResponse> UpdateAssignmentAsync(int assignmentId, UpdateAssignmentRequest request);
        Task DeleteAssignmentAsync(int assignmentId);
    }
}