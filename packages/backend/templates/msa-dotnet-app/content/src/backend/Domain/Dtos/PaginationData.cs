using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Dtos.Responses;

[ExcludeFromCodeCoverage]
public class PaginationData<T> where T : class
{
    public int CurrentPage { get; private set; }
    public int PageSize { get; private set; }
    public int Total { get; private set; }
    public int LastPage { get; private set; }
    public IEnumerable<T> Data { get; private set; }

    public PaginationData(IEnumerable<T> data, int pageSize, int currentPage, int total)
    {
        PageSize = pageSize;
        CurrentPage = currentPage;
        Total = total;
        Data = data;
        LastPage = (int)Math.Ceiling((double)total / pageSize);
    }
}