using API.Attributes;
using API.Services.Abstracts;
using AutoMapper;
using Domain.Common.Constants;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/report")]
    [Authenticate(UserTypeEnum.Admin)]
    public class ReportController : APIController<ReportController>
    {
        private readonly IReportService _reportService;
        public ReportController(
        IHttpContextAccessor httpContextAccessor,
        ILogger<ReportController> logger,
        IAuthService authService,
        IReportService reportService
        ) : base(httpContextAccessor, logger, authService)
        {
            _reportService = reportService ?? throw new ArgumentException(nameof(reportService));
        }

        [HttpGet]
        public async Task<PaginationData<BasicReportResponse>> GetReport([FromQuery] GetListCategoryReportRequest request)
        {
            return await _reportService.GetReportAsync(request);
        }

        [HttpGet("export")]
        public async Task<IActionResult> GetExport()
        {
            var fileBytes = await _reportService.GetExportAsync();
            return File(fileBytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Report Document.xlsx");
        }
    }
}