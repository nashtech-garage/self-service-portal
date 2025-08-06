using Domain.Common.Enum;
using Domain.Common.Constants;
using Domain.Dtos.Responses;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class GetListAssignmentAdminRequest : QueryRequest
    {

        public string? KeySearch { get; set; }

        public List<AssignmentStateEnum>? State { get; set; } = new List<AssignmentStateEnum>();

        public DateTime? AssignedDate { get; set; }

        public override string SortBy { get; set; } = nameof(ListBasicAssignmentAdminResponse.AssignedDate);

        public override string Direction { get; set; } = PaginationConstants.ASCENDING;
    }
}