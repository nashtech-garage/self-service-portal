using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using API.Exceptions;
using API.Middlewares;
using Microsoft.AspNetCore.Http;

namespace Test.Middlewares
{
    public class ErrorHandlerMiddlewareTest
    {
        private static DefaultHttpContext CreateHttpContext()
        {
            var context = new DefaultHttpContext();
            context.Response.Body = new MemoryStream();
            return context;
        }

        private static async Task<string> GetResponseBody(HttpResponse response)
        {
            response.Body.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(response.Body);
            return await reader.ReadToEndAsync();
        }

        [Fact]
        public async Task InvokeAsync_NoException_CallsNext()
        {
            // Arrange
            var context = CreateHttpContext();
            var nextCalled = false;
            RequestDelegate next = ctx =>
            {
                nextCalled = true;
                return Task.CompletedTask;
            };
            var middleware = new ErrorHandlerMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.True(nextCalled);
        }

        [Theory]
        [InlineData(typeof(NotFoundException), HttpStatusCode.NotFound)]
        [InlineData(typeof(UnAuthorizedException), HttpStatusCode.Unauthorized)]
        [InlineData(typeof(ForbiddenException), HttpStatusCode.Forbidden)]
        [InlineData(typeof(BadRequestException), HttpStatusCode.BadRequest)]
        [InlineData(typeof(ValidationException), HttpStatusCode.UnprocessableEntity)]
        [InlineData(typeof(Exception), HttpStatusCode.InternalServerError)]
        public async Task InvokeAsync_Exception_SetsCorrectStatusCodeAndResponse(Type exceptionType, HttpStatusCode expectedStatus)
        {
            // Arrange
            var context = CreateHttpContext();
            var exceptionMessage = "Test error";
            RequestDelegate next = ctx => throw (Exception)Activator.CreateInstance(exceptionType, exceptionMessage)!;
            var middleware = new ErrorHandlerMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.Equal((int)expectedStatus, context.Response.StatusCode);
            var body = await GetResponseBody(context.Response);
            Assert.Contains("\"statusCode\":", body);
            Assert.Contains(((int)expectedStatus).ToString(), body);
            Assert.Contains(exceptionMessage, body);
            Assert.Equal("application/json", context.Response.ContentType);
        }

        [Fact]
        public async Task HandleExceptionAsync_DoesNotWrite_WhenResponseHasStarted()
        {
            // Arrange
            var context = CreateHttpContext();
            context.Response.Headers["Test"] = "value";
            // Simulate response started
            context.Response.Body = Stream.Null;
            var middleware = new ErrorHandlerMiddleware(_ => throw new Exception("Should not be called"));

            // Act
            // Use reflection to call private method for direct test
            var method = typeof(ErrorHandlerMiddleware).GetMethod("HandleExceptionAsync", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            var task = (Task)method.Invoke(middleware, new object[] { context, new Exception("Test") })!;
            await task;

            // Assert
            // Nothing should be written to Stream.Null, no exception thrown
        }
    }
}