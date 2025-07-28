using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Common.Enum;

namespace API.Services.Abstracts
{
    public interface ICurrentUserContext
    {
        public int UserId { get; }
        public int UserType { get; }
        public string Jti { get; }
        public int LocationId { get; } 
    }
}
