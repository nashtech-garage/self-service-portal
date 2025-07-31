using Domain.Common.Constants;
using Domain.Entities;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class GetAssignableUsersRequest : QueryRequest
    {
        public override string SortBy { get; set; } = nameof(User.JoinedDate);

        public override string Direction { get; set; } = PaginationConstants.DESCENDING;

        public string? KeySearch { get; set; }
    }
}