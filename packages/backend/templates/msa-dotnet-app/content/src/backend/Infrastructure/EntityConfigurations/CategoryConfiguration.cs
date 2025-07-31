using System.Diagnostics.CodeAnalysis;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Database.Configurations
{
    [ExcludeFromCodeCoverage]
    public class CategoryConfiguration : EntityConfiguration<Category>
    {
        public override void Configure(EntityTypeBuilder<Category> builder)
        {
            base.Configure(builder);

            builder.ToTable("categories");

            builder.Property(p => p.Code)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(p => p.Name)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.HasIndex(p => p.Code)
                   .IsUnique();
        }
    }
}
