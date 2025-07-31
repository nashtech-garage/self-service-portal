using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Domain.Dtos;

[ExcludeFromCodeCoverage]
public class BaseResponse<T> where T : class
{
    public HttpStatusCode StatusCode { get; set; } = HttpStatusCode.NoContent;
    public string Message { get; set; } = null!;
    public T Data { get; set; } = null!;

    public object? Errors { get; set; }

    public object? Meta { get; set; }
}

[ExcludeFromCodeCoverage]
public class BaseResponse : BaseResponse<object>
{
}