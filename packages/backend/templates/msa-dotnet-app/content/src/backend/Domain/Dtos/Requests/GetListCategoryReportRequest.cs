using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Domain.Common.Constants;
using Domain.Entities;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class GetListCategoryReportRequest : QueryRequest
    {
        public override string SortBy { get; set; } = nameof(Category.Name).ToLower();
        public override string Direction { get; set; } = PaginationConstants.ASCENDING;
    }
}