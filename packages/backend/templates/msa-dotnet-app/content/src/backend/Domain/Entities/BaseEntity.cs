using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Entities
{
    [ExcludeFromCodeCoverage]
    public abstract class BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public DateTimeOffset? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}