using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;
using Domain.Common.Constants;

namespace Domain.Dtos.Validators;

[ExcludeFromCodeCoverage]
public class NameValidatorAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null)
        {
            return new ValidationResult($"{validationContext.DisplayName} is required");
        }

        var name = value.ToString();

        if (string.IsNullOrWhiteSpace(name))
        {
            return new ValidationResult($"{validationContext.DisplayName} is required");
        }

        var regex = new Regex(RegexConstants.NamePattern);

        if (!regex.IsMatch(name))
        {
            return new ValidationResult($"{validationContext.DisplayName} only allows letters, numbers, apostrophe (') and underscore (_).");
        }

        if (name.Length < 2 || name.Length > 50)
        {
            return new ValidationResult($"{validationContext.DisplayName} must be between 2 and 50 characters");
        }

        return ValidationResult.Success;
    }
}