using Domain.Dtos.Validators;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Dtos.Requests
{
    [ExcludeFromCodeCoverage]
    public class CreateCategoryRequest
    {
        [PrefixValidator]
        public string Prefix { get; set; } = default!;

        [NameValidator]
        public string Category { get; set; } = default!;
    }
}
