using Domain.Common.Enum;
using Domain.Dtos.Validators;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class UpdateAssetRequest
    {
        [NameValidator]
        public string Name { get; set; } = default!;

        [SpecificationValidator]
        public string Specification { get; set; } = default!;

        [InstalledDateValidator]
        public DateTime InstalledDate { get; set; }

        [UpdateAssetStateValidator]
        public AssetStateEnum State { get; set; }
    }
}
