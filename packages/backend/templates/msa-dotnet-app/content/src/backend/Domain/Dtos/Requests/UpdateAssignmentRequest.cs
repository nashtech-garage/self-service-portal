using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Domain.Dtos.Validators;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class UpdateAssignmentRequest
    {
        [PositiveIntegerValidator("User id")]
        public int UserId { get; set; }

        [PositiveIntegerValidator("Asset id")]
        public int AssetId { get; set; }
        public DateTime AssignedDate { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }
    }
}