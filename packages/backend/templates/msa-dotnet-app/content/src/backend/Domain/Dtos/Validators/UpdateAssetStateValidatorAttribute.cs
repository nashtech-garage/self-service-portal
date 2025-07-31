using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Domain.Common.Enum;

namespace Domain.Dtos.Validators
{
    [ExcludeFromCodeCoverage]
    public class UpdateAssetStateValidatorAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
        {
            if (value is AssetStateEnum state)
            {
                if (state == AssetStateEnum.Available ||
                    state == AssetStateEnum.NotAvailable ||
                    state == AssetStateEnum.WaitingForRecycling ||
                    state == AssetStateEnum.Recycled)
                {
                    return ValidationResult.Success!;
                }
                else
                {
                    return new ValidationResult("The selected asset state is not allowed for updating.");
                }
            }

            return new ValidationResult("Invalid asset state.");
        }
    }
}
