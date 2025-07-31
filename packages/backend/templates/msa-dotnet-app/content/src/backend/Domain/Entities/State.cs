using System.Diagnostics.CodeAnalysis;

namespace Domain.Entities
{
    [ExcludeFromCodeCoverage]
    public class State : BaseEntity
    {
        public string Name { get; set; } = default!;
        public string TypeEntity { get; set; } = default!;
        public string Action { get; set; } = default!;
    }
}