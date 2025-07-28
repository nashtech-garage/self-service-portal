using System.Diagnostics.CodeAnalysis;
using Domain.Common.Constants;
using Domain.Dtos.Responses;
using Domain.Entities;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class GetListAssetRequest : QueryRequest
    {
        public List<int>? CategoryIds { get; set; }
        public List<int>? States { get; set; }
        public string? KeySearch { get; set; }
        public override string SortBy { get; set; } = nameof(Asset.CreatedAt);
        public override string Direction { get; set; } = PaginationConstants.DESCENDING;
    }
}