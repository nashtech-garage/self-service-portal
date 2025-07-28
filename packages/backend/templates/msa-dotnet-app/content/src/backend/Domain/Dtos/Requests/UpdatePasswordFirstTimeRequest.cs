using System.Diagnostics.CodeAnalysis;
using Domain.Validators;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class UpdatePasswordFirstTimeRequest
    {
        [PasswordValidator]
        public string Password { get; set; } = default!;
    }
}