using System.Diagnostics.CodeAnalysis;
using Domain.Common.Constants;
using Domain.Entities;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class GetAssignableAssetsRequest : QueryRequest
    {
        public override string SortBy { get; set; } = nameof(Asset.CreatedAt);

        public override string Direction { get; set; } = PaginationConstants.DESCENDING;

        public string? KeySearch { get; set; }
    }
}