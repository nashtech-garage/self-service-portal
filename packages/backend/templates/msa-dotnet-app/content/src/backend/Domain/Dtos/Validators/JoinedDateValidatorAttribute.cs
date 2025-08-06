using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Validators;

[ExcludeFromCodeCoverage]
public class JoinedDateValidatorAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        // check if joined date is null or default
        if (value == null || value is not DateTime joinedDate || joinedDate == default)
        {
            return new ValidationResult("Joined date is required");
        }

        // check if joined date is Saturday or Sunday
        if (joinedDate.DayOfWeek == DayOfWeek.Saturday || joinedDate.DayOfWeek == DayOfWeek.Sunday)
        {
            return new ValidationResult("Joined date is Saturday or Sunday. Please select a different date");
        }

        // check if joined date is later than date of birth
        var properties = validationContext.ObjectType.GetProperties();

        var dateOfBirthProperty = properties.FirstOrDefault(p => p.Name == "DateOfBirth");

        if (dateOfBirthProperty == null)
        {
            return new ValidationResult("Date of birth is required");
        }

        var dateOfBirthValue = dateOfBirthProperty.GetValue(validationContext.ObjectInstance);

        if (dateOfBirthValue == null)
        {
            return new ValidationResult("Date of birth is required");
        }

        var dateOfBirth = (DateTime)dateOfBirthValue;

        if (joinedDate <= dateOfBirth)
        {
            return new ValidationResult("Joined date is not later than Date of birth. Please select a different date");
        }

        // check if age is between 18 and 60
        var today = DateTime.UtcNow.Date;

        var age = today.Year - dateOfBirth.Year;

        if (dateOfBirth.Date > today.AddYears(-age))
        {
            age--;
        }

        if (age < 18)
        {
            return new ValidationResult("User is under 18. Please select a different date");
        }

        if (age > 60)
        {
            return new ValidationResult("User is over 60. Please select a different date");
        }

        return ValidationResult.Success;
    }
} 