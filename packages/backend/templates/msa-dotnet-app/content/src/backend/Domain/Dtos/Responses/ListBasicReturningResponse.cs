using Domain.Common.Enum;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class ListBasicReturningResponse
    {
        public int Id { get; set; } = default!;
        public string AssetCode { get; set; } = default!;
        public string AssetName { get; set; } = default!;
        public string RequestedBy { get; set; } = default!;
        public DateTime AssignedDate { get; set; } = default!;
        public string AcceptedBy { get; set; } = default!;
        public DateTime? ReturnedDate { get; set; }
        public ReturningRequestStateEnum State { get; set; }
    }
}
