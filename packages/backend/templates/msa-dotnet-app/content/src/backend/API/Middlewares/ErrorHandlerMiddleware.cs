using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using API.Exceptions;
using Domain.Dtos;

namespace API.Middlewares
{
    public class ErrorHandlerMiddleware
    {
        private readonly RequestDelegate _next;

        public ErrorHandlerMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var response = context.Response;

            if (response.HasStarted) return; // Nếu response đã bắt đầu ghi dữ liệu, không xử lý nữa.

            response.ContentType = "application/json";

            var errorDetail = new BaseResponse
            {
                StatusCode = HttpStatusCode.InternalServerError,
                Message = exception.Message,
            };

            // Xác định mã lỗi theo loại exception
            response.StatusCode = exception switch
            {
                NotFoundException => (int)HttpStatusCode.NotFound,
                UnAuthorizedException => (int)HttpStatusCode.Unauthorized,
                ForbiddenException => (int)HttpStatusCode.Forbidden,
                BadRequestException => (int)HttpStatusCode.BadRequest,
                ValidationException => (int)HttpStatusCode.UnprocessableEntity,
                TaskCanceledException => (int)HttpStatusCode.GatewayTimeout,
                _ => (int)HttpStatusCode.InternalServerError // Mặc định lỗi server
            };

            errorDetail.StatusCode = (HttpStatusCode)response.StatusCode;
            errorDetail.Message = exception.Message;

            var serializeOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            };

            await response.WriteAsync(JsonSerializer.Serialize(errorDetail, serializeOptions));
        }
    }
}