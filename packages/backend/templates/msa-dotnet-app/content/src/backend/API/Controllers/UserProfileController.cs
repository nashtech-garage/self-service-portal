using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Attributes;
using API.Services.Abstracts;
using AutoMapper;
using Domain.Common.Constants;
using Domain.Common.Enum;
using Domain.Dtos.Responses;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/me")]
    [Authenticate(UserTypeEnum.Admin, UserTypeEnum.Staff)]
    [RequestTimeout(ConfigConstants.ShortTimeout)]
    public class UserProfileController : APIController<UserProfileController>
    {
        private readonly IMapper _mapper;

        public UserProfileController(
            IHttpContextAccessor httpContextAccessor,
            ILogger<UserProfileController> logger,
            IAuthService authService,
            IMapper mapper) : base(httpContextAccessor, logger, authService)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        [HttpGet]
        public async Task<IActionResult> GetMe()
        {
            var me = _mapper.Map<GetMeResponse>(await GetAuth());

            return OkResponse<GetMeResponse>(me, "Get data successfully");
        }
    }
}