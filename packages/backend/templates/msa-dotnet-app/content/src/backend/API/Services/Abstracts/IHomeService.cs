using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;

namespace API.Services.Abstracts
{
    public interface IHomeService
    {
        Task<PaginationData<ListBasicHomeAssignmentResponse>> GetMyAssignmentsAsync(GetListHomeAssignmentRequest request);
        Task<DetailHomeAssignmentResponse?> GetMyAssignmentDetailAsync(int assignmentId);
        Task UpdateMyAssignmentStateAsync(int assignmentId, AssignmentStateEnum state);
        Task CreateReturningRequestAsync(int assignmentId);
    }
}