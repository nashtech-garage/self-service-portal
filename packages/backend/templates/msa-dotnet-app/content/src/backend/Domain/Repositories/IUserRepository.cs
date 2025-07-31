using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Domain.Dtos;
using Domain.Dtos.Requests;
using Domain.Entities;

namespace Domain.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<(IEnumerable<User> Users, int TotalCount)> GetPagedAsync(GetListUserRequest parameters, int userId);
        Task<User?> GetAsync(int userId, Expression<Func<User, bool>>? filter = null, string? includeProperties = null);
    }
}