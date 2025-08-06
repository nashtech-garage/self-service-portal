using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Database;

namespace Infrastructure.Repositories
{
    public class AssetRepository : IAssetRepository
    {
        private readonly ApplicationDbContext _context;

        public AssetRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }
        

        public IQueryable<Asset> Queryable => _context.Assets.AsQueryable();


        public IUnitOfWork UnitOfWork => _context;

        public async Task<Asset> AddAsync(Asset entity)
        {
            await _context.Assets.AddAsync(entity);

            return entity;
        }


        public Task<IEnumerable<Asset>> AddRangeAsync(IEnumerable<Asset> entities)
        {
            throw new NotImplementedException();
        }

        public async Task DeleteAsync(Asset entity)
        {
            _context.Assets.Remove(entity);
            await Task.CompletedTask;
        }


        public Task DeleteAsync(object id)
        {
            throw new NotImplementedException();
        }


        public Task DeleteRangeAsync(IEnumerable<Asset> entities)
        {
            throw new NotImplementedException();
        }


        public Task DeleteRangeAsync(IEnumerable<object> ids)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateAsync(Asset entity)
        {
            _context.Assets.Update(entity);
            await Task.CompletedTask;
        }


        public Task UpdateRangeAsync(IEnumerable<Asset> entities)
        {
            throw new NotImplementedException();
        }
    }
}
