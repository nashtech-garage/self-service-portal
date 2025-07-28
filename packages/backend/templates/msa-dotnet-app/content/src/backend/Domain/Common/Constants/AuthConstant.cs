using System.Diagnostics.CodeAnalysis;
using StackExchange.Redis;
namespace Domain.Common.Constants
{
    [ExcludeFromCodeCoverage]
    public class AuthConstant
    {
        public static RedisKey ACCESS_TOKEN_BLACK_LIST = "AUTH:access_token_black_list";
        public static RedisKey REFRESH_TOKEN_BLACK_LIST = "AUTH:refresh_token_black_list";
        public static RedisKey RetryLogin = "AUTH:retry_login";
        public static RedisKey UsernameList = "USER:username";
        public const int BONUS_HOUR_REFRESH_TOKEN = 48;
        public const uint MaxAllowUser = 1_000_000;
        public const int MaxRetryTime = 5;
        public const double BlockTime = 30; // Minutes
        public static string UsernameMaxPostfixKey = "username:maxpostfix:{0}";
        public static string AssetCodeMaxPostfixKey = "assetcode:maxpostfix:{0}";
    }
}