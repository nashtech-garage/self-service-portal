using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Common;
using Domain.Common.Enum;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ReturningRequestRepository : IReturningRequestRepository
    {
        private readonly ApplicationDbContext _context;

        public ReturningRequestRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public IQueryable<ReturningRequest> Queryable => _context.ReturningRequests.AsQueryable();

        public IUnitOfWork UnitOfWork => _context;

        public async Task<ReturningRequest> AddAsync(ReturningRequest entity)
        {
            await _context.ReturningRequests.AddAsync(entity);

            return entity;
        }

        public Task<IEnumerable<ReturningRequest>> AddRangeAsync(IEnumerable<ReturningRequest> entities)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(ReturningRequest entity)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(object id)
        {
            throw new NotImplementedException();
        }

        public Task DeleteRangeAsync(IEnumerable<ReturningRequest> entities)
        {
            throw new NotImplementedException();
        }

        public Task DeleteRangeAsync(IEnumerable<object> ids)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateAsync(ReturningRequest entity)
        {
            _context.ReturningRequests.Update(entity);
            await Task.CompletedTask;
        }

        public Task UpdateRangeAsync(IEnumerable<ReturningRequest> entities)
        {
            throw new NotImplementedException();
        }

        public async Task<PaginationData<ReturningRequest>> GetReturningRequestsAsync(GetListReturningRequest request, int locationId)
        {
            var query = _context.ReturningRequests
                .AsNoTracking()
                .Include(a => a.Assignment)
                .ThenInclude(Assignment => Assignment.Asset)
                .Include(a => a.AcceptedByUser)
                .Include(a => a.RequestedByUser)
                .WithoutDeleted();

            if (!string.IsNullOrEmpty(request.KeySearch))
            {
                var keySearch = request.KeySearch.Trim().ToLower();
                query = query.Where(a =>
                    a.Assignment.Asset.Code.ToLower().Contains(keySearch) ||
                    a.Assignment.Asset.Name.ToLower().Contains(keySearch) ||
                    a.RequestedByUser.Username.ToLower().Contains(keySearch)
                );
            }

            if (request.State != null && request.State.Count > 0)
            {
                query = query.Where(a => request.State.Contains(a.State));
            }

            if (request.ReturnedDate.HasValue)
            {
                var date = request.ReturnedDate.Value.Date;
                query = query.Where(a => a.ReturnDate == date);
            }

            query = query.Where(a => a.Assignment.Asset.LocationId == locationId);

            var total = await query.CountAsync();

            query = query.ApplySorting(request.SortBy, request.Direction);

            var returningRequests = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            return new PaginationData<ReturningRequest>(returningRequests, request.PageSize, request.Page, total);
        }

        public async Task<List<int>> GetReturningAssignmentIdsAsync(List<int> assignmentIds)
        {
            return await Queryable
                .WithoutDeleted()
                .Where(r => assignmentIds.Contains(r.AssignmentId) && r.State == ReturningRequestStateEnum.WaitingForReturning)
                .Select(r => r.AssignmentId)
                .Distinct()
                .ToListAsync();
        }
    }
}