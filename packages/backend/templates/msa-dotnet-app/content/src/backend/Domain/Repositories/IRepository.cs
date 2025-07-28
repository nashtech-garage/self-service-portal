using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Repositories
{
    public interface IRepository<TEntity> where TEntity : class
    {
        Task<TEntity> AddAsync(TEntity entity);
        Task<IEnumerable<TEntity>> AddRangeAsync(IEnumerable<TEntity> entities);

        IQueryable<TEntity> Queryable { get; }
        IUnitOfWork UnitOfWork { get; }

        Task UpdateAsync(TEntity entity);
        Task UpdateRangeAsync(IEnumerable<TEntity> entities);

        Task DeleteAsync(TEntity entity);
        Task DeleteAsync(object id);
        Task DeleteRangeAsync(IEnumerable<TEntity> entities);
        Task DeleteRangeAsync(IEnumerable<object> ids);
    }
}