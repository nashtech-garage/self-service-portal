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
    public interface IAssignmentRepository : IRepository<Assignment>
    {
        Task<PaginationData<Assignment>> GetHomeAssignmentsForUserAsync(GetListHomeAssignmentRequest request, int userId);
        Task<PaginationData<Assignment>> GetAssignmentsAdminAsync(GetListAssignmentAdminRequest request, int locationId);
    }
}
