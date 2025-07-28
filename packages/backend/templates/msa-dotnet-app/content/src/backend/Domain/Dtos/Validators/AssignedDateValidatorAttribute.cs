using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Validators
{
    [ExcludeFromCodeCoverage]
    public class AssignedDateValidatorAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is not DateTime dateTime || dateTime == default)
            {
                return new ValidationResult("Assigned date is required.");
            }

            // Get current date with time component set to 00:00:00 for fair comparison
            var today = DateTime.Now.Date;

            // Compare only the date parts
            if (dateTime.Date < today)
            {
                return new ValidationResult("Assigned date cannot be in the past. Please select today or a future date.");
            }
            var maxDate = today.AddYears(1);
            if (dateTime.Date > maxDate)
            {
                return new ValidationResult("Assigned date cannot be more than 1 year from today.");
            }

            return ValidationResult.Success;
        }
    }
}