using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Common.Enum;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class DetailHomeAssignmentResponse
    {
        public int Id { get; set; }
        public string AssetCode { get; set; } = default!;
        public string AssetName { get; set; } = default!;
        public string AssetSpecification { get; set; } = default!;
        public string AssignedTo { get; set; } = default!;
        public string AssignedBy { get; set; } = default!;
        public DateTime AssignedDate { get; set; }
        public AssignmentStateEnum State { get; set; }
        public string? Note { get; set; }
    }
}
