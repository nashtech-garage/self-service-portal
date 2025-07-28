using System.Diagnostics.CodeAnalysis;
using Domain.Validators;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class UpdatePasswordRequest
    {
        [PasswordValidator]
        public string CurrentPassword { get; set; } = default!;

        [PasswordValidator]
        public string NewPassword { get; set; } = default!;
    }
}