using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class RefreshLoginRequest
    {
        [Required(ErrorMessage = "Refresh Token is required")]
        public string RefreshToken { get; set; } = default!;
    }
}