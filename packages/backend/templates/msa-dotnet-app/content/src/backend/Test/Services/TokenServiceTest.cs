using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using API.Exceptions;
using API.Services;
using Domain.Dtos.Common;
using Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Moq;

namespace Test.Services
{
    public class TokenServiceTest
    {
        private readonly TokenSettings _tokenSettings;
        private readonly Mock<IOptions<TokenSettings>> _optionsMock;
        private readonly TokenService _service;
        private readonly User _user;

        public TokenServiceTest()
        {
            _tokenSettings = new TokenSettings
            {
                Key = "super_secret_key_1234567890_ABCDEFGH",
                Issuer = "TestIssuer",
                Audience = "TestAudience",
                AccessTokenExpirationHours = 1,
                SigninCredentials = SecurityAlgorithms.HmacSha256
            };
            _optionsMock = new Mock<IOptions<TokenSettings>>();
            _optionsMock.Setup(o => o.Value).Returns(_tokenSettings);

            _service = new TokenService(_optionsMock.Object);

            _user = new User
            {
                Id = 42,
                UserType = Domain.Common.Enum.UserTypeEnum.Admin
            };
        }

        [Fact]
        public async Task GenerateToken_ReturnsValidJwt_WithCorrectClaims()
        {
            // Arrange
            var jti = Guid.NewGuid().ToString();

            // Act
            var token = await _service.GenerateToken(_user, jti);

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(token));
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            Assert.Equal(_user.Id.ToString(), jwt.Claims.First(c => c.Type == "userId").Value);
            Assert.Equal(((int)_user.UserType).ToString(), jwt.Claims.First(c => c.Type == "userType").Value);
            Assert.Equal(jti, jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value);
        }

        [Fact]
        public void GenerateRefreshToken_ReturnsValidJwt_WithCorrectClaims()
        {
            // Arrange
            var jti = Guid.NewGuid().ToString();

            // Act
            var token = _service.GenerateRefreshToken(_user, jti);

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(token));
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            Assert.Equal(_user.Id.ToString(), jwt.Claims.First(c => c.Type == "userId").Value);
            Assert.Equal(jti, jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value);
        }

        [Fact]
        public async Task ValidateToken_ValidToken_ReturnsClaimsPrincipal()
        {
            // Arrange
            var jti = Guid.NewGuid().ToString();
            var token = await _service.GenerateToken(_user, jti);

            // Act
            var principal = _service.ValidateToken(token);

            // Assert
            Assert.NotNull(principal);
            Assert.Equal(_user.Id.ToString(), principal.FindFirst("userId")?.Value);
            Assert.Equal(((int)_user.UserType).ToString(), principal.FindFirst("userType")?.Value);
            Assert.Equal(jti, principal.FindFirst(JwtRegisteredClaimNames.Jti)?.Value);
        }

        [Fact]
        public void ValidateToken_InvalidToken_ThrowsUnAuthorizedException()
        {
            // Arrange
            var invalidToken = "invalid.token.value";

            // Act & Assert
            Assert.Throws<UnAuthorizedException>(() => _service.ValidateToken(invalidToken));
        }
    }
}