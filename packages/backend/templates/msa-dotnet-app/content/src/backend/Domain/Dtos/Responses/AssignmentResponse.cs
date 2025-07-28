using System;
using System.Diagnostics.CodeAnalysis;
using Domain.Common.Enum;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class AssignmentResponse
    {
        public int Id { get; set; }
        public int AssetId { get; set; }
        public string AssetCode { get; set; } = default!;
        public string AssetName { get; set; } = default!;
        public int AssignedTo { get; set; }
        public string AssignedToUsername { get; set; } = default!;
        public int AssignedBy { get; set; }
        public string AssignedByUsername { get; set; } = default!;
        public DateTime AssignedDate { get; set; }
        public string? Note { get; set; }
        public AssignmentStateEnum State { get; set; }
    }
}