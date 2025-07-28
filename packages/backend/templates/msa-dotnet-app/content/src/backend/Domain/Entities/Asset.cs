using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Common.Enum;

namespace Domain.Entities
{
    [ExcludeFromCodeCoverage]
    public class Asset : BaseEntity
    {
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public int CategoryId { get; set; }
        public Category Category { get; set; } = default!;
        public string Specification { get; set; } = default!;
        public DateTime InstalledDate { get; set; }
        public AssetStateEnum State { get; set; } = AssetStateEnum.Available;
        public int LocationId { get; set; }
        public Location Location { get; set; } = default!;
    }
}
