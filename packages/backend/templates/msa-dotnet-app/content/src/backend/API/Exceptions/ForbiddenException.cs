using System.Diagnostics.CodeAnalysis;

namespace API.Exceptions;

[ExcludeFromCodeCoverage]
public class ForbiddenException : Exception
{
    public ForbiddenException() : base() { }
    public ForbiddenException(string message) : base(message) { }
}