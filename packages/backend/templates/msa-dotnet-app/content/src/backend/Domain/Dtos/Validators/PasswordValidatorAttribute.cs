using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Domain.Common.Constants;

namespace Domain.Validators
{
    [ExcludeFromCodeCoverage]
    public class PasswordValidatorAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is not string password)
            {
                return new ValidationResult("Password is required.");
            }

            if (!Regex.IsMatch((string)value, RegexConstants.PasswordPattern))
            {
                return new ValidationResult("Password must be 6-100 characters long, contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character (@, #, $, %, &, *).");
            }

            return ValidationResult.Success;
        }
    }
}