using Domain.Common.Constants;
using Domain.Common.Enum;
using Domain.Dtos.Responses;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class GetListReturningRequest : QueryRequest
    {
        public string? KeySearch { get; set; }

        public List<ReturningRequestStateEnum>? State { get; set; } = new List<ReturningRequestStateEnum>();

        public DateTime? ReturnedDate { get; set; }

        public override string SortBy { get; set; } = nameof(ListBasicReturningResponse.AssignedDate);

        public override string Direction { get; set; } = PaginationConstants.DESCENDING;
    }
}
