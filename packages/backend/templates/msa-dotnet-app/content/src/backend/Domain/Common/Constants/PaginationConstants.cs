using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Common.Constants
{
    [ExcludeFromCodeCoverage]
    public static partial class PaginationConstants
    {
        public const int PageSize = 15;
        public const int PageStart = 1;
        public const string DefaultSortKey = "Id";

        public const string ASCENDING = "ASC";
        public const string DESCENDING = "DESC";
    }
}