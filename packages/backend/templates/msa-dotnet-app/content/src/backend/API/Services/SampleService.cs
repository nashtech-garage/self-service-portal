using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Services.Abstracts;
using Domain.Common.Constants;
using Domain.Dtos.Responses;
using Domain.Extensions;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace API.Services
{
    public class SampleService : ISampleService
    {
        private readonly IUserRepository _userRepository;
        private readonly IDatabase _redis;
        private readonly ILogger _logger;

        public SampleService(
            IUserRepository userRepository,
            IConnectionMultiplexer connectionMultiplexer,
            ILogger<SampleService> logger)
        {
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _redis = connectionMultiplexer.GetDatabase() ?? throw new ArgumentNullException(nameof(connectionMultiplexer));
            _logger = logger;
        }

        public async Task<SampleResponse?> SampleGetAsync()
        {
            var dataSample = await _userRepository.Queryable.FirstOrDefaultAsync();

            return dataSample is not null ? new SampleResponse
            {
                Id = dataSample.Id,
                Username = dataSample.Username
            } : null;
        }

        public async Task SyncRedisAsync()
        {
            await _redis.KeyDeleteAsync(AuthConstant.UsernameList);
            var usernames = await _userRepository
                .Queryable.AsNoTracking().Select(u => new
                {
                    Username = u.Username,
                }).ToListAsync();

            foreach (var username in usernames)
            {
                var hashedUsername = StringExtension.HashStringCRC32(username.Username);

                _logger.LogInformation("Hashed {0} ===> {1}", username.Username, hashedUsername);
                await _redis.StringSetBitAsync(AuthConstant.UsernameList, hashedUsername, true);
            }
        }
    }
}