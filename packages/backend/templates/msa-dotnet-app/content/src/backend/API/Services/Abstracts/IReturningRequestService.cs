using Domain.Dtos.Requests;
using Domain.Dtos.Responses;

namespace API.Services.Abstracts
{
    public interface IReturningRequestService
    {
        Task<PaginationData<ListBasicReturningResponse>> GetReturningRequestsAsync(GetListReturningRequest request);
        Task CancelReturningRequestStateAsync(int returningRequestId);
        Task CompleteReturningRequestAsync(int returningRequestId);
    }
}
