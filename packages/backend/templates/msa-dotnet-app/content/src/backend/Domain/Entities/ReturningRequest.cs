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
    public class ReturningRequest : BaseEntity
    {
        public DateTime? ReturnDate { get; set; }
        public ReturningRequestStateEnum State { get; set; } = ReturningRequestStateEnum.WaitingForReturning;
        public int? AcceptedBy { get; set; }
        public User? AcceptedByUser { get; set; }
        public int AssignmentId { get; set; } = default!;
        public Assignment Assignment { get; set; } = default!;
        public int RequestedBy { get; set; } = default!;
        public User RequestedByUser { get; set; } = default!;
    }
}
