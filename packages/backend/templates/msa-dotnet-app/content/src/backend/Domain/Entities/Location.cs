using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    [ExcludeFromCodeCoverage]
    public class Location : BaseEntity
    {
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
    }
}
