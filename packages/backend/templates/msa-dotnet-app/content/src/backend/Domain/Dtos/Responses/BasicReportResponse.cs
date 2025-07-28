using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class BasicReportResponse
    {
        public List<StateDto> States { get; set; } = new();
        public List<Dictionary<string, object>> Categories { get; set; } = new();
    }
}