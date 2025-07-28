using System.Diagnostics.CodeAnalysis;
using Domain.Common.Enum;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class AssignableUserResponse
    {
        public int Id { get; set; }
        public string StaffCode { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public UserTypeEnum Type { get; set; }
    }
}