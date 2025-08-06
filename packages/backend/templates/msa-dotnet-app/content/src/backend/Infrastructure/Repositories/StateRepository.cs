using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Database;

namespace Infrastructure.Repositories;

public class StateRepository : IStateRepository
{
    private readonly ApplicationDbContext _context;
    public StateRepository(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public IQueryable<State> Queryable => _context.States.AsQueryable();

    public IUnitOfWork UnitOfWork => _context;

    public async Task<State> AddAsync(State entity)
    {
        await _context.States.AddAsync(entity);

        return entity;
    }

    public Task<IEnumerable<State>> AddRangeAsync(IEnumerable<State> entities)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(State entity)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(object id)
    {
        throw new NotImplementedException();
    }

    public Task DeleteRangeAsync(IEnumerable<State> entities)
    {
        throw new NotImplementedException();
    }

    public Task DeleteRangeAsync(IEnumerable<object> ids)
    {
        throw new NotImplementedException();
    }

    public Task UpdateAsync(State entity)
    {
        throw new NotImplementedException();
    }

    public Task UpdateRangeAsync(IEnumerable<State> entities)
    {
        throw new NotImplementedException();
    }
}
