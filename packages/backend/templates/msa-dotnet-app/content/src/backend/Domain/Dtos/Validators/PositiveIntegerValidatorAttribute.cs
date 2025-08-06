using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Domain.Dtos.Validators
{
    [ExcludeFromCodeCoverage]
    public class PositiveIntegerValidatorAttribute : ValidationAttribute
    {
        public string FieldName { get; set; }

        public PositiveIntegerValidatorAttribute(string fieldName = "Value")
        {
            FieldName = fieldName;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
            {
                return new ValidationResult($"{FieldName} is required.");
            }

            if (value is int intValue && intValue <= 0)
            {
                return new ValidationResult($"{FieldName} must be a positive integer.");
            }

            return ValidationResult.Success;
        }
    }
}
