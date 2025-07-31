using System;
using System.Diagnostics.CodeAnalysis;
using Domain.Common.Enum;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]    
    public class CreateAssignmentResponse
    {
        public int Id { get; set; }
        public int AssetId { get; set; }
        public string AssetCode { get; set; } = default!;
        public string AssetName { get; set; } = default!;
        public string AssignedTo { get; set; } = default!;
        public string AssignedBy { get; set; } = default!;
        public DateTime AssignedDate { get; set; }
        public string? Note { get; set; }
        public AssignmentStateEnum State { get; set; }
    }
}