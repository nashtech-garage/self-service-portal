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
    public class AssignmentRepository : IAssignmentRepository
    {
        private readonly ApplicationDbContext _context;

        public AssignmentRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public IQueryable<Assignment> Queryable => _context.Assignments.AsQueryable();

        public IUnitOfWork UnitOfWork => _context;

        public async Task<Assignment> AddAsync(Assignment entity)
        {
            // Set default state for new assignment
            entity.State = AssignmentStateEnum.WaitingForAcceptance;

            var result = await _context.Assignments.AddAsync(entity);
            return result.Entity;
        }

        public Task<IEnumerable<Assignment>> AddRangeAsync(IEnumerable<Assignment> entities)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(Assignment entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            _context.Assignments.Remove(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(object id)
        {
            throw new NotImplementedException();
        }

        public Task DeleteRangeAsync(IEnumerable<Assignment> entities)
        {
            throw new NotImplementedException();
        }

        public Task DeleteRangeAsync(IEnumerable<object> ids)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateAsync(Assignment entity)
        {
            _context.Assignments.Update(entity);
            await Task.CompletedTask;
        }

        public Task UpdateRangeAsync(IEnumerable<Assignment> entities)
        {
            throw new NotImplementedException();
        }

        public async Task<PaginationData<Assignment>> GetHomeAssignmentsForUserAsync(GetListHomeAssignmentRequest request, int userId)
        {
            var today = DateTime.UtcNow.Date;

            var query = Queryable;

            query = query
                .WithoutDeleted()
                .ApplySorting(request.SortBy, request.Direction)
                .Where(x => x.AssignedTo == userId && x.AssignedDate.Date <= today && x.State != AssignmentStateEnum.Declined && x.State != AssignmentStateEnum.Returned);

            var total = await query.CountAsync();

            var data = await query
                .AsNoTracking()
                .Include(x => x.Asset)
                .Include(x => x.Asset.Category)
                .Skip(request.PageSize * (request.Page - 1))
                .Take(request.PageSize)
                .ToListAsync();

            return new PaginationData<Assignment>(data, request.PageSize, request.Page, total);
        }

        public async Task<PaginationData<Assignment>> GetAssignmentsAdminAsync(GetListAssignmentAdminRequest request, int locationId)
        {
            var query = _context.Assignments
                .AsNoTracking()
                .Include(a => a.Asset)
                .Include(a => a.AssignedToUser)
                .Include(a => a.AssignedByUser)
                .Include(a => a.Asset.Location)
                .WithoutDeleted();

            if (!string.IsNullOrEmpty(request.KeySearch))
            {
                var keySearch = request.KeySearch.Trim().ToLower();
                query = query.Where(a =>
                    a.Asset.Code.ToLower().Contains(keySearch) ||
                    a.Asset.Name.ToLower().Contains(keySearch) ||
                    a.AssignedToUser.Username.ToLower().Contains(keySearch)
                );
            }

            if (request.State != null && request.State.Count > 0)
            {
                query = query.Where(a => request.State.Contains(a.State));
            }

            if (request.AssignedDate.HasValue)
            {
                var date = request.AssignedDate.Value.Date;
                query = query.Where(a => a.AssignedDate == date);
            }

            query = query.Where(a => a.Asset.LocationId == locationId && a.State != AssignmentStateEnum.Returned);

            var total = await query.CountAsync();

            query = query.ApplySorting(request.SortBy, request.Direction);

            var assignments = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            return new PaginationData<Assignment>(assignments, request.PageSize, request.Page, total);
        }
    }
}