using System.ComponentModel.DataAnnotations;
using Domain.Common.Enum;
using Domain.Dtos.Validators;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]    
    public class CreateUserRequest
    {
        [NameValidator]
        public string FirstName { get; set; } = default!;

        [NameValidator]
        public string LastName { get; set; } = default!;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        [Range(0, 1)]
        public byte Gender { get; set; } = default!;

        [JoinedDateValidator]
        public DateTime JoinedDate { get; set; }

        [Required]
        [EnumDataType(typeof(UserTypeEnum), ErrorMessage = "User type must be either Admin (1) or Staff (2)")]
        public UserTypeEnum UserType { get; set; }
    }
}