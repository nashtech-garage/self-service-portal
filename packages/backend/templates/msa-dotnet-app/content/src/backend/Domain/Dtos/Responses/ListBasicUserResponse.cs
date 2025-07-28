using Domain.Common.Enum;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class ListBasicUserResponse
    {
        public int Id { get; set; }
        public string StaffCode { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string Username { get; set; } = default!;
        public DateTime JoinedDate { get; set; }
        public UserTypeEnum UserType { get; set; }
    }
}
