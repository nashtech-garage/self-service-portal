using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace API.Exceptions
{
    [ExcludeFromCodeCoverage]
    public class TooManyRequestsException : Exception
    {
        public TooManyRequestsException() : base() { }
        public TooManyRequestsException(string message) : base(message) { }
    }
}