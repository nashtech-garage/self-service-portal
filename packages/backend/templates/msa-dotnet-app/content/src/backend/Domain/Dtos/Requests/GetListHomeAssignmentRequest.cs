using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Common.Constants;
using Domain.Dtos.Responses;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class GetListHomeAssignmentRequest : QueryRequest
    {
        public override string SortBy { get; set; } = nameof(ListBasicHomeAssignmentResponse.AssignedDate);
        public override string Direction { get; set; } = PaginationConstants.DESCENDING;
    }
}