using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Common.Enum
{
    /// <summary>
    ///  Available: asset does not belong to any assignment and is in good condition <br/>
    ///  Not available: asset does not belong to any assignment and is being repaired or warranted <br/>
    ///  Assigned: asset belongs to an assignment  <br/>
    ///  Waiting for recycling: asset is not able to use and waiting for recycling <br/>
    ///  Recycled: asset is not able to use and has been recycled <br/>
    /// </summary>
    public enum AssetStateEnum
    {
        Available = 1,
        NotAvailable = 2,
        Assigned = 3,
        WaitingForRecycling = 4,
        Recycled = 5,
    }
}
