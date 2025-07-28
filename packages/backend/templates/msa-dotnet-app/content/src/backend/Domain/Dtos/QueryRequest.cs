using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Domain.Common.Constants;

namespace Domain.Dtos
{
    [ExcludeFromCodeCoverage]
    public class QueryRequest
    {
        public int PageSize { get; set; } = PaginationConstants.PageSize;
        public int Page { get; set; } = PaginationConstants.PageStart;
        public virtual string SortBy { get; set; } = PaginationConstants.DefaultSortKey;
        public virtual string Direction { get; set; } = PaginationConstants.DESCENDING;
    }
}