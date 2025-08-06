using System.Diagnostics.CodeAnalysis;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Database.Configurations
{
    [ExcludeFromCodeCoverage]
    public class UserConfiguration : EntityConfiguration<User>
    {
        public override void Configure(EntityTypeBuilder<User> builder)
        {
            base.Configure(builder);

            builder.ToTable("users");

            builder.Property(p => p.FirstName)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(p => p.LastName)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(p => p.StaffCode)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(p => p.Username)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(p => p.PasswordHash)
                   .HasMaxLength(255)
                   .IsRequired();

            builder.HasIndex(p => p.Username)
                   .IsUnique();

            builder.HasIndex(p => p.StaffCode)
                   .IsUnique();

            builder.Property(p => p.LocationId)
                   .IsRequired();

            builder.HasOne(p => p.Location)
                   .WithMany()
                   .HasForeignKey(p => p.LocationId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
