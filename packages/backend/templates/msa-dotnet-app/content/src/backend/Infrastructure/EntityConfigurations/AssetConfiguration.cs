using System.Diagnostics.CodeAnalysis;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Database.Configurations
{
    [ExcludeFromCodeCoverage]
    public class AssetConfiguration : EntityConfiguration<Asset>
    {
        public override void Configure(EntityTypeBuilder<Asset> builder)
        {
            base.Configure(builder);

            builder.ToTable("assets");

            builder.Property(p => p.Code)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(p => p.Name)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(p => p.Specification)
                   .HasMaxLength(500)
                   .IsRequired();

            builder.Property(p => p.State)
                   .IsRequired();

            builder.HasOne(p => p.Category)
                   .WithMany()
                   .HasForeignKey(p => p.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.Location)
                   .WithMany()
                   .HasForeignKey(p => p.LocationId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}