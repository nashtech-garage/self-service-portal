using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Any;

namespace API.Services.Abstracts;

public interface IReportService
{
    public Task<PaginationData<BasicReportResponse>> GetReportAsync(GetListCategoryReportRequest request);
    public Task<byte[]> GetExportAsync();
    public Task<(List<StateDto> States, List<CategoryWithStateDto> Categories)> GetAllReport();
}
