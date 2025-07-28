using Domain.Common.Constants;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Domain.Dtos.Validators
{
    [ExcludeFromCodeCoverage]
    public class SpecificationValidatorAttribute : ValidationAttribute
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

            if (name.Length < 2 || name.Length > 500)
            {
                return new ValidationResult($"{validationContext.DisplayName} must be between 2 and 500 characters");
            }

            return ValidationResult.Success;
        }
    }
}
