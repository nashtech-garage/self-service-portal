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
    public class Assignment : BaseEntity
    {
        public DateTime AssignedDate { get; set; }
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = default!;
        public int AssignedTo { get; set; }
        public User AssignedToUser { get; set; } = default!;
        public int AssignedBy { get; set; }
        public User AssignedByUser { get; set; } = default!;
        public string? Note { get; set; }
        public AssignmentStateEnum State { get; set; } = AssignmentStateEnum.WaitingForAcceptance;
    }
}
