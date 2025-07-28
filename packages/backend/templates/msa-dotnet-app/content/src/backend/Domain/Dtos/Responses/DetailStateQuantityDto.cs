using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Responses;

[ExcludeFromCodeCoverage]
public class StateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
}

[ExcludeFromCodeCoverage]
public class CategoryStateQuantityDto
{
    public int Id { get; set; }
    public int Quantity { get; set; }
}

[ExcludeFromCodeCoverage]
public class CategoryWithStateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public int Total { get; set; }
    public List<CategoryStateQuantityDto> States { get; set; } = new();
}
