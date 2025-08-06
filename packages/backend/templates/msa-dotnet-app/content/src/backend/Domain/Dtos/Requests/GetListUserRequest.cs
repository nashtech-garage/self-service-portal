using Domain.Common.Constants;
using Domain.Common.Enum;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class GetListUserRequest : QueryRequest
    {
        public string? KeySearch { get; set; }
        public List<UserTypeEnum> UserType { get; set; } = new List<UserTypeEnum>();
        public override string SortBy { get; set; } = "JoinedDate";
        public override string Direction { get; set; } = PaginationConstants.ASCENDING;
    }
}
