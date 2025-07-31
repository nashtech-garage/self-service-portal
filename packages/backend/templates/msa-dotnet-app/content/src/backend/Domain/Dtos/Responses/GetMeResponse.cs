using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Domain.Common.Enum;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class GetMeResponse
    {
        public int Id { get; set; }
        public string Username { get; set; } = default!;
        public bool IsChangedPassword { get; set; }
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public int LocationId { get; set; }
        public UserTypeEnum UserType { get; set; }
    }
}