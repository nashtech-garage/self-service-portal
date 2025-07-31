using System.Diagnostics.CodeAnalysis;
using Domain.Entities;
using Domain.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Database
{
    [ExcludeFromCodeCoverage]
    public class ApplicationDbContext : DbContext, IUnitOfWork
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            IHttpContextAccessor httpContextAccessor) : base(options)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        // Add your DbSet here
        public DbSet<User> Users { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<ReturningRequest> ReturningRequests { get; set; }
        public DbSet<Asset> Assets { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<State> States { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            HandleChangeStateEntity();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void HandleChangeStateEntity()
        {
            var headers = _httpContextAccessor.HttpContext?.Request?.Headers;

            var userId = 0;
            if (headers != null && headers.TryGetValue("Authorization-UserId", out var userIdValue))
            {
                userId = !string.IsNullOrEmpty(userIdValue) ? int.Parse(userIdValue.ToString()) : 0;
            }

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is BaseEntity)
                {
                    switch (entry.State)
                    {
                        case EntityState.Added:
                            entry.CurrentValues["IsDeleted"] = false;
                            entry.CurrentValues["CreatedBy"] = userId;
                            break;

                        case EntityState.Deleted:
                            entry.State = EntityState.Modified;
                            entry.CurrentValues["IsDeleted"] = true;
                            break;
                    }
                }
            }
        }
    }
}