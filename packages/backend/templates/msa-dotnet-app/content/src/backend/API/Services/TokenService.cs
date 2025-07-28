using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Exceptions;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Dtos.Common;
using Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class TokenService : ITokenService
    {
        private readonly TokenSettings _tokenSettings;

        public TokenService(
            IOptions<TokenSettings> tokenSettings)
        {
            _tokenSettings = tokenSettings.Value ?? throw new ArgumentNullException(nameof(tokenSettings.Value));
        }

        public async Task<string> GenerateToken(User user, string jti)
        {
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_tokenSettings.Key));

            var signinCredentials = new SigningCredentials(secretKey, _tokenSettings.SigninCredentials);

            var claims = new List<Claim>
            {
                new Claim("userId", user.Id.ToString()),
                new Claim("userType", ((int)user.UserType).ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, jti)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(_tokenSettings.AccessTokenExpirationHours),
                SigningCredentials = signinCredentials,
                Issuer = _tokenSettings.Issuer,
                Audience = _tokenSettings.Audience,
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var token = tokenHandler.CreateToken(tokenDescriptor);

            await Task.CompletedTask;

            return tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken(User user, string jti)
        {
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_tokenSettings.Key));

            var signinCredentials = new SigningCredentials(secretKey, _tokenSettings.SigninCredentials);

            var claims = new List<Claim>
            {
                new Claim("userId", user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, jti)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(_tokenSettings.AccessTokenExpirationHours + AuthConstant.BONUS_HOUR_REFRESH_TOKEN),
                SigningCredentials = signinCredentials,
                Issuer = _tokenSettings.Issuer,
                Audience = _tokenSettings.Audience,
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var refreshToken = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(refreshToken);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var key = Encoding.UTF8.GetBytes(_tokenSettings.Key);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.Zero,
                RequireExpirationTime = true
            };

            try
            {
                var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

                return principal;
            }
            catch (SecurityTokenExpiredException)
            {
                throw new UnAuthorizedException("Token is expired");
            }
            catch (SecurityTokenValidationException ex)
            {
                throw new UnAuthorizedException($"Authentication Failed : {ex.Message}");
            }
            catch (Exception ex)
            {
                throw new UnAuthorizedException($"Authentication Failed : {ex.Message}");
            }
        }
    }
}