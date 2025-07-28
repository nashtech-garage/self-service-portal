using System;
using API.Services.Abstracts;
using Domain.Common.Enum;
using Microsoft.AspNetCore.Http;

namespace API.Services
{
    public class CurrentUserContext : ICurrentUserContext
    {
        private readonly int? _userId;
        private readonly int? _userType;
        private readonly string? _jti;
        private readonly int? _locationId;

        public CurrentUserContext(IHttpContextAccessor httpContextAccessor)
        {
            var headers = httpContextAccessor.HttpContext?.Request?.Headers;

            if (headers != null)
            {
                if (headers.TryGetValue("Authorization-UserId", out var userIdStr) &&
                    int.TryParse(userIdStr.ToString(), out var userId))
                {
                    _userId = userId;
                }

                if (headers.TryGetValue("Authorization-UserType", out var userTypeStr) &&
                    Enum.TryParse<UserTypeEnum>(userTypeStr.ToString(), out var userTypeEnum))
                {
                    _userType = (int)userTypeEnum;
                }

                if (headers.TryGetValue("Authorization-Jti", out var jtiStr))
                {
                    _jti = jtiStr.ToString();
                }

                if (headers.TryGetValue("Authorization-LocationId", out var locationIdStr) &&
                    int.TryParse(locationIdStr.ToString(), out var locationId))
                {
                    _locationId = locationId;
                }
            }
        }

        public int UserId => _userId ?? throw new UnauthorizedAccessException("UserId is not available.");
        public int UserType => _userType ?? throw new UnauthorizedAccessException("UserType is not available.");
        public string Jti => _jti ?? throw new UnauthorizedAccessException("Jti is not available.");
        public int LocationId => _locationId ?? throw new UnauthorizedAccessException("Location id is not available.");
    }
}
