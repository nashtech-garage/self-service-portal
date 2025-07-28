using System.Diagnostics.CodeAnalysis;
using Domain.Common.Enum;

namespace Domain.Entities
{
    [ExcludeFromCodeCoverage]
    public class User : BaseEntity
    {
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public DateTime DateOfBirth { get; set; }
        public DateTime JoinedDate { get; set; }
        public byte Gender { get; set; } = default!;
        public UserTypeEnum UserType { get; set; }
        public string StaffCode { get; set; } = default!;
        public int LocationId { get; set; }
        public Location Location { get; set; } = default!;
        public string Username { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;
        public bool IsChangedPassword { get; set; } = default!;
        public bool IsDisable { get; set; } = false;
    }
}