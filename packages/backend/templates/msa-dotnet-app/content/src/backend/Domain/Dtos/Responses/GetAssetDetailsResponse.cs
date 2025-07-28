using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class GetAssetDetailsResponse
    {
        public int Id { get; set; }
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public int? CategoryId { get; set; }
        public string CategoryName { get; set; } = default!;
        public DateTime? InstalledDate { get; set; }
        public int State { get; set; }
        public string Specification { get; set; } = default!;
        public int? LocationId { get; set; }
        public string LocationName { get; set; } = default!;
        public List<AssignmentHistoryResponse> History { get; set; } = new();
    }

}