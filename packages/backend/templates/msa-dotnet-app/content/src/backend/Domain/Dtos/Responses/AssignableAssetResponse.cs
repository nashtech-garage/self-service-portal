using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class AssignableAssetResponse
    {
        public int Id { get; set; }
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string CategoryName { get; set; } = default!;
        public int CategoryId { get; set; }
    }
}