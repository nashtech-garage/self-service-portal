using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Domain.Dtos.Validators;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class CreateAssignmentRequest
    {
        [PositiveIntegerValidator("User Id")]
        public int UserId { get; set; }

        [PositiveIntegerValidator("Asset Id")]
        public int AssetId { get; set; }

        [AssignedDateValidator]
        public DateTime AssignedDate { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }
    }
}
