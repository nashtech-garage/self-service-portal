using System.Diagnostics.CodeAnalysis;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Database.Configurations
{
    [ExcludeFromCodeCoverage]
    public class AssignmentConfiguration : EntityConfiguration<Assignment>
    {
        public override void Configure(EntityTypeBuilder<Assignment> builder)
        {
            base.Configure(builder);

            builder.ToTable("assignments");

            builder.Property(p => p.Note)
                   .HasMaxLength(500);

            builder.Property(p => p.State)
                   .IsRequired();

            builder.HasOne(p => p.Asset)
                   .WithMany()
                   .HasForeignKey(p => p.AssetId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.AssignedToUser)
                   .WithMany()
                   .HasForeignKey(p => p.AssignedTo)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.AssignedByUser)
                   .WithMany()
                   .HasForeignKey(p => p.AssignedBy)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
