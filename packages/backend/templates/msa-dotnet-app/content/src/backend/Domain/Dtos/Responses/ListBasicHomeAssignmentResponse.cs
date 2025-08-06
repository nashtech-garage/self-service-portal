using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Common.Enum;

namespace Domain.Dtos.Responses
{
    [ExcludeFromCodeCoverage]
    public class ListBasicHomeAssignmentResponse
    {
        public int Id { get; set; }
        public string AssetCode { get; set; } = default!;
        public string AssetName { get; set; } = default!;
        public string AssetCategoryName { get; set; } = default!;
        public DateTime AssignedDate { get; set; }
        public AssignmentStateEnum State { get; set; }
        public bool IsReturningRequested { get; set; } = false;
    }
}
