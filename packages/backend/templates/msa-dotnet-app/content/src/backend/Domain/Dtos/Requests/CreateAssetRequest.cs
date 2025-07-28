using Domain.Common.Enum;
using Domain.Dtos.Validators;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class CreateAssetRequest
    {
        [NameValidator]
        public string Name { get; set; } = default!;

        [PositiveIntegerValidator("Category Id")]
        public int CategoryId { get; set; }

        [SpecificationValidator]
        public string Specification { get; set; } = default!;

        [InstalledDateValidator]
        public DateTime InstalledDate { get; set; }

        [Required]
        [Range(1, 2, ErrorMessage = "Asset state must be either Available (1) or NotAvailable (2)")]
        public AssetStateEnum State { get; set; } = AssetStateEnum.Available;
    }
}
