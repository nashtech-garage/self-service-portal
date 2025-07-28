using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Domain.Common;
using Domain.Common.Constants;
using Domain.Dtos;
using Domain.Dtos.Requests;
using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }
        public IQueryable<User> Queryable => _context.Users.AsQueryable();

        public IUnitOfWork UnitOfWork => _context;

        public async Task<(IEnumerable<User> Users, int TotalCount)> GetPagedAsync(GetListUserRequest parameters, int userId)
        {
            IQueryable<User> query = Queryable.AsNoTracking();

            var adminLocationId = await query
                .Where(c => c.Id == userId)
                .Select(c => c.LocationId)
                .FirstOrDefaultAsync();

            if (parameters.SortBy.Equals("fullname", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.LocationId == adminLocationId)
                    .WithoutDeleted()
                    .WithoutDisabledUser();

                query = parameters.Direction.Equals("desc", StringComparison.OrdinalIgnoreCase)
                    ? query.OrderByDescending(c => c.FirstName).ThenByDescending(c => c.LastName)
                    : query.OrderBy(c => c.FirstName).ThenBy(c => c.LastName);
            }
            else 
            {
                query = query.Where(c => c.LocationId == adminLocationId)
                    .ApplySorting(parameters.SortBy, parameters.Direction)
                    .WithoutDeleted()
                    .WithoutDisabledUser();
            }

            if (!string.IsNullOrEmpty(parameters.KeySearch))
            {
                var keySearchLower = parameters.KeySearch.Trim().ToLower();

                query = query.Where(c =>
                    c.Username.ToLower().Contains(keySearchLower)
                    || c.StaffCode.ToLower().Contains(keySearchLower)
                    || (c.FirstName + " " + c.LastName).ToLower().Contains(keySearchLower)
                );
            }

            if (parameters.UserType != null && parameters.UserType.Count > 0)
            {
                query = query.Where(c => parameters.UserType.Contains(c.UserType));
            }

            var totalCount = await query.CountAsync();

            var users = await query
                .Skip((parameters.Page - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();

            return (users, totalCount);
        }

        public async Task<User> AddAsync(User entity)
        {
            await _context.Users.AddAsync(entity);

            return entity;
        }

        public Task<IEnumerable<User>> AddRangeAsync(IEnumerable<User> entities)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(User entity)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(object id)
        {
            throw new NotImplementedException();
        }

        public Task DeleteRangeAsync(IEnumerable<User> entities)
        {
            throw new NotImplementedException();
        }

        public Task DeleteRangeAsync(IEnumerable<object> ids)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateAsync(User entity)
        {
            _context.Update(entity);
            await Task.CompletedTask;
        }

        public Task UpdateRangeAsync(IEnumerable<User> entities)
        {
            throw new NotImplementedException();
        }

        public async Task<User?> GetAsync(int userId, Expression<Func<User, bool>>? filter = null, string? includeProperties = null)
        {
            IQueryable<User> query = Queryable;

            var adminLocationId = await query
                .Where(c => c.Id == userId)
                .Select(c => c.LocationId)
                .FirstOrDefaultAsync();

            query = query.Where(c => c.LocationId == adminLocationId).WithoutDeleted();

            if (filter != null)
            {
                query = query.Where(filter);
            }

            if (!string.IsNullOrWhiteSpace(includeProperties))
            {
                foreach (var includeProp in includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp);
                }
            }

            return await query.FirstOrDefaultAsync();
        }
    }
}