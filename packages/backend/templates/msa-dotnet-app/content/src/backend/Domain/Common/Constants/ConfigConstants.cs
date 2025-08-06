using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Common.Constants
{
    public class ConfigConstants
    {
        public const string IpRateLimit = "IpRateLimit";
        public const int RateLimit = 5;
        public const int RateLimitTime = 5; // Seconds
        public const string ShortTimeout = "ShortTimeout";
        public const string CORSAllowAll = "AllowAll";
        public const int RequestTime = 2;
    }
}