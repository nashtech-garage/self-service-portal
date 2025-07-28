using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Domain.Common.Enum;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class LoginResponse
    {
        public int UserId { get; set; }
        public UserTypeEnum UserType { get; set; }
        public string AccessToken { get; set; } = default!;
        public string RefreshToken { get; set; } = default!;
        public bool IsChangedPassword { get; set; } = true;
        public int ExpireIn { get; set; }
    }
}