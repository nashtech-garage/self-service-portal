using System.Diagnostics.CodeAnalysis;

namespace Domain.Common.Constants
{
    [ExcludeFromCodeCoverage]
    public static class RegexConstants
    {
        /// <summary>
        /// Regex pattern for password validation
        /// Requires at least 1 uppercase, 1 lowercase, 1 digit, 1 special character and between 6-100 characters
        /// </summary>
        public const string PasswordPattern = @"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%&*]).{6,100}$";

        /// <summary>
        /// Regex pattern for name validation
        /// Allows letters, numbers, apostrophe (') and underscore (_)
        /// </summary>
        public const string NamePattern = @"^[A-Za-z0-9'_ ]+$";

        /// <summary>
        /// Regex pattern for prefix category validation
        /// Allows exactly 2 uppercase letters
        /// </summary>
        public const string PrefixCategoryPattern = @"^[A-Z]{2}$";
    }
}