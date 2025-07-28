using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class SampleRequest
    {
        [Required]
        public string YourFirstName { get; set; } = default!;
        [Required]
        public string YourLastName { get; set; } = default!;
    }
}