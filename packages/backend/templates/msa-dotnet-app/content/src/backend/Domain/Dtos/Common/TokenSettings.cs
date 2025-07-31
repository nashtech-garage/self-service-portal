using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Dtos.Common
{
    [ExcludeFromCodeCoverage]
    public class TokenSettings
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int AccessTokenExpirationHours { get; set; }
        public string SigninCredentials { get; set; } = string.Empty;
    }
}