using System.Diagnostics.CodeAnalysis;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Database.Configurations
{
    [ExcludeFromCodeCoverage]
    public class ReturningRequestConfiguration : EntityConfiguration<ReturningRequest>
    {
        public override void Configure(EntityTypeBuilder<ReturningRequest> builder)
        {
            base.Configure(builder);

            builder.ToTable("returning_requests");

            builder.Property(p => p.State)
                   .IsRequired();

            builder.HasOne(p => p.Assignment)
                   .WithMany()
                   .HasForeignKey(p => p.AssignmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.AcceptedByUser)
                   .WithMany()
                   .HasForeignKey(p => p.AcceptedBy)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.RequestedByUser)
                   .WithMany()
                   .HasForeignKey(p => p.RequestedBy)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}