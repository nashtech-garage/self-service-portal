
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;

namespace Domain.Repositories
{
    public interface IReturningRequestRepository : IRepository<ReturningRequest>
    {
        Task<PaginationData<ReturningRequest>> GetReturningRequestsAsync(GetListReturningRequest request, int locationId);
        Task<List<int>> GetReturningAssignmentIdsAsync(List<int> assignmentIds);
    }
}