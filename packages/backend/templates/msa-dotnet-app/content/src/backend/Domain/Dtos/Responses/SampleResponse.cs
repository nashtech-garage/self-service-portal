using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Dtos.Responses
{
    // This is an example response
    [ExcludeFromCodeCoverage]
    public class SampleResponse
    {
        public int Id { get; set; }
        public string Username { get; set; } = default!;
    }
}