using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Dtos.Validators
{
    [ExcludeFromCodeCoverage]
    public class InstalledDateValidatorAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is not DateTime dateTime || dateTime == default)
            {
                return new ValidationResult("Installed date is required.");
            }

            if (dateTime > DateTime.Now)
            {
                return new ValidationResult("Installed date cannot be in the future.");
            }

            return ValidationResult.Success;
        }
    }
}
