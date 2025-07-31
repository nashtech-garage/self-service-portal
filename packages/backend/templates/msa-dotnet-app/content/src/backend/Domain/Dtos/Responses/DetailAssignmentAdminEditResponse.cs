using System.Diagnostics.CodeAnalysis;
using Domain.Common.Enum;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class DetailAssignmentAdminEditResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = default!;
        public int AssetId { get; set; }
        public string AssetName { get; set; } = default!;
        public DateTime AssignedDate { get; set; }
        public string? Note { get; set; }
        public AssignmentStateEnum State { get; set; }
    }
}