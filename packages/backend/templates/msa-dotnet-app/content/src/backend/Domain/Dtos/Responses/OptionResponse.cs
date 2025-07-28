using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class OptionResponse
    {
        public virtual int Value { get; set; }
        public virtual string Name { get; set; } = default!;
    }
}
