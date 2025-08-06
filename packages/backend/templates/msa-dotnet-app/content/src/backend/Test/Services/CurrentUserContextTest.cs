using API.Services;
using Domain.Common.Enum;
using Microsoft.AspNetCore.Http;
using Moq;

namespace Test.Services
{
    public class CurrentUserContextTest
    {
        private static IHttpContextAccessor CreateAccessorWithHeaders(IHeaderDictionary headers)
        {
            var mockContext = new Mock<HttpContext>();
            mockContext.SetupGet(c => c.Request.Headers).Returns(headers);

            var mockAccessor = new Mock<IHttpContextAccessor>();
            mockAccessor.SetupGet(a => a.HttpContext).Returns(mockContext.Object);

            return mockAccessor.Object;
        }

        [Fact]
        public void AllHeadersPresent_PropertiesReturnCorrectValues()
        {
            // Arrange
            var headers = new HeaderDictionary
            {
                { "Authorization-UserId", "123" },
                { "Authorization-UserType", UserTypeEnum.Admin.ToString() },
                { "Authorization-Jti", "jti-value" },
                { "Authorization-LocationId", "456" }
            };
            var accessor = CreateAccessorWithHeaders(headers);

            // Act
            var context = new CurrentUserContext(accessor);

            // Assert
            Assert.Equal(123, context.UserId);
            Assert.Equal((int)UserTypeEnum.Admin, context.UserType);
            Assert.Equal("jti-value", context.Jti);
            Assert.Equal(456, context.LocationId);
        }

        [Fact]
        public void MissingUserIdHeader_ThrowsUnauthorizedAccessException()
        {
            var headers = new HeaderDictionary
            {
                { "Authorization-UserType", UserTypeEnum.Admin.ToString() },
                { "Authorization-Jti", "jti-value" },
                { "Authorization-LocationId", "456" }
            };
            var accessor = CreateAccessorWithHeaders(headers);
            var context = new CurrentUserContext(accessor);

            Assert.Throws<UnauthorizedAccessException>(() => _ = context.UserId);
        }

        [Fact]
        public void MissingUserTypeHeader_ThrowsUnauthorizedAccessException()
        {
            var headers = new HeaderDictionary
            {
                { "Authorization-UserId", "123" },
                { "Authorization-Jti", "jti-value" },
                { "Authorization-LocationId", "456" }
            };
            var accessor = CreateAccessorWithHeaders(headers);
            var context = new CurrentUserContext(accessor);

            Assert.Throws<UnauthorizedAccessException>(() => _ = context.UserType);
        }

        [Fact]
        public void MissingJtiHeader_ThrowsUnauthorizedAccessException()
        {
            var headers = new HeaderDictionary
            {
                { "Authorization-UserId", "123" },
                { "Authorization-UserType", UserTypeEnum.Admin.ToString() },
                { "Authorization-LocationId", "456" }
            };
            var accessor = CreateAccessorWithHeaders(headers);
            var context = new CurrentUserContext(accessor);

            Assert.Throws<UnauthorizedAccessException>(() => _ = context.Jti);
        }

        [Fact]
        public void MissingLocationIdHeader_ThrowsUnauthorizedAccessException()
        {
            var headers = new HeaderDictionary
            {
                { "Authorization-UserId", "123" },
                { "Authorization-UserType", UserTypeEnum.Admin.ToString() },
                { "Authorization-Jti", "jti-value" }
            };
            var accessor = CreateAccessorWithHeaders(headers);
            var context = new CurrentUserContext(accessor);

            Assert.Throws<UnauthorizedAccessException>(() => _ = context.LocationId);
        }

        [Fact]
        public void InvalidUserIdHeader_ThrowsUnauthorizedAccessException()
        {
            var headers = new HeaderDictionary
            {
                { "Authorization-UserId", "not-an-int" },
                { "Authorization-UserType", UserTypeEnum.Admin.ToString() },
                { "Authorization-Jti", "jti-value" },
                { "Authorization-LocationId", "456" }
            };
            var accessor = CreateAccessorWithHeaders(headers);
            var context = new CurrentUserContext(accessor);

            Assert.Throws<UnauthorizedAccessException>(() => _ = context.UserId);
        }

        [Fact]
        public void InvalidUserTypeHeader_ThrowsUnauthorizedAccessException()
        {
            var headers = new HeaderDictionary
            {
                { "Authorization-UserId", "123" },
                { "Authorization-UserType", "not-a-valid-enum" },
                { "Authorization-Jti", "jti-value" },
                { "Authorization-LocationId", "456" }
            };
            var accessor = CreateAccessorWithHeaders(headers);
            var context = new CurrentUserContext(accessor);

            Assert.Throws<UnauthorizedAccessException>(() => _ = context.UserType);
        }

        [Fact]
        public void InvalidLocationIdHeader_ThrowsUnauthorizedAccessException()
        {
            var headers = new HeaderDictionary
            {
                { "Authorization-UserId", "123" },
                { "Authorization-UserType", UserTypeEnum.Admin.ToString() },
                { "Authorization-Jti", "jti-value" },
                { "Authorization-LocationId", "not-an-int" }
            };
            var accessor = CreateAccessorWithHeaders(headers);
            var context = new CurrentUserContext(accessor);

            Assert.Throws<UnauthorizedAccessException>(() => _ = context.LocationId);
        }
    }
}