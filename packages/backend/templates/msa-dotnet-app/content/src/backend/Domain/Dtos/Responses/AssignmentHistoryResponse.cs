using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class AssignmentHistoryResponse
    {
        public DateTime? Date { get; set; }
        public DateTime? ReturnDate { get; set; }
        public int? AssignedToId { get; set; }
        public string AssignedToUsername { get; set; } = default!;
        public int? AssignedById { get; set; }
        public string AssignedByUsername { get; set; } = default!;
    }
}
