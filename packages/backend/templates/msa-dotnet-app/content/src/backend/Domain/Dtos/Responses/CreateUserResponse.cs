using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Domain.Common.Enum;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class CreateUserResponse
    {
        public int Id { get; set; }
        public string StaffCode { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string Username { get; set; } = default!;
        public DateTime JoinedDate { get; set; } = default!;
        public UserTypeEnum UserType { get; set; } = default!;
        public string RawPassword { get; set; } = default!;
    }
}