using Domain.Common.Constants;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;

[ExcludeFromCodeCoverage]
public class PrefixValidatorAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
    {
        var prefix = value as string;

        if (string.IsNullOrWhiteSpace(prefix))
        {
            return new ValidationResult("Prefix is required.");
        }

        if (prefix.Length != 2)
        {
            return new ValidationResult("Prefix must be exactly 2 characters.");
        }

        if (!Regex.IsMatch(prefix, RegexConstants.PrefixCategoryPattern))
        {
            return new ValidationResult("Prefix must consist of 2 uppercase letters.");
        }

        return ValidationResult.Success!;
    }
}